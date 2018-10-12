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
    var Shot = /** @class */ (function () {
        function Shot() {
            this.id = 0;
            this.parent = 0;
            this.type = "basic";
            this.time = 0;
            this.rotation = 0;
            this.speed = 0;
            this.x = 0;
            this.y = 0;
        }
        return Shot;
    }());
    exports.Shot = Shot;
});
//# sourceMappingURL=Shot.js.map