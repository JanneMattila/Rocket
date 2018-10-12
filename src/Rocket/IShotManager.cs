using Rocket.Interfaces;
using System.Threading.Tasks;

namespace Rocket
{
    public interface IShotManager
    {
        Task SendShot(Shot shot);
    }
}
