using System.Diagnostics;

namespace Rocket
{
    public class Time : ITime
    {
        private readonly Stopwatch _stopwatch = new Stopwatch();

        public Time()
        {
            _stopwatch.Start();
        }

        public long ElapsedTicks { get => _stopwatch.Elapsed.Ticks; }
    }
}
