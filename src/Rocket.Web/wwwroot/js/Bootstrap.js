(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./RocketView"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RocketView_1 = require("./RocketView");
    var rocketView = new RocketView_1.RocketView();
    rocketView.init(document.location.hash);
});
//# sourceMappingURL=Bootstrap.js.map