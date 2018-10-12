(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Player = /** @class */ (function () {
        function Player() {
            this.id = 0;
            this.color = "yellow";
            this.rotation = 0;
            this.speed = 0;
            this.x = 0;
            this.y = 0;
            this.time = 0;
            this.animation = null;
            this.animationTiming = 0;
            this.shotUpdateFrequency = 0;
            this.fire1 = false;
            this.fire2 = false;
            this.top = false;
            this.bottom = false;
            this.left = false;
            this.right = false;
        }
        return Player;
    }());
    exports.Player = Player;
});
//# sourceMappingURL=Player.js.map