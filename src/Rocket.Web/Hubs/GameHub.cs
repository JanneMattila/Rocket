using Microsoft.AspNetCore.SignalR;
using Rocket.Interfaces;
using System;
using System.Threading.Tasks;

namespace Rocket.Web.Hubs
{
    public class GameHub : Hub
    {
        private readonly GameHubShared _gameHubShared;

        public GameHub(GameHubShared gameHubShared)
        {
            _gameHubShared = gameHubShared;
        }

        public override async Task OnConnectedAsync()
        {
            var tuple = _gameHubShared.GameEngine.RemotePlayerConnected(Context.ConnectionId);
            var player = tuple.Item1;
            var constants = tuple.Item2;

            await Clients.Caller.SendAsync(HubConstants.ConstantsMethod, constants);
            await Clients.Caller.SendAsync(HubConstants.PlayerMetadataUpdateMethod, PlayerActions.Self, player);

            await Clients.Others.SendAsync(HubConstants.PlayerMetadataUpdateMethod, PlayerActions.Add, player);

            foreach (var p in _gameHubShared.GameEngine.GetPlayers(p => p.ID != player.ID))
            {
                await Clients.Caller.SendAsync(HubConstants.PlayerMetadataUpdateMethod, PlayerActions.Add, p);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var player = _gameHubShared.GameEngine.RemotePlayerDisconnected(Context.ConnectionId);
            await Clients.Others.SendAsync(HubConstants.PlayerMetadataUpdateMethod, PlayerActions.Delete, player);
        }

        public async Task Update(Player player)
        {
            var result = _gameHubShared.GameEngine.RemoteUpdatePlayer(Context.ConnectionId, player, out var playerMetadata);
            if (result == RemoteUpdatePlayerResult.UpdateAll)
            {
                // We need to update also the sending player information
                // due to discrepancy in the player data.
                await Clients.All.SendAsync(HubConstants.PlayerUpdateMethod, playerMetadata.Player);
                await Clients.Caller.SendAsync(HubConstants.PlayerMetadataUpdateMethod, PlayerActions.Self, playerMetadata);
            }
            else if (result == RemoteUpdatePlayerResult.UpdateOthers)
            {
                // Received player data is okay so we only send this update
                // to other players.
                await Clients.Others.SendAsync(HubConstants.PlayerUpdateMethod, player);
            }
            else if (result == RemoteUpdatePlayerResult.UpdateSelf)
            {
                // We need to update sender due to discrepancy in the player data.
                await Clients.Caller.SendAsync(HubConstants.PlayerMetadataUpdateMethod, PlayerActions.Self, playerMetadata);
            }
        }
    }
}
