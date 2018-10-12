using Microsoft.AspNetCore.SignalR;
using Rocket.Interfaces;
using System.Threading.Tasks;

namespace Rocket.Web.Hubs
{
    public class GameHubShared : IShotManager, IPlayerManager
    {
        private readonly IGameEngine _gameEngine;
        private readonly IHubContext<GameHub> _hub;

        public IGameEngine GameEngine => _gameEngine;

        public GameHubShared(IGameEngine gameEngine, IHubContext<GameHub> hub)
        {
            _hub = hub;
            _gameEngine = gameEngine;
            _gameEngine.PlayerManager = this;
            _gameEngine.ShotManager = this;
        }

        public async Task SendShot(Shot shot)
        {
            // Game engine shot update to clients
            await _hub.Clients.All.SendAsync(HubConstants.FireMethod, shot);
        }

        public async Task SendPlayer(Player player)
        {
            // Game engine player update to clients
            await _hub.Clients.All.SendAsync(HubConstants.PlayerUpdateMethod, player);
        }
    }
}
