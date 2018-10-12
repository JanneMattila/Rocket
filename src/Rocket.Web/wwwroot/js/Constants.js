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
    var Constants = /** @class */ (function () {
        function Constants() {
        }
        return Constants;
    }());
    exports.Constants = Constants;
    var WorldConstants = /** @class */ (function () {
        function WorldConstants() {
        }
        return WorldConstants;
    }());
    exports.WorldConstants = WorldConstants;
    var NetworkConstants = /** @class */ (function () {
        function NetworkConstants() {
        }
        return NetworkConstants;
    }());
    exports.NetworkConstants = NetworkConstants;
    var MovementConstants = /** @class */ (function () {
        function MovementConstants() {
        }
        return MovementConstants;
    }());
    exports.MovementConstants = MovementConstants;
    var ShootingConstants = /** @class */ (function () {
        function ShootingConstants() {
        }
        return ShootingConstants;
    }());
    exports.ShootingConstants = ShootingConstants;
    var AnimationConstants = /** @class */ (function () {
        function AnimationConstants() {
        }
        return AnimationConstants;
    }());
    exports.AnimationConstants = AnimationConstants;
    var Size = /** @class */ (function () {
        function Size() {
        }
        return Size;
    }());
    exports.Size = Size;
});
//# sourceMappingURL=Constants.js.map