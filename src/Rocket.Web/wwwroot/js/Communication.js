(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./signalR", "./signalr-protocol-msgpack"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var signalR = require("./signalR");
    var signalRMsgPack = require("./signalr-protocol-msgpack");
    var Communication = /** @class */ (function () {
        function Communication(networkUpdate) {
            this.isConnected = false;
            this.networkUpdate = networkUpdate;
        }
        Communication.prototype.connect = function () {
            var hubRoute = "GameHub";
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
        };
        Communication.prototype.started = function () {
            this.isConnected = true;
            console.log("Connected");
        };
        Communication.prototype.startFailed = function (err) {
            console.log(err);
        };
        Communication.prototype.closed = function (e) {
            this.isConnected = false;
            if (e) {
                console.log("Connection closed due to error: " + e);
            }
            else {
                console.log("Connection closed due to disconnect.");
            }
        };
        Communication.prototype.sendPlayer = function (player) {
            if (this.isConnected) {
                this.connection.invoke("Update", player);
            }
        };
        Communication.prototype.receivedConstants = function (constants) {
            this.networkUpdate.constantsUpdate(constants);
        };
        Communication.prototype.receivedPlayerMetadataUpdate = function (action, player) {
            this.networkUpdate.playerMetadataUpdateCommand(action, player);
        };
        Communication.prototype.receivedPlayerUpdate = function (player) {
            this.networkUpdate.playerUpdateCommand(player);
        };
        Communication.prototype.receivedShot = function (shot) {
            this.networkUpdate.fireCommand(shot);
        };
        return Communication;
    }());
    exports.Communication = Communication;
});
//# sourceMappingURL=Communication.js.map