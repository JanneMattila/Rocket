(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../src/Rocket.Web/wwwroot/js/RocketView", "assert"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RocketView_1 = require("../../src/Rocket.Web/wwwroot/js/RocketView");
    var assert = require("assert");
    function fixPlayerUndefinedProperties_Test() {
        // Arrange
        var rocketView = new RocketView_1.RocketView();
        var player = {};
        var expectedUndefined = undefined;
        var expectedNumber = 0;
        var expectedBoolean = false;
        var expectedString = null;
        // Act
        rocketView.fixPlayerUndefinedProperties(player);
        // Assert
        assert.equal(player.id, expectedUndefined);
        assert.equal(player.rotation, expectedNumber);
        assert.equal(player.speed, expectedNumber);
        assert.equal(player.x, expectedNumber);
        assert.equal(player.y, expectedNumber);
        assert.equal(player.animationTiming, expectedNumber);
        assert.equal(player.shotUpdateFrequency, expectedUndefined);
        assert.equal(player.time, expectedNumber);
        assert.equal(player.top, expectedBoolean);
        assert.equal(player.bottom, expectedBoolean);
        assert.equal(player.left, expectedBoolean);
        assert.equal(player.right, expectedBoolean);
        assert.equal(player.fire1, expectedBoolean);
        assert.equal(player.fire2, expectedBoolean);
        assert.equal(player.animation, expectedString);
        assert.equal(player.color, expectedString);
    }
    exports.fixPlayerUndefinedProperties_Test = fixPlayerUndefinedProperties_Test;
    ;
});
//# sourceMappingURL=RocketViewTests.js.map