using Microsoft.Extensions.Logging.Abstractions;
using Rocket.Interfaces;
using Rocket.Tests.Stubs;
using System;
using Xunit;

namespace Rocket.Tests
{
    public class GameEngineTests
    {
        private readonly GameEngine _gameEngine;
        private readonly TimeStub _timeStub;
        private readonly PlayerManagerStub _playerManagerStub;
        private readonly ShotManagerStub _shotManagerStub;
        private readonly RandomGeneratorStub _randomGeneratorStub;

        private const double OneMillisecond = 0.01;
        private const double HundredMilliseconds = 0.1;
        private const double OneSecond = 1.0;

        public GameEngineTests()
        {
            _timeStub = new TimeStub();
            _playerManagerStub = new PlayerManagerStub();
            _shotManagerStub = new ShotManagerStub();
            _randomGeneratorStub = new RandomGeneratorStub();
            _gameEngine = new GameEngine(NullLoggerFactory.Instance, _timeStub, _randomGeneratorStub)
            {
                PlayerManager = _playerManagerStub,
                ShotManager = _shotManagerStub
            };
        }

        [Fact]
        public void Connected_Identifier_Invalid()
        {
            // Arrange 
            _timeStub.Ticks.Add(1);

            // Act & Assert
            Assert.Throws<ArgumentException>(() =>
            {
                _gameEngine.RemotePlayerConnected(string.Empty);
            });
        }

        [Fact]
        public void Connected_Identifier_Duplicate()
        {
            // Arrange
            _timeStub.Ticks.Add(1); // Player 1 timestamp
            _timeStub.Ticks.Add(2); // Player 2 timestamp
            _randomGeneratorStub.AddValues(4); // Player positions

            // Act & Assert
            Assert.Throws<ArgumentException>(() =>
            {
                _gameEngine.RemotePlayerConnected("1");
                _gameEngine.RemotePlayerConnected("1");
            });
        }

        [Fact]
        public void Single_Player_Connected_Identifier_Validation()
        {
            // Arrange
            _timeStub.Ticks.Add(1); // Player 1 timestamp
            _randomGeneratorStub.AddValues(2); // Player position

            var expectedId = 1;

            // Act
            var tuple = _gameEngine.RemotePlayerConnected("abc");
            var actual = tuple.Item1;

            // Assert
            Assert.Equal(expectedId, actual.ID);
        }

        [Fact]
        public void Two_Players_Connected_Identifier_Validation()
        {
            // Arrange
            _timeStub.Ticks.Add(1); // Player 1 timestamp
            _timeStub.Ticks.Add(2); // Player 2 timestamp
            _randomGeneratorStub.AddValues(4); // Players positions

            var expectedId = 2;
            _gameEngine.RemotePlayerConnected("a");

            // Act
            var tuple = _gameEngine.RemotePlayerConnected("b");
            var actual = tuple.Item1;

            // Assert
            Assert.Equal(expectedId, actual.ID);
        }

        [Fact]
        public void Single_Player_Connected_And_Disconnected()
        {
            // Arrange
            _timeStub.Ticks.Add(1); // Player 1 timestamp
            _randomGeneratorStub.AddValues(2); // Player position

            var connectionId = "abc";
            var expectedId = 1;
            var expectedPlayersCount = 0;

            _gameEngine.RemotePlayerConnected(connectionId);

            // Act
            var playerMetadataDisconnected = _gameEngine.RemotePlayerDisconnected(connectionId);

            // Assert
            Assert.Equal(expectedPlayersCount, _gameEngine.Players.Count);
            Assert.Equal(expectedId, playerMetadataDisconnected.ID);
        }

        [Fact]
        public void Player_Move()
        {
            // Arrange
            _timeStub.Ticks.Add(1); // Connected timestamp
            _timeStub.Ticks.Add(2); // Update timestamp
            _randomGeneratorStub.AddValues(2); // Player position

            var tuple = _gameEngine.RemotePlayerConnected("a");
            var playerMetadata = tuple.Item1;

            playerMetadata.Player.Top = true;
            var expectedX = playerMetadata.Player.X;
            var notExpectedY = playerMetadata.Player.Y;

            // Act
            _gameEngine.UpdatePlayer(playerMetadata, HundredMilliseconds);

            // Assert
            Assert.Equal(expectedX, playerMetadata.Player.X);
            Assert.NotEqual(notExpectedY, playerMetadata.Player.Y);
        }

