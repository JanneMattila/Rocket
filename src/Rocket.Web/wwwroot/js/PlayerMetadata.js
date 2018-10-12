(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Player"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Player_1 = require("./Player");
    var PlayerMetadata = /** @class */ (function () {
        function PlayerMetadata() {
            this.id = 0;
            this.color = "yellow";
            this.player = new Player_1.Player();
        }
        return PlayerMetadata;
    }());
    exports.PlayerMetadata = PlayerMetadata;
});
//# sourceMappingURL=PlayerMetadata.js.map