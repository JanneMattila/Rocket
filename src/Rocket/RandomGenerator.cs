using System;

namespace Rocket
{
    public class RandomGenerator : IRandomGenerator
    {
        private readonly Random _random = new Random();

        public int Next(int minValue, int maxValue)
        {
            return _random.Next(minValue, maxValue);
        }
    }
}
