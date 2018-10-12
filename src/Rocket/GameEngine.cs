using Microsoft.Extensions.Logging;
using Rocket.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace Rocket
{
    public class GameEngine : IGameEngine
    {
        private readonly List<string> _colors = new List<string>
            { "yellow", "red", "green", "blue", "gray", "black", "pink", "purple" };

        private int _runningPlayerCount = 0;
        private int _runningShotCount = 0;
        private readonly ConcurrentDictionary<string, PlayerMetadata> _players = new ConcurrentDictionary<string, PlayerMetadata>();
        private readonly ConcurrentQueue<Shot> _shots = new ConcurrentQueue<Shot>();
        private readonly ILogger<GameEngine> _logger;
        private readonly ITime _time;
        private readonly IRandomGenerator _random;

        public IShotManager ShotManager { get; set; }

        public IPlayerManager PlayerManager { get; set; }

        internal ConcurrentQueue<Shot> Shots => _shots;

        internal ConcurrentDictionary<string, PlayerMetadata> Players => _players;

        internal Constant _gameEngineConstants;

        public GameEngine(ILoggerFactory loggerFactory, ITime time, IRandomGenerator random)
        {
            _logger = loggerFactory.CreateLogger<GameEngine>();
            _time = time;
            _random = random;

            _gameEngineConstants = new Constant();
        }

        public IEnumerable<PlayerMetadata> GetPlayers(Func<PlayerMetadata, bool> predicate)
        {
            return predicate != null ?
                _players.Values.Where(predicate) :
                _players.Values;
        }

        public Tuple<PlayerMetadata, Constant> RemotePlayerConnected(string connectionId)
        {
            using (_logger.BeginScope(nameof(RemotePlayerConnected)))
            {
                _logger.LogInformation(LoggingEvents.PlayerConnected, $"Player Connected {connectionId}");
                if (string.IsNullOrEmpty(connectionId))
                {
                    throw new ArgumentException($"{nameof(connectionId)} is not correctly set.");
                }

                var id = Interlocked.Increment(ref _runningPlayerCount);

                double x = 10000;
                double y = 10000;

                FindAvailableLocation(ref x, ref y);

                var playerMetadata = new PlayerMetadata
                {
                    ID = id,
                    Color = _colors[id % _colors.Count],
                    Player = new Player()
                    {
                        ID = id,
                        X = x,
                        Y = y,
                        Rotation = Math.PI * 3 / 2
                    },
                    ServerTimestamp = _time.ElapsedTicks
                };

                _players.AddOrUpdate(connectionId, playerMetadata, (keyUpdate, playerUpdate) =>
                {
                    throw new ArgumentException($"Duplicate value '{connectionId}' found for parameter {nameof(connectionId)}.");
                });

                return Tuple.Create(playerMetadata, _gameEngineConstants);
            }
        }

        private void FindAvailableLocation(ref double x, ref double y)
        {
            // TODO: Look for good location which is not overlapping with other players.
            foreach (var player in _players)
            {
                x = player.Value.Player.X + 100;
                y = player.Value.Player.Y + 100;
            }

            x += _random.Next(100, 1000);
            y += _random.Next(100, 1000);
        }

        public PlayerMetadata RemotePlayerDisconnected(string connectionId)
        {
            using (_logger.BeginScope(nameof(RemotePlayerDisconnected)))
            {
                _logger.LogInformation(LoggingEvents.PlayerDisconnected, $"Player disconnected {connectionId}");
                _players.TryRemove(connectionId, out var playerMetadata);
                return playerMetadata;
            }
        }

        public RemoteUpdatePlayerResult RemoteUpdatePlayer(string connectionId, Player player, out PlayerMetadata playerMetadata)
        {
            using (_logger.BeginScope(nameof(RemoteUpdatePlayer)))
            {
                if (_players.TryGetValue(connectionId, out var playerMetadataStored))
                {
                    // If player is in animation then it cannot be updated.
                    if (playerMetadataStored.Player.Animation != null)
                    {
                        _logger.LogWarning(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} has still animation {playerMetadataStored.Player.Animation} running for {playerMetadataStored.Player.AnimationTiming}.");
                        playerMetadata = playerMetadataStored;
                        return RemoteUpdatePlayerResult.UpdateSelf;
                    }

                    var now = _time.ElapsedTicks;
                    var deltaClient = (player.Time - playerMetadataStored.Player.Time) / 1000;
                    var deltaServer = (now - playerMetadataStored.ServerTimestamp) / TimeSpan.TicksPerSecond;
                    var delta = Math.Min(deltaClient, deltaServer);

                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} now: {now}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} player.Time: {player.Time}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} playerMetadataStored.Player.Time: {playerMetadataStored.Player.Time}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} playerMetadataStored.ServerTimestamp: {playerMetadataStored.ServerTimestamp}");

                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} deltaClient: {deltaClient}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} deltaServer: {deltaServer}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} delta: {delta}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before player.X: {player.X}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before player.Y: {player.Y}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before player.Speed: {player.Speed}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before player.Rotation: {player.Rotation}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before playerMetadataStored.Player.X: {playerMetadataStored.Player.X}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before playerMetadataStored.Player.Y: {playerMetadataStored.Player.Y}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before playerMetadataStored.Player.Speed: {playerMetadataStored.Player.Speed}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} Before playerMetadataStored.Player.Rotation: {playerMetadataStored.Player.Rotation}");

                    UpdatePlayerFromInput(playerMetadataStored.Player, playerMetadataStored.Player, delta);
                    playerMetadataStored.Player.X += delta * playerMetadataStored.Player.Speed * Math.Cos(playerMetadataStored.Player.Rotation);
                    playerMetadataStored.Player.Y += delta * playerMetadataStored.Player.Speed * Math.Sin(playerMetadataStored.Player.Rotation);

                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} After playerMetadataStored.Player.X: {playerMetadataStored.Player.X}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} After playerMetadataStored.Player.Y: {playerMetadataStored.Player.Y}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} After playerMetadataStored.Player.Speed: {playerMetadataStored.Player.Speed}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} After playerMetadataStored.Player.Rotation: {playerMetadataStored.Player.Rotation}");

                    var deltaX = playerMetadataStored.Player.X - player.X;
                    var deltaY = playerMetadataStored.Player.Y - player.Y;
                    var distance = Math.Sqrt(deltaX * deltaX + deltaY * deltaY);

                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} deltaX: {deltaX}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} deltaY: {deltaY}");

                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} distance from existing location {distance}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} playerMetadataStored.Player.Left: {playerMetadataStored.Player.Left} vs player.Left: {player.Left}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} playerMetadataStored.Player.Right: {playerMetadataStored.Player.Right} vs player.Right: {player.Right}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} playerMetadataStored.Player.Top: {playerMetadataStored.Player.Top} vs player.Top: {player.Top}");
                    _logger.LogDebug(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} playerMetadataStored.Player.Bottom: {playerMetadataStored.Player.Bottom} vs player.Bottom: {player.Bottom}");

                    if (distance > 10)
                    {
                        _logger.LogInformation(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} distance from existing location {distance}");
                        if (distance > 150)
                        {
                            _logger.LogWarning(LoggingEvents.RemoteUpdatePlayerDebug, $"Player{player.ID} distance {distance} too high.");

                            playerMetadataStored.ServerTimestamp = now;
                            player.Speed = 0;
                            player.X = playerMetadataStored.Player.X;
                            player.Y = playerMetadataStored.Player.Y;
                            player.Animation = PlayerAnimations.Explosion;
                            player.AnimationTiming = PlayerAnimations.ExplosionTime;
                            playerMetadata = playerMetadataStored;

                            _players.AddOrUpdate(connectionId, playerMetadataStored, (keyUpdate, playerUpdate) => playerMetadataStored);

                            return RemoteUpdatePlayerResult.UpdateAll;
                        }
                    }

                    // Only update if inputs has changed
                    var inputsChanged = 
                        playerMetadataStored.Player.Left != player.Left ||
                        playerMetadataStored.Player.Right != player.Right ||
                        playerMetadataStored.Player.Top != player.Top ||
                        playerMetadataStored.Player.Bottom != player.Bottom ||
                        playerMetadataStored.Player.Fire1 != player.Fire1;

                    playerMetadataStored.ServerTimestamp = now;
                    playerMetadataStored.Player.X = player.X;
                    playerMetadataStored.Player.Y = player.Y;
                    playerMetadataStored.Player.Speed = player.Speed;
                    playerMetadataStored.Player.Rotation = player.Rotation;
                    playerMetadataStored.Player.Top = player.Top;
                    playerMetadataStored.Player.Left = player.Left;
                    playerMetadataStored.Player.Right = player.Right;
                    playerMetadataStored.Player.Bottom = player.Bottom;
                    playerMetadataStored.Player.Fire1 = player.Fire1;
                    playerMetadataStored.Player.Fire2 = player.Fire2;
                    playerMetadataStored.Player.Time = player.Time;

                    _players.AddOrUpdate(connectionId, playerMetadataStored, (keyUpdate, playerUpdate) => playerMetadataStored);
                    playerMetadata = playerMetadataStored;

                    return inputsChanged ? 
                        RemoteUpdatePlayerResult.UpdateOthers : 
                        RemoteUpdatePlayerResult.DoNotUpdate;
                }
                else
                {
                    _logger.LogError(LoggingEvents.RemoteUpdatePlayerDebug, $"Player not found {connectionId}");
                    playerMetadata = null;
                }

                return RemoteUpdatePlayerResult.Failed;
            }
        }

        public int Update(double delta)
        {
            var updates = 0;
            using (_logger.BeginScope(nameof(Update)))
            {
                foreach (var player in _players)
                {
                    UpdatePlayer(player.Value, delta);
                    updates++;
                }

                UpdateShots(delta);
            }

            return updates;
        }

        internal void UpdatePlayer(PlayerMetadata playerMetadata, double delta)
        {
            var player = playerMetadata.Player;
            using (_logger.BeginScope(nameof(UpdatePlayer)))
            {
                _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} Before player.X: {player.X}");
                _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} Before player.Y: {player.Y}");
                _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} Before player.Speed: {player.Speed}");
                _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} Before player.Rotation: {player.Rotation}");

                var sendPlayerUpdate = false;
                if (player.Animation != null)
                {
                    player.AnimationTiming -= delta * ConstantValues.AnimationConstantValues.ExplosionAnimationDuration;
                    if (player.AnimationTiming <= 0)
                    {
                        _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} animation {player.Animation} ended.");

                        double x = 10000;
                        double y = 10000;

                        FindAvailableLocation(ref x, ref y);

                        player.X = x;
                        player.Y = y;
                        player.Rotation = Math.PI * 3 / 2;
                        player.Speed = 0;
                        player.Animation = null;
                        player.AnimationTiming = 0;
                        sendPlayerUpdate = true;
                    }
                }
                else
                {
                    UpdatePlayerFromInput(player, player, delta);

                    var deltaX = delta * player.Speed * Math.Cos(player.Rotation);
                    var deltaY = delta * player.Speed * Math.Sin(player.Rotation);

                    _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} delta:  {delta}");
                    _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} deltaX: {deltaX}");
                    _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} deltaY: {deltaY}");

                    player.X += deltaX;
                    player.Y += deltaY;

                    _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} After player.X: {player.X}");
                    _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} After player.Y: {player.Y}");
                    _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} After player.Speed: {player.Speed}");
                    _logger.LogDebug(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} After player.Rotation: {player.Rotation}");

                    if (player.Fire1 && player.ShotUpdateFrequency <= 0)
                    {
                        var id = Interlocked.Increment(ref _runningShotCount);
                        _logger.LogDebug($"Player{player.ID} fired a Shot{id}.");
                        var shot = new Shot
                        {
                            ID = id,
                            Parent = player.ID,
                            Rotation = player.Rotation,
                            Speed = ConstantValues.ShootingConstantValues.SpeedPerSecond + player.Speed,
                            Time = ConstantValues.ShootingConstantValues.ShotDuration,
                            X = player.X + (ConstantValues.WorldConstantValues.RocketWidth) * Math.Cos(player.Rotation),
                            Y = player.Y + (ConstantValues.WorldConstantValues.ShotWidth + ConstantValues.WorldConstantValues.RocketHeight) * Math.Sin(player.Rotation)
                        };

                        ShotManager.SendShot(shot);
                        _shots.Enqueue(shot);

                        player.ShotUpdateFrequency = 0.2;
                    }
                }

                player.ShotUpdateFrequency -= delta;
                if (player.ShotUpdateFrequency < 0)
                {
                    player.ShotUpdateFrequency = 0;
                }

                // Collision with shots
                foreach (var shot in _shots)
                {
                    if (player.ID != shot.Parent &&
                        shot.Time > 0 &&
                        player.X - ConstantValues.WorldConstantValues.RocketWidth <= shot.X &&
                        player.X + ConstantValues.WorldConstantValues.RocketWidth >= shot.X &&
                        player.Y - ConstantValues.WorldConstantValues.RocketWidth <= shot.Y &&
                        player.Y + ConstantValues.WorldConstantValues.RocketWidth >= shot.Y &&
                        player.Animation == null)
                    {
                        player.Animation = ConstantValues.AnimationConstantValues.ExplosionAnimationName;
                        player.AnimationTiming = ConstantValues.AnimationConstantValues.ExplosionAnimationDuration;
                        _logger.LogInformation(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} Shot{shot.ID} by Player{shot.Parent} hit Player{player.ID}");
                        shot.Time = 0;

                        sendPlayerUpdate = true;
                        ShotManager.SendShot(shot);
                    }
                }

                // Collision with players
                foreach (var other in _players)
                {
                    var otherPlayer = other.Value.Player;
                    if (player.ID != otherPlayer.ID &&
                        player.X - ConstantValues.WorldConstantValues.RocketWidth <= otherPlayer.X &&
                        player.X + ConstantValues.WorldConstantValues.RocketWidth >= otherPlayer.X &&
                        player.Y - ConstantValues.WorldConstantValues.RocketWidth <= otherPlayer.Y &&
                        player.Y + ConstantValues.WorldConstantValues.RocketWidth >= otherPlayer.Y &&
                        player.Animation == null && otherPlayer.Animation == null)
                    {
                        _logger.LogInformation(LoggingEvents.UpdatePlayerDebug, $"Player{player.ID} Collision between players Player{player.ID} and Player{otherPlayer.ID}");
                        player.Animation = ConstantValues.AnimationConstantValues.ExplosionAnimationName;
                        player.AnimationTiming = ConstantValues.AnimationConstantValues.ExplosionAnimationDuration;
                        otherPlayer.Animation = ConstantValues.AnimationConstantValues.ExplosionAnimationName;
                        otherPlayer.AnimationTiming = ConstantValues.AnimationConstantValues.ExplosionAnimationDuration;

                        PlayerManager.SendPlayer(otherPlayer);
                        sendPlayerUpdate = true;
                    }
                }

                playerMetadata.ServerTimestamp = _time.ElapsedTicks;
                if (sendPlayerUpdate)
                {
                    PlayerManager.SendPlayer(player);
                }
            }
        }

        private static void UpdatePlayerFromInput(Player playerOutput, Player playerInput, double delta)
        {
            if (playerInput.Left)
            {
                playerOutput.Rotation -= delta * ConstantValues.MovementConstantValues.TurnRate;
                if (playerOutput.Rotation < 0)
                {
                    playerOutput.Rotation += 2 * Math.PI;
                }
            }
            if (playerInput.Right)
            {
                playerOutput.Rotation += delta * ConstantValues.MovementConstantValues.TurnRate;
                if (playerOutput.Rotation > 2 * Math.PI)
                {
                    playerOutput.Rotation -= 2 * Math.PI;
                }
            }
            if (playerInput.Top)
            {
                playerOutput.Speed += delta * ConstantValues.MovementConstantValues.AccelerationRate;
                if (playerOutput.Speed > ConstantValues.MovementConstantValues.MaxSpeedPerSecond)
                {
                    playerOutput.Speed = ConstantValues.MovementConstantValues.MaxSpeedPerSecond;
                }
            }
            else if (playerInput.Speed > 0)
            {
                playerOutput.Speed -= delta * ConstantValues.MovementConstantValues.DeAccelerationRate;
                if (playerOutput.Speed < 1)
                {
                    playerOutput.Speed = 0;
                }
            }
            if (playerInput.Bottom)
            {
                playerOutput.Speed -= delta * ConstantValues.MovementConstantValues.BrakeRate;
                if (playerOutput.Speed < 0)
                {
                    playerOutput.Speed = 0;
                }
            }
        }

        internal int UpdateShots(double delta)
        {
            var shotRemoved = 0;
            using (_logger.BeginScope(nameof(UpdateShots)))
            {
                foreach (var shot in _shots)
                {
                    shot.X += delta * shot.Speed * Math.Cos(shot.Rotation);
                    shot.Y += delta * shot.Speed * Math.Sin(shot.Rotation);
                    shot.Time -= delta;
                }

                while (true)
                {
                    if (_shots.TryPeek(out var shot))
                    {
                        if (shot.Time < 0)
                        {
                            if (_shots.TryDequeue(out var removedShot))
                            {
                                if (removedShot.Time < 0)
                                {
                                    // Correctly removed shot
                                    _logger.LogDebug($"Shot{removedShot.ID} expired.");
                                    shotRemoved++;
                                }
                                else
                                {
                                    _logger.LogWarning($"Shot{removedShot.ID} removed even if not expired: {removedShot.Time}.");
                                }
                            }
                            else
                            {
                                // Cannot get shot 
                                break;
                            }
                        }
                        else
                        {
                            // Break since we only seek removal of old shots 
                            // from the top of the queue.
                            break;
                        }
                    }
                    else
                    {
                        // Cannot get shot 
                        break;
                    }
                }
            }

            return shotRemoved;
        }
    }
}
