using Rocket.Interfaces;
using System;
using System.Collections.Generic;

namespace Rocket
{
    public interface IGameEngine
    {
        IShotManager ShotManager { get; set; }

        IPlayerManager PlayerManager { get; set; }

        Tuple<PlayerMetadata, Constant> RemotePlayerConnected(string connectionId);

        PlayerMetadata RemotePlayerDisconnected(string connectionId);

        RemoteUpdatePlayerResult RemoteUpdatePlayer(string connectionId, Player player, out PlayerMetadata playerMetadata);

        int Update(double delta);

        IEnumerable<PlayerMetadata> GetPlayers(Func<PlayerMetadata, bool> predicate);
    }
}
