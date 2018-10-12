using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Rocket.Interfaces
{
    [DataContract]
    public class Player
    {
        [DataMember(Name = "id")]
        [JsonProperty(PropertyName = "id", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public int ID { get; set; }

        [DataMember(Name = "rotation")]
        [JsonProperty(PropertyName = "rotation", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double Rotation { get; set; }

        [DataMember(Name = "speed")]
        [JsonProperty(PropertyName = "speed", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double Speed { get; set; }

        [DataMember(Name = "x")]
        [JsonProperty(PropertyName = "x", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double X { get; set; }

        [DataMember(Name = "y")]
        [JsonProperty(PropertyName = "y", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double Y { get; set; }

        [DataMember(Name = "animation")]
        [JsonProperty(PropertyName = "animation", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public string Animation { get; set; }

        [DataMember(Name = "animationTiming")]
        [JsonProperty(PropertyName = "animationTiming", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double AnimationTiming { get; set; }

        [DataMember(Name = "shotUpdateFrequency")]
        [JsonProperty(PropertyName = "shotUpdateFrequency", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double ShotUpdateFrequency { get; set; }

        [DataMember(Name = "fire1")]
        [JsonProperty(PropertyName = "fire1", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public bool Fire1 { get; set; }

        [DataMember(Name = "fire2")]
        [JsonProperty(PropertyName = "fire2", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public bool Fire2 { get; set; }

        [DataMember(Name = "top")]
        [JsonProperty(PropertyName = "top", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public bool Top { get; set; }

        [DataMember(Name = "bottom")]
        [JsonProperty(PropertyName = "bottom", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public bool Bottom { get; set; }

        [DataMember(Name = "left")]
        [JsonProperty(PropertyName = "left", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public bool Left { get; set; }

        [DataMember(Name = "right")]
        [JsonProperty(PropertyName = "right", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public bool Right { get; set; }

        [DataMember(Name = "time")]
        [JsonProperty(PropertyName = "time", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double Time { get; set; }
    }
}