        [Fact]
        public void Shots_Should_Expire_In_One_Second()
        {
            // Arrange
            _timeStub.Ticks.Add(1); // Connected timestamp
            _timeStub.Ticks.Add(2); // Update timestamp
            _randomGeneratorStub.AddValues(2); // Player position

            var tuple = _gameEngine.RemotePlayerConnected("a");
            var playerMetadata = tuple.Item1;

            playerMetadata.Player.Fire1 = true;
            _gameEngine.UpdatePlayer(playerMetadata, OneMillisecond);
            var expectedShotsExpired = 1;
            var expectedShotsRemaining = 0;

            // Act
            var actualShotsExpired = _gameEngine.UpdateShots(OneSecond + OneMillisecond);

            // Assert
            Assert.Equal(expectedShotsExpired, actualShotsExpired);
            Assert.Equal(expectedShotsRemaining, _gameEngine.Shots.Count);
        }

        [Theory]
        [InlineData(1, 9999, RemoteUpdatePlayerResult.UpdateOthers)]
        [InlineData(10, 9990, RemoteUpdatePlayerResult.UpdateOthers)]
        [InlineData(1000, 10000, RemoteUpdatePlayerResult.UpdateAll)]
        public void Remote_Update(double clientDeltaY, double expectedY, RemoteUpdatePlayerResult expected)
        {
            // Arrange
            _timeStub.Ticks.Add(TimeSpan.TicksPerSecond); // Connected timestamp
            _timeStub.Ticks.Add(TimeSpan.TicksPerSecond + TimeSpan.TicksPerMillisecond); // Remote Update timestamp
            _randomGeneratorStub.AddValues(2); // Player position

            var tuple = _gameEngine.RemotePlayerConnected("a");
            var playerMetadata = tuple.Item1;

            var player = ClonePlayer(playerMetadata);
            player.Top = true;
            player.Y -= clientDeltaY;
            var expectedX = player.X;

            // Act
            var actual = _gameEngine.RemoteUpdatePlayer("a", player, out PlayerMetadata playerMetadataUpdate);

            // Assert
            Assert.Equal(expected, actual);
            Assert.Equal(expectedX, playerMetadataUpdate.Player.X);
            Assert.Equal(expectedY, playerMetadataUpdate.Player.Y);
        }

        [Fact]
        public void Remote_Update_During_Animation()
        {
            // Arrange
            _timeStub.Ticks.Add(TimeSpan.TicksPerSecond); // Connected timestamp
            _randomGeneratorStub.AddValues(2); // Player position

            var tuple = _gameEngine.RemotePlayerConnected("a");
            var playerMetadata = tuple.Item1;

            playerMetadata.Player.Animation = "a";
            playerMetadata.Player.AnimationTiming = 100;

            var player = ClonePlayer(playerMetadata);
            RemoteUpdatePlayerResult expected = RemoteUpdatePlayerResult.UpdateSelf;

            // Act
            var actual = _gameEngine.RemoteUpdatePlayer("a", player, out PlayerMetadata playerMetadataUpdate);

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        public void Failed_Remote_Update()
        {
            // Arrange
            var expected = RemoteUpdatePlayerResult.Failed;

            // Act
            var actual = _gameEngine.RemoteUpdatePlayer("b", null, out PlayerMetadata playerMetadataUpdate);

            // Assert
            Assert.Equal(expected, actual);
            Assert.Null(playerMetadataUpdate);
        }

        private Player ClonePlayer(PlayerMetadata playerMetadata)
        {
            return new Player
            {
                ID = playerMetadata.Player.ID,
                X = playerMetadata.Player.X,
                Y = playerMetadata.Player.Y,
                Top = playerMetadata.Player.Top,
                Left = playerMetadata.Player.Left,
                Right = playerMetadata.Player.Right,
                Bottom = playerMetadata.Player.Bottom,
                Animation = playerMetadata.Player.Animation,
                AnimationTiming = playerMetadata.Player.AnimationTiming,
                Fire1 = playerMetadata.Player.Fire1,
                Fire2 = playerMetadata.Player.Fire2,
                Rotation = playerMetadata.Player.Rotation,
                ShotUpdateFrequency = playerMetadata.Player.ShotUpdateFrequency,
                Speed = playerMetadata.Player.Speed,
                Time = playerMetadata.Player.Time
            };
        }
    }
}
