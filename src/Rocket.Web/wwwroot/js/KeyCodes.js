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
    var KeyCodes = /** @class */ (function () {
        function KeyCodes() {
        }
        KeyCodes.F12 = 123;
        KeyCodes.KeyA = 65;
        KeyCodes.KeyW = 87;
        KeyCodes.KeyS = 83;
        KeyCodes.KeyD = 68;
        KeyCodes.LeftArrow = 37;
        KeyCodes.UpArrow = 38;
        KeyCodes.DownArrow = 40;
        KeyCodes.RightArrow = 39;
        KeyCodes.Space = 32;
        // Launch animation
        KeyCodes.KeyE = 69;
        return KeyCodes;
    }());
    exports.KeyCodes = KeyCodes;
});
//# sourceMappingURL=KeyCodes.js.map