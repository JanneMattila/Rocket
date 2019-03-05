namespace Rocket
{
    public static class ConstantValues
    {
        public static class WorldConstantValues
        {
            public const double RocketWidth = 15;
            public const double RocketHeight = 10;

            public const double RocketIcon = 10;

            public const double ShotWidth = 5;
            public const double ShotHeight = 2;
        }

        public static class NetworkConstantValues
        {
            public const double SendUpdateFrequency = 100;
        }

        public static class MovementConstantValues
        {
            public const double AccelerationRate = 80;
            public const double DeAccelerationRate = 120;
            public const double BrakeRate = 5;
            public const double TurnRate = 4;

            public const double MaxSpeedPerSecond = 300;
        }

        public static class ShootingConstantValues
        {
            public const double SpeedPerSecond = 1000;
            public const double ShotDuration = 1.0;
        }

        public static class AnimationConstantValues
        {
            public const double ScreenUpdateFrequency = 0;

            public const string ExplosionAnimationName = "explosion";
            public const double ExplosionAnimationDuration = 100;
        }
    }
}
