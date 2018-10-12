using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Rocket.Interfaces
{
    [DataContract]
    public class Shot
    {
        [DataMember(Name = "id")]
        [JsonProperty(PropertyName = "id", DefaultValueHandling = DefaultValueHandling.Include)]
        public int ID { get; set; }

        [IgnoreDataMember]
        [JsonProperty(PropertyName = "parent", DefaultValueHandling = DefaultValueHandling.Include)]
        public int Parent { get; set; }

        [DataMember(Name = "type")]
        [JsonProperty(PropertyName = "type", DefaultValueHandling = DefaultValueHandling.Include)]
        public string Type { get; set; }

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

        [DataMember(Name = "time")]
        [JsonProperty(PropertyName = "time", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        public double Time { get; set; }
    }
}
