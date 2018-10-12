using System.Collections.Generic;
using System.Linq;

namespace Rocket.Tests.Stubs
{
    public class RandomGeneratorStub : IRandomGenerator
    {
        public List<int> RandomValues { get; private set; }

        public RandomGeneratorStub()
        {
            RandomValues = new List<int>();
        }

        public void AddValues(int count)
        {
            RandomValues.AddRange(Enumerable.Repeat(0, count));
        }

        public int Next(int minValue, int maxValue)
        {
            var randomValue = RandomValues.First();
            RandomValues.RemoveAt(0);
            return randomValue;
        }
    }
}
