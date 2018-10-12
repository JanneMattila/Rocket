using Rocket.Interfaces;
using System.Threading.Tasks;

namespace Rocket
{
    public interface IPlayerManager
    {
        Task SendPlayer(Player player);
    }
}
