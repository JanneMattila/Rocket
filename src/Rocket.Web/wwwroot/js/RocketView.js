(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Point", "./Player", "./KeyCodes", "./CanvasTouch", "./PlayerMetadata", "./PlayerMetadataAction", "./Communication"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Point_1 = require("./Point");
    var Player_1 = require("./Player");
    var KeyCodes_1 = require("./KeyCodes");
    var CanvasTouch_1 = require("./CanvasTouch");
    var PlayerMetadata_1 = require("./PlayerMetadata");
    var PlayerMetadataAction_1 = require("./PlayerMetadataAction");
    var Communication_1 = require("./Communication");
    var RocketView = /** @class */ (function () {
        function RocketView() {
            this.points = 0;
            this.xSize = 11;
            this.ySize = 11;
            this.emptyScreenSpace = 40;
            this.radius = 5;
            this.rocketRotation = 0;
            this.animationUpdate = 0;
            this.sendUpdate = 0;
            this.sendUpdatePlayer = new Player_1.Player();
            this.debugEnabled = false;
            this.leftTouchStart = null;
            this.leftTouchCurrent = null;
            this.rightTouchCurrent = null;
            this.keyboard = new Map();
            this.shots = new Map();
            this.debug = new Array();
            this.communication = new Communication_1.Communication(this);
        }
        RocketView.prototype.log = function (message) {
            console.log(message);
            this.debug.push(message);
            if (this.debug.length > 10) {
                this.debug.splice(0, 1);
            }
        };
        RocketView.prototype.processFullscreenRequest = function (x, y) {
            if (x > this.canvas.width * 0.9 &&
                y < this.canvas.height * 0.1) {
                //this.log("webkitFullscreenEnabled: " + document.webkitFullscreenEnabled);
                //this.log("webkitFullscreenElement: " + document.webkitFullscreenElement);
                //this.log("mozFullscreenEnabled: " + document.mozFullscreenEnabled);
                //this.log("mozFullscreenElement: " + document.mozFullscreenElement);
                //this.log("fullscreenEnabled: " + document.fullscreenEnabled);
                //this.log("fullscreenElement: " + document.fullscreenElement);
                if (document.webkitFullscreenEnabled) {
                    if (this.canvas.webkitRequestFullscreen) {
                        if (document.webkitFullscreenElement == null) {
                            this.log("canvas.webkitRequestFullscreen");
                            try {
                                this.canvas.webkitRequestFullscreen();
                                this.log("canvas.webkitRequestFullscreen - OK!");
                            }
                            catch (e) {
                                this.log("Error: " + e);
                                this.log(e);
                            }
                        }
                        else {
                            document.webkitExitFullscreen();
                        }
                        return;
                    }
                }
                //else if (document.mozFullscreenEnabled) {
                //    if (this.canvas.mozRequestFullscreen) {
                //        if (document.mozFullscreenElement == null) {
                //            this.log("canvas.mozRequestFullscreen");
                //            try {
                //                this.canvas.mozRequestFullscreen();
                //                this.log("canvas.mozRequestFullscreen - OK!");
                //            } catch (e) {
                //                this.log("Error: " + e);
                //                this.log(e);
                //            }
                //        }
                //        else {
                //            document.mozExitFullscreen();
                //        }
                //        return;
                //    }
                //}
                else if (document.fullscreenEnabled) {
                    if (this.canvas.requestFullscreen) {
                        if (document.fullscreenElement == null) {
                            this.canvas.requestFullscreen();
                        }
                        else {
                            document.exitFullscreen();
                        }
                        return;
                    }
                }
            }
        };
        RocketView.prototype.mousedown = function (event) {
            event.preventDefault();
            if (this.processFullscreenRequest(event.clientX, event.clientY)) {
                return;
            }
            if (event.clientX < this.canvas.width / 2) {
                this.leftTouchStart = new CanvasTouch_1.CanvasTouch();
                this.leftTouchStart.id = 0;
                this.leftTouchStart.x = event.screenX;
                this.leftTouchStart.y = event.screenY;
                this.leftTouchCurrent = null;
            }
            else {
                this.rightTouchCurrent = new CanvasTouch_1.CanvasTouch();
                this.rightTouchCurrent.id = 0;
                this.rightTouchCurrent.x = event.screenX;
                this.rightTouchCurrent.y = event.screenY;
            }
        };
        RocketView.prototype.mouseup = function (event) {
            event.preventDefault();
            this.leftTouchStart = null;
            this.leftTouchCurrent = null;
            this.rightTouchCurrent = null;
        };
        RocketView.prototype.mousemove = function (event) {
            event.preventDefault();
            if (this.leftTouchStart) {
                this.leftTouchCurrent = new CanvasTouch_1.CanvasTouch();
                this.leftTouchCurrent.id = 0;
                this.leftTouchCurrent.x = event.screenX;
                this.leftTouchCurrent.y = event.screenY;
            }
        };
        RocketView.prototype.init = function (gameIdentifier) {
            var _this = this;
            if (gameIdentifier.indexOf("debug") > 0) {
                this.debugEnabled = true;
            }
            var canvas = document.getElementById("canvas");
            canvas.width = window.innerWidth * 0.95;
            canvas.height = window.innerHeight * 0.95;
            canvas.focus();
            window.addEventListener('resize', function () {
                console.log("resize");
                if (document.webkitFullscreenElement ||
                    document.fullscreenElement) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
                else {
                    canvas.width = window.innerWidth * 0.95;
                    canvas.height = window.innerHeight * 0.95;
                }
            });
            window.addEventListener('error', function (e) {
                var message = "Error: " + e.message + " at line " + e.lineno;
                console.log(message);
                alert(message);
            });
            document.addEventListener('keydown', function (event) {
                _this.keydown(event);
                if (event.keyCode != KeyCodes_1.KeyCodes.F12) {
                    event.preventDefault();
                }
            });
            document.addEventListener('keyup', function (event) {
                _this.keyup(event);
                if (event.keyCode != KeyCodes_1.KeyCodes.F12) {
                    event.preventDefault();
                }
            });
            this.canvas = canvas;
            this.context = this.canvas.getContext("2d");
            this.context.font = "14pt Arial";
            this.canvas.addEventListener('touchstart', function (event) {
                event.preventDefault();
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (_this.processFullscreenRequest(touch.clientX, touch.clientY)) {
                        return;
                    }
                    if (touch.clientX < _this.canvas.width / 2) {
                        _this.leftTouchStart = {
                            id: touch.identifier,
                            x: touch.clientX,
                            y: touch.clientY
                        };
                        _this.leftTouchCurrent = null;
                    }
                    else {
                        _this.rightTouchCurrent = {
                            id: touch.identifier,
                            x: touch.clientX,
                            y: touch.clientY
                        };
                    }
                }
            }, false);
            this.canvas.addEventListener('touchend', function (event) {
                event.preventDefault();
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (touch.clientX < _this.canvas.width / 2) {
                        _this.leftTouchStart = null;
                        _this.leftTouchCurrent = null;
                    }
                    else {
                        _this.rightTouchCurrent = null;
                    }
                }
            }, false);
            this.canvas.addEventListener('touchcancel', function (event) {
                event.preventDefault();
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (touch.clientX < _this.canvas.width / 2) {
                        _this.leftTouchStart = null;
                        _this.leftTouchCurrent = null;
                    }
                    else {
                        _this.rightTouchCurrent = null;
                    }
                }
            }, false);
            this.canvas.addEventListener('touchmove', function (event) {
                event.preventDefault();
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (_this.leftTouchStart != undefined && _this.leftTouchStart.id == touch.identifier) {
                        _this.leftTouchCurrent = new CanvasTouch_1.CanvasTouch();
                        _this.leftTouchCurrent.id = touch.identifier;
                        _this.leftTouchCurrent.x = touch.clientX;
                        _this.leftTouchCurrent.y = touch.clientY;
                    }
                    else if (_this.rightTouchCurrent != undefined && _this.rightTouchCurrent.id == touch.identifier) {
                        _this.rightTouchCurrent = new CanvasTouch_1.CanvasTouch();
                        _this.rightTouchCurrent.id = touch.identifier;
                        _this.rightTouchCurrent.x = touch.clientX;
                        _this.rightTouchCurrent.y = touch.clientY;
                    }
                }
            }, false);
            canvas.addEventListener('mousedown', function (event) { return _this.mousedown(event); });
            canvas.addEventListener('mousemove', function (event) { return _this.mousemove(event); });
            canvas.addEventListener('mouseup', function (event) { return _this.mouseup(event); });
            this.points = 0;
            this.playerMetadata = new PlayerMetadata_1.PlayerMetadata();
            this.playerMetadata.player.x = 10000;
            this.playerMetadata.player.y = 10000;
            this.playerMetadata.color = "red";
            this.resetRocket();
            this.others = new Map();
            this.communication.connect();
            this.setPoints();
        };
        RocketView.prototype.resetRocket = function () {
            this.playerMetadata.player.rotation = Math.PI * 3 / 2;
            this.playerMetadata.player.speed = 0;
        };
        RocketView.prototype.requestAnimationFrame = function (timestamp) {
            this.update(timestamp);
            window.requestAnimationFrame(this.requestAnimationFrame.bind(this));
        };
        RocketView.prototype.fixShotUndefinedProperties = function (shot) {
            if (shot.rotation == undefined)
                shot.rotation = 0;
            if (shot.speed == undefined)
                shot.speed = 0;
            if (shot.time == undefined)
                shot.time = 0;
            if (shot.type == undefined)
                shot.type = "";
            if (shot.x == undefined)
                shot.x = 0;
            if (shot.y == undefined)
                shot.y = 0;
        };
        RocketView.prototype.fixPlayerUndefinedProperties = function (player) {
            if (player.animation == undefined)
                player.animation = null;
            if (player.animationTiming == undefined)
                player.animationTiming = 0;
            if (player.time == undefined)
                player.time = 0;
            if (player.top == undefined)
                player.top = false;
            if (player.bottom == undefined)
                player.bottom = false;
            if (player.left == undefined)
                player.left = false;
            if (player.right == undefined)
                player.right = false;
            if (player.rotation == undefined)
                player.rotation = 0;
            if (player.x == undefined)
                player.x = 0;
            if (player.y == undefined)
                player.y = 0;
            if (player.fire1 == undefined)
                player.fire1 = false;
            if (player.fire2 == undefined)
                player.fire2 = false;
            if (player.speed == undefined)
                player.speed = 0;
        };
        RocketView.prototype.constantsUpdate = function (constants) {
            console.log(constants);
            this.constants = constants;
            // Start animations
            this.requestAnimationFrame(0);
        };
        RocketView.prototype.fireCommand = function (shot) {
            //this.log("shot received: " + shot.id);
            this.fixShotUndefinedProperties(shot);
            var existingShot = this.shots.get(shot.id);
            if (existingShot != null) {
                existingShot.time = shot.time;
            }
            else {
                this.shots.set(shot.id, shot);
            }
        };
        RocketView.prototype.playerUpdateCommand = function (player) {
            //this.log("Player update: " + player.id);
            //console.log(player);
            this.fixPlayerUndefinedProperties(player);
            if (player.id == this.playerMetadata.id) {
                // Self update
                var deltaX = this.playerMetadata.player.x - player.x;
                var deltaY = this.playerMetadata.player.y - player.y;
                var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > 10) {
                    this.log("Player " + player.id + " distance from existing location " + distance + ".");
                }
                this.playerMetadata.player = player;
            }
            else {
                var playerMetadata = this.others.get(player.id);
                var deltaX = playerMetadata.player.x - player.x;
                var deltaY = playerMetadata.player.y - player.y;
                var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > 10) {
                    this.log("Player " + player.id + " distance from existing location " + distance + ".");
                }
                if (playerMetadata != null) {
                    playerMetadata.player = player;
                }
            }
        };
        RocketView.prototype.playerMetadataUpdateCommand = function (action, playerMetadata) {
            //this.log("Player metadata update: " + action + " - " + playerMetadata.id);
            console.log(playerMetadata);
            if (playerMetadata.player != undefined) {
                this.fixPlayerUndefinedProperties(playerMetadata.player);
            }
            if (action == PlayerMetadataAction_1.PlayerMetadataAction.add) {
                this.others.set(playerMetadata.id, playerMetadata);
            }
            else if (action == PlayerMetadataAction_1.PlayerMetadataAction.delete) {
                this.others.delete(playerMetadata.id);
            }
            else if (action == PlayerMetadataAction_1.PlayerMetadataAction.self) {
                this.playerMetadata = playerMetadata;
            }
        };
        RocketView.prototype.updatePlayer = function (player, delta) {
            if (player.animation != null) {
                player.animationTiming -= delta * this.constants.animation.explosionAnimationDuration;
                if (player.animationTiming <= 0) {
                    player.rotation = Math.PI * 3 / 2;
                    player.speed = 0;
                    player.animation = null;
                    player.animationTiming = 0;
                }
            }
            else {
                if (player.left) {
                    player.rotation -= delta * this.constants.movement.turnRate;
                    if (player.rotation < 0) {
                        player.rotation += 2 * Math.PI;
                    }
                }
                if (player.right) {
                    player.rotation += delta * this.constants.movement.turnRate;
                    if (player.rotation > 2 * Math.PI) {
                        player.rotation -= 2 * Math.PI;
                    }
                }
                if (player.top) {
                    player.speed += delta * this.constants.movement.accelerationRate;
                    if (player.speed > this.constants.movement.maxSpeedPerSecond) {
                        player.speed = this.constants.movement.maxSpeedPerSecond;
                    }
                }
                else if (player.speed > 0) {
                    player.speed -= delta * this.constants.movement.deAccelerationRate;
                    if (player.speed < 1) {
                        player.speed = 0;
                    }
                }
                if (player.bottom) {
                    player.speed -= delta * this.constants.movement.brakeRate;
                    if (player.speed < 0) {
                        player.speed = 0;
                    }
                }
                player.x += delta * player.speed * Math.cos(player.rotation);
                player.y += delta * player.speed * Math.sin(player.rotation);
            }
        };
        RocketView.prototype.fixAngle = function (angle) {
            if (angle < 0) {
                angle += 2 * Math.PI;
            }
            else if (angle > 2 * Math.PI) {
                angle -= 2 * Math.PI;
            }
            return angle;
        };
        RocketView.prototype.radToDegrees = function (angle) {
            return angle * 90 / Math.PI * 2;
        };
        RocketView.prototype.update = function (timestamp) {
            var _this = this;
            var delta = (timestamp - this.animationUpdate) / 1000;
            this.updatePlayer(this.playerMetadata.player, delta);
            this.others.forEach(function (p) {
                _this.updatePlayer(p.player, delta);
            });
            this.processInput();
            var deletedShots = new Array();
            this.shots.forEach(function (s) {
                s.x += delta * s.speed * Math.cos(s.rotation);
                s.y += delta * s.speed * Math.sin(s.rotation);
                s.time -= delta;
                if (s.time < 0) {
                    deletedShots.push(s.id);
                }
            });
            for (var i = 0; i < deletedShots.length; i++) {
                this.shots.delete(deletedShots[i]);
            }
            // Send only if properties have changed.
            var send = false;
            var properties = ["left", "right", "top", "bottom", "fire1", "fire2"];
            for (var propertyIndex in properties) {
                var property = properties[propertyIndex];
                var left = this.sendUpdatePlayer[property];
                var right = this.playerMetadata.player[property];
                if (left != right) {
                    send = true;
                    this.sendUpdatePlayer[property] = right;
                }
            }
            if (send || timestamp > this.sendUpdate + this.constants.network.sendUpdateFrequency) {
                var ts = (timestamp - this.sendUpdate) / 1000;
                this.sendUpdate = timestamp;
                this.playerMetadata.player.time = timestamp;
                this.communication.sendPlayer(this.playerMetadata.player);
                //this.log("send: " + ts + "s");
            }
            if (timestamp > this.animationUpdate + this.constants.animation.screenUpdateFrequency) {
                this.draw();
                this.animationUpdate = timestamp;
            }
            else {
                //this.log("Skip draw " + (timestamp - this.animationUpdate));
            }
        };
        RocketView.prototype.processInput = function () {
            this.playerMetadata.player.left = this.keyboard.has(KeyCodes_1.KeyCodes.LeftArrow) || this.keyboard.has(KeyCodes_1.KeyCodes.KeyA);
            this.playerMetadata.player.right = this.keyboard.has(KeyCodes_1.KeyCodes.RightArrow) || this.keyboard.has(KeyCodes_1.KeyCodes.KeyD);
            this.playerMetadata.player.top = this.keyboard.has(KeyCodes_1.KeyCodes.UpArrow) || this.keyboard.has(KeyCodes_1.KeyCodes.KeyW);
            this.playerMetadata.player.bottom = this.keyboard.has(KeyCodes_1.KeyCodes.DownArrow) || this.keyboard.has(KeyCodes_1.KeyCodes.KeyS);
            this.playerMetadata.player.fire1 = this.keyboard.has(KeyCodes_1.KeyCodes.Space) || this.rightTouchCurrent != null;
            if (this.keyboard.has(KeyCodes_1.KeyCodes.KeyE)) {
                this.playerMetadata.player.animation = this.constants.animation.explosionAnimationName;
                this.playerMetadata.player.animationTiming = this.constants.animation.explosionAnimationDuration;
            }
            if (this.leftTouchStart && this.leftTouchCurrent) {
                // TODO: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
                var touchx = this.leftTouchCurrent.x - this.leftTouchStart.x;
                var touchy = this.leftTouchCurrent.y - this.leftTouchStart.y;
                var angle = Math.atan2(touchy, touchx);
                angle = angle < 0 ? Math.PI * 2 + angle : angle;
                var rotation = this.playerMetadata.player.rotation;
                var deltaLeft = this.fixAngle(rotation - angle);
                var deltaRight = this.fixAngle(angle - this.playerMetadata.player.rotation);
                var len = Math.sqrt(touchx * touchx + touchy * touchy);
                //this.log("touch diff: " + Math.abs(deltaRight - deltaLeft));
                //this.log("deltaLeft: " + deltaLeft);
                //this.log("deltaRight: " + deltaRight);
                if (Math.abs(deltaRight - deltaLeft) < 5.8) {
                    if (deltaLeft > deltaRight) {
                        this.playerMetadata.player.right = true;
                    }
                    else if (deltaLeft < deltaRight) {
                        this.playerMetadata.player.left = true;
                    }
                }
                if (len < 30) {
                    this.playerMetadata.player.bottom = true;
                }
                else if (len > 60) {
                    this.playerMetadata.player.top = true;
                }
            }
        };
        RocketView.prototype.draw = function () {
            var _this = this;
            this.context.save();
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            var lineSpaceWidth = 45;
            var lineSpaceHeight = 45;
            var offsetX = this.playerMetadata.player.x % lineSpaceWidth;
            var offsetY = this.playerMetadata.player.y % lineSpaceHeight;
            for (var i = 0; i <= this.canvas.width / lineSpaceWidth; i++) {
                var lineX = i * lineSpaceWidth;
                this.context.beginPath();
                this.context.moveTo(lineX - offsetX, 0);
                this.context.lineTo(lineX - offsetX, this.canvas.height);
                this.context.stroke();
            }
            for (var i = 0; i <= this.canvas.height / lineSpaceHeight; i++) {
                var lineY = i * lineSpaceHeight;
                this.context.beginPath();
                this.context.moveTo(0, lineY - offsetY);
                this.context.lineTo(this.canvas.width, lineY - offsetY);
                this.context.stroke();
            }
            this.others.forEach(function (p) {
                _this.drawPlayer(p);
            });
            this.drawPlayer(this.playerMetadata);
            this.shots.forEach(function (s) {
                _this.drawShot(s);
            });
            // Click to fullscreen area
            this.context.strokeRect(this.canvas.width * 0.9, 0, this.canvas.width * 0.1, this.canvas.height * 0.1);
            this.context.fillStyle = "black";
            for (var i = 0; i < this.debug.length; i++) {
                var message = this.debug[i];
                this.context.fillText(message, 40, i * 20);
            }
            this.context.restore();
        };
        RocketView.prototype.drawShot = function (shot) {
            var x = shot.x - this.playerMetadata.player.x;
            var y = shot.y - this.playerMetadata.player.y;
            var screenx = x + this.canvas.width / 2;
            var screeny = y + this.canvas.height / 2;
            if (Math.abs(x) < this.canvas.width / 2 &&
                Math.abs(y) < this.canvas.height / 2) {
                // This shot should be displayed in the screen
                this.context.save();
                this.context.translate(screenx, screeny);
                this.context.rotate(shot.rotation);
                this.context.translate(-screenx, -screeny);
                this.context.fillStyle = "purple";
                this.context.fillRect(screenx - this.constants.world.shot.width, screeny - this.constants.world.shot.height, this.constants.world.shot.width * 2, this.constants.world.shot.height * 2);
                this.context.restore();
            }
        };
        RocketView.prototype.drawPlayer = function (playerMetadata) {
            var x = playerMetadata.player.x - this.playerMetadata.player.x;
            var y = playerMetadata.player.y - this.playerMetadata.player.y;
            var screenx = x + this.canvas.width / 2;
            var screeny = y + this.canvas.height / 2;
            if (Math.abs(x) < this.canvas.width / 2 &&
                Math.abs(y) < this.canvas.height / 2) {
                // This rocket should be displayed in the screen
                this.context.save();
                this.context.translate(screenx, screeny);
                this.context.rotate(playerMetadata.player.rotation);
                this.context.translate(-screenx, -screeny);
                if (playerMetadata.player.animation != null) {
                    console.log("Anim: " + playerMetadata.player.animation);
                    this.context.beginPath();
                    this.context.fillStyle = "yellow";
                    this.context.arc(screenx, screeny, playerMetadata.player.animationTiming, 0, 2 * Math.PI);
                    this.context.fill();
                    this.context.closePath();
                }
                else {
                    this.context.beginPath();
                    this.context.moveTo(screenx - this.constants.world.rocket.width, screeny - this.constants.world.rocket.height);
                    this.context.lineTo(screenx + this.constants.world.rocket.width, screeny);
                    this.context.lineTo(screenx - this.constants.world.rocket.width, screeny + this.constants.world.rocket.height);
                    this.context.lineTo(screenx - this.constants.world.rocket.width, screeny - this.constants.world.rocket.height);
                    this.context.fillStyle = playerMetadata.player.fire1 ? "blue" : playerMetadata.color;
                    this.context.fill();
                    this.context.closePath();
                }
                this.context.restore();
            }
            else {
                // This rocket location should be shown in the "side"
                var rectx1 = this.playerMetadata.player.x - this.canvas.width / 2;
                var recty1 = this.playerMetadata.player.y - this.canvas.height / 2;
                var rectx2 = this.playerMetadata.player.x + this.canvas.width / 2;
                var recty2 = this.playerMetadata.player.y + this.canvas.height / 2;
                var topLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx1, recty1, rectx2, recty1);
                var bottomLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx1, recty2, rectx2, recty2);
                var leftLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx1, recty1, rectx1, recty2);
                var rightLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx2, recty1, rectx2, recty2);
                this.context.fillStyle = playerMetadata.player.fire1 ? "blue" : playerMetadata.color;
                if (topLine) {
                    x = topLine.x - rectx1;
                    y = 0;
                }
                else if (bottomLine) {
                    x = bottomLine.x - rectx1;
                    y = this.canvas.height;
                }
                else if (leftLine) {
                    x = 0;
                    y = leftLine.y - recty1;
                }
                else if (rightLine) {
                    x = this.canvas.width;
                    y = rightLine.y - recty1;
                }
                this.context.fillRect(x - this.constants.world.rocketIcon, y - this.constants.world.rocketIcon, this.constants.world.rocketIcon * 2, this.constants.world.rocketIcon * 2);
            }
        };
        RocketView.prototype.calculateIntersection = function (x1, y1, x2, y2, x3, y3, x4, y4) {
            var point = new Point_1.Point();
            // Algorithm based on this Wikipedia article:
            // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
            point.x = Math.floor(((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4))
                /
                    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)));
            point.y = Math.floor(((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4))
                /
                    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)));
            if (point.x && point.y) {
                var minx = Math.min(x1, x2);
                var maxx = Math.max(x1, x2);
                var miny = Math.min(y1, y2);
                var maxy = Math.max(y1, y2);
                if (point.x >= minx && point.x <= maxx && point.y >= miny && point.y <= maxy) {
                    // This is inside line segment
                    return point;
                }
            }
            return null;
        };
        RocketView.prototype.keydown = function (evt) {
            if (!this.keyboard.has(evt.keyCode)) {
                this.keyboard.set(evt.keyCode, Date.now());
            }
        };
        RocketView.prototype.keyup = function (evt) {
            if (this.keyboard.delete(evt.keyCode)) {
                //this.log("keyup: " + evt.keyCode);
            }
        };
        RocketView.prototype.setPoints = function () {
            //const text = "Score: " + this.points;
            document.title = "Rocket";
            //document.getElementById("text").innerText = text;
        };
        return RocketView;
    }());
    exports.RocketView = RocketView;
});
//# sourceMappingURL=RocketView.js.map