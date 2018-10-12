import * as signalR from "./signalR";
import * as signalRMsgPack from "./signalr-protocol-msgpack";

import { Constants } from "./Constants";
import { Player } from "./Player";
import { PlayerMetadata } from "./PlayerMetadata";
import { Shot } from "./Shot";
import { INetworkUpdate } from "./INetworkUpdate";

export class Communication {

    private isConnected = false;
    private connection: signalR.HubConnection;
    private networkUpdate: INetworkUpdate;

    constructor(networkUpdate: INetworkUpdate) {
        this.networkUpdate = networkUpdate;
    }

    connect() {

        let hubRoute = "GameHub";
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubRoute)
            .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
            .build();
        this.connection.on("Constants", this.receivedConstants.bind(this));
        this.connection.on("PlayerMetadataUpdate", this.receivedPlayerMetadataUpdate.bind(this));
        this.connection.on("Update", this.receivedPlayerUpdate.bind(this));
        this.connection.on("Fire", this.receivedShot.bind(this));

        this.connection.onclose(this.closed);
        this.connection.start()
            .then(this.started.bind(this))
            .catch(this.startFailed.bind(this));
    }

    private started() {
        this.isConnected = true;
        console.log("Connected");
    }

    private startFailed(err: any) {
        console.log(err);
    }

    private closed(e: any) {
        this.isConnected = false;
        if (e) {
            console.log("Connection closed due to error: " + e);
        }
        else {
            console.log("Connection closed due to disconnect.");
        }
    }

    sendPlayer(player: Player) {
        if (this.isConnected) {
            this.connection.invoke("Update", player);
        }
    }

    receivedConstants(constants: Constants) {
        this.networkUpdate.constantsUpdate(constants);
    }

    receivedPlayerMetadataUpdate(action: string, player: PlayerMetadata) {
        this.networkUpdate.playerMetadataUpdateCommand(action, player);
    }

    receivedPlayerUpdate(player: Player) {
        this.networkUpdate.playerUpdateCommand(player);
    }

    receivedShot(shot: Shot) {
        this.networkUpdate.fireCommand(shot);
    }
}
