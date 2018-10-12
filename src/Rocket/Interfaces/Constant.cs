using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Rocket.Interfaces
{
    [DataContract]
    public class Constant
    {
        public Constant()
        {
            World = new WorldConstant();
            Network = new NetworkConstant();
            Movement = new MovementConstant();
            Shooting = new ShootingConstant();
            Animation = new AnimationConstant();
        }

        [DataMember(Name = "world")]
        [JsonProperty(PropertyName = "world", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public WorldConstant World { get; set; }

        [DataMember(Name = "network")]
        [JsonProperty(PropertyName = "network", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public NetworkConstant Network { get; set; }

        [DataMember(Name = "movement")]
        [JsonProperty(PropertyName = "movement", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public MovementConstant Movement { get; set; }

        [DataMember(Name = "shooting")]
        [JsonProperty(PropertyName = "shooting", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public ShootingConstant Shooting { get; set; }

        [DataMember(Name = "animation")]
        [JsonProperty(PropertyName = "animation", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public AnimationConstant Animation { get; set; }
    }

    [DataContract]
    public class WorldConstant
    {
        public WorldConstant()
        {
            Rocket = new Size
            {
                Height = ConstantValues.WorldConstantValues.RocketHeight,
                Width = ConstantValues.WorldConstantValues.RocketWidth
            };
            RocketIcon = ConstantValues.WorldConstantValues.RocketIcon;
            Shot = new Size
            {
                Height = ConstantValues.WorldConstantValues.ShotHeight,
                Width = ConstantValues.WorldConstantValues.ShotWidth
            };
        }

        [DataMember(Name = "rocket")]
        [JsonProperty(PropertyName = "rocket", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public Size Rocket { get; set; }

        [DataMember(Name = "rocketIcon")]
        [JsonProperty(PropertyName = "rocketIcon", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double RocketIcon { get; set; }

        [DataMember(Name = "shot")]
        [JsonProperty(PropertyName = "shot", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public Size Shot { get; set; }
    }

    [DataContract]
    public class NetworkConstant
    {
        public NetworkConstant()
        {
            SendUpdateFrequency = ConstantValues.NetworkConstantValues.SendUpdateFrequency;
        }

        [DataMember(Name = "sendUpdateFrequency")]
        [JsonProperty(PropertyName = "sendUpdateFrequency", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double SendUpdateFrequency { get; set; }
    }

    [DataContract]
    public class MovementConstant
    {
        public MovementConstant()
        {
            AccelerationRate = ConstantValues.MovementConstantValues.AccelerationRate;
            BrakeRate = ConstantValues.MovementConstantValues.BrakeRate;
            DeAccelerationRate = ConstantValues.MovementConstantValues.DeAccelerationRate;
            MaxSpeedPerSecond = ConstantValues.MovementConstantValues.MaxSpeedPerSecond;
            TurnRate = ConstantValues.MovementConstantValues.TurnRate;
        }

        [DataMember(Name = "accelerationRate")]
        [JsonProperty(PropertyName = "accelerationRate", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double AccelerationRate { get; set; }

        [DataMember(Name = "deAccelerationRate")]
        [JsonProperty(PropertyName = "deAccelerationRate", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double DeAccelerationRate { get; set; }

        [DataMember(Name = "brakeRate")]
        [JsonProperty(PropertyName = "brakeRate", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double BrakeRate { get; set; }

        [DataMember(Name = "turnRate")]
        [JsonProperty(PropertyName = "turnRate", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double TurnRate { get; set; }

        [DataMember(Name = "maxSpeedPerSecond")]
        [JsonProperty(PropertyName = "maxSpeedPerSecond", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double MaxSpeedPerSecond { get; set; }
    }

    [DataContract]
    public class ShootingConstant
    {
        public ShootingConstant()
        {
            SpeedPerSecond = ConstantValues.ShootingConstantValues.SpeedPerSecond;
            ShotDuration = ConstantValues.ShootingConstantValues.ShotDuration;
        }

        [DataMember(Name = "speedPerSecond")]
        [JsonProperty(PropertyName = "speedPerSecond", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double SpeedPerSecond { get; set; }

        [DataMember(Name = "shotDuration")]
        [JsonProperty(PropertyName = "shotDuration", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double ShotDuration { get; set; }
    }

    [DataContract]
    public class AnimationConstant
    {
        public AnimationConstant()
        {
            ScreenUpdateFrequency = ConstantValues.AnimationConstantValues.ScreenUpdateFrequency;
            ExplosionAnimationName = ConstantValues.AnimationConstantValues.ExplosionAnimationName;
            ExplosionAnimationDuration = ConstantValues.AnimationConstantValues.ExplosionAnimationDuration;
        }

        [DataMember(Name = "screenUpdateFrequency")]
        [JsonProperty(PropertyName = "screenUpdateFrequency", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double ScreenUpdateFrequency { get; set; }

        [DataMember(Name = "explosionAnimationName")]
        [JsonProperty(PropertyName = "explosionAnimationName", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public string ExplosionAnimationName { get; set; }

        [DataMember(Name = "explosionAnimationDuration")]
        [JsonProperty(PropertyName = "explosionAnimationDuration", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double ExplosionAnimationDuration { get; set; }
    }

    [DataContract]
    public class Size
    {
        [DataMember(Name = "width")]
        [JsonProperty(PropertyName = "width", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double Width { get; set; }

        [DataMember(Name = "height")]
        [JsonProperty(PropertyName = "height", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double Height { get; set; }
    }
}
