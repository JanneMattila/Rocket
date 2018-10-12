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
    var PlayerMetadataAction = /** @class */ (function () {
        function PlayerMetadataAction() {
        }
        PlayerMetadataAction.add = "add";
        PlayerMetadataAction.delete = "delete";
        PlayerMetadataAction.self = "self";
        return PlayerMetadataAction;
    }());
    exports.PlayerMetadataAction = PlayerMetadataAction;
});
//# sourceMappingURL=PlayerMetadataAction.js.map