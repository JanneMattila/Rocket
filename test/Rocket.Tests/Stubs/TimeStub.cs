using System.Collections.Generic;
using System.Linq;

namespace Rocket.Tests.Stubs
{
    public class TimeStub : ITime
    {
        public List<long> Ticks { get; private set; }

        public TimeStub()
        {
            Ticks = new List<long>();
        }

        public long ElapsedTicks
        {
            get
            {
                var ticks = Ticks.First();
                Ticks.RemoveAt(0);
                return ticks;
            }
        }
    }
}
