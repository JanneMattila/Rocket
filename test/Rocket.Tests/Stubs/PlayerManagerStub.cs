using Rocket.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rocket.Tests.Stubs
{
    public class PlayerManagerStub : IPlayerManager
    {
        public List<Player> UpdatedPlayers { get; private set; }

        public PlayerManagerStub()
        {
            UpdatedPlayers = new List<Player>();
        }

        public Task SendPlayer(Player player)
        {
            UpdatedPlayers.Add(player);
            return Task.CompletedTask;
        }
    }
}
