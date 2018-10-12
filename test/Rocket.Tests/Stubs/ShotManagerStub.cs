using Rocket.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rocket.Tests.Stubs
{
    public class ShotManagerStub : IShotManager
    {
        public List<Shot> Shots { get; private set; }

        public ShotManagerStub()
        {
            Shots = new List<Shot>();
        }

        public Task SendShot(Shot shot)
        {
            Shots.Add(shot);
            return Task.CompletedTask;
        }
    }
}
