import { Player } from "../../src/Rocket.Web/wwwroot/js/Player";
import { RocketView } from "../../src/Rocket.Web/wwwroot/js/RocketView";
import assert = require('assert');

export function fixPlayerUndefinedProperties_Test() {
    // Arrange
    const rocketView = new RocketView();
    let player = {} as Player;
    const expectedUndefined = undefined;
    const expectedNumber = 0;
    const expectedBoolean = false;
    const expectedString = null;

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
};
