import { Constants } from "./Constants";
import { Point } from "./Point";
import { Player } from "./Player";
import { Shot } from "./Shot";
import { KeyCodes } from "./KeyCodes";
import { CanvasTouch } from "./CanvasTouch";
import { PlayerMetadata } from "./PlayerMetadata";
import { PlayerMetadataAction } from "./PlayerMetadataAction";
import { INetworkUpdate } from "./INetworkUpdate";
import { Communication } from "./Communication";
import { WorldConstants, MovementConstants, ShootingConstants, AnimationConstants } from "./Constants";

// Fullscreen API fixes to Typescript files
// based on this: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
interface HTMLDocumentEx extends HTMLDocument {
    mozFullscreenEnabled: boolean;
    mozFullscreenElement: Element | null;
    mozExitFullscreen: () => void | null;

    webkitFullscreenEnabled: boolean;
    webkitRequestFullscreen: boolean;
    webkitFullscreenElement: Element | null;
    webkitExitFullscreen: () => void | null;

    fullscreenEnabled: boolean;
    fullscreenElement: Element | null;
}

interface HTMLCanvasElementEx extends HTMLCanvasElement {
    mozRequestFullscreen(): void;

    webkitFullscreenEnabled: boolean;
    webkitRequestFullscreen: () => void | null;
    webkitFullscreenElement: Element | null;
    webkitExitFullscreen: () => void | null;
}

export class RocketView implements INetworkUpdate {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    points = 0;

    xSize = 11;
    ySize = 11;
    emptyScreenSpace = 40;
    radius = 5;
    rocketRotation = 0;

    animationUpdate = 0;
    sendUpdate = 0;
    sendUpdatePlayer: Player = new Player();

    playerMetadata: PlayerMetadata;
    others: Map<number, PlayerMetadata>;

    keyboard: Map<number, number>;

    shots: Map<number, Shot>;
    debug: Array<string>;
    debugEnabled: boolean = false;

    communication: Communication;
    constants: Constants;

    leftTouchStart: CanvasTouch = null;
    leftTouchCurrent: CanvasTouch = null;
    rightTouchCurrent: CanvasTouch = null;

    constructor() {
        this.keyboard = new Map<number, number>();
        this.shots = new Map<number, Shot>();
        this.debug = new Array<string>();
        this.communication = new Communication(this);
    }

    private log(message: any): void {
        console.log(message);
        this.debug.push(message);
        if (this.debug.length > 10) {
            this.debug.splice(0, 1);
        }
    }

    private processFullscreenRequest(x: number, y: number): boolean {
        if (x > this.canvas.width * 0.9 &&
            y < this.canvas.height * 0.1) {

            const d = <HTMLDocumentEx>document;
            const element = <HTMLCanvasElementEx>this.canvas;
            if (d.webkitFullscreenEnabled) {
                if (element.webkitRequestFullscreen) {
                    if (d.webkitFullscreenElement == null) {
                        this.log("canvas.webkitRequestFullscreen");
                        try {
                            element.webkitRequestFullscreen();
                            this.log("canvas.webkitRequestFullscreen - OK!");
                        } catch (e) {
                            this.log("Error: " + e);
                            this.log(e);
                        }
                    }
                    else {
                        d.webkitExitFullscreen();
                    }
                    return;
                }
            }
            else if (d.mozFullscreenEnabled) {
                if (element.mozRequestFullscreen) {
                    if (d.mozFullscreenElement == null) {
                        this.log("canvas.mozRequestFullscreen");
                        try {
                            element.mozRequestFullscreen();
                            this.log("canvas.mozRequestFullscreen - OK!");
                        } catch (e) {
                            this.log("Error: " + e);
                            this.log(e);
                        }
                    }
                    else {
                        d.mozExitFullscreen();
                    }
                    return;
                }
            }
            else if (document.fullscreenEnabled) {
                if (this.canvas.requestFullscreen) {
                    if (d.fullscreenElement == null) {
                        this.canvas.requestFullscreen();
                    }
                    else {
                        document.exitFullscreen();
                    }
                    return;
                }
            }
        }
    }

    mousedown(event: MouseEvent) {
        event.preventDefault();
        if (this.processFullscreenRequest(event.clientX, event.clientY)) {
            return;
        }

        if (event.clientX < this.canvas.width / 2) {
            this.leftTouchStart = new CanvasTouch();
            this.leftTouchStart.id = 0;
            this.leftTouchStart.x = event.screenX;
            this.leftTouchStart.y = event.screenY;
            this.leftTouchCurrent = null;
        }
        else {
            this.rightTouchCurrent = new CanvasTouch();
            this.rightTouchCurrent.id = 0;
            this.rightTouchCurrent.x = event.screenX;
            this.rightTouchCurrent.y = event.screenY;
        }
    }

    mouseup(event: MouseEvent) {
        event.preventDefault();
        this.leftTouchStart = null;
        this.leftTouchCurrent = null;
        this.rightTouchCurrent = null;
    }

    mousemove(event: MouseEvent) {
        event.preventDefault();
        if (this.leftTouchStart) {
            this.leftTouchCurrent = new CanvasTouch();
            this.leftTouchCurrent.id = 0;
            this.leftTouchCurrent.x = event.screenX;
            this.leftTouchCurrent.y = event.screenY;
        }
    }

    init(gameIdentifier: string) {

        if (gameIdentifier.indexOf("debug") > 0) {
            this.debugEnabled = true;
        }

        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        canvas.width = window.innerWidth * 0.95;
        canvas.height = window.innerHeight * 0.95;
        canvas.focus();

        window.addEventListener('resize', () => {
            console.log("resize");
            const d = <HTMLDocumentEx>document;
            if (d.webkitFullscreenElement ||
                d.fullscreenElement) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            else {
                canvas.width = window.innerWidth * 0.95;
                canvas.height = window.innerHeight * 0.95;
            }
        });

        window.addEventListener('error', function (e: ErrorEvent) {
            let message = "Error: " + e.message + " at line " + e.lineno;
            console.log(message);
            alert(message);
        });

        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.keydown(event);
            if (event.keyCode != KeyCodes.F12) {
                event.preventDefault();
            }
        });
        document.addEventListener('keyup', (event: KeyboardEvent) => {
            this.keyup(event);
            if (event.keyCode != KeyCodes.F12) {
                event.preventDefault();
            }
        });

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.context.font = "14pt Arial";

        this.canvas.addEventListener('touchstart', (event: TouchEvent) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                let touch = event.changedTouches[i];

                if (this.processFullscreenRequest(touch.clientX, touch.clientY)) {
                    return;
                }

                if (touch.clientX < this.canvas.width / 2) {
                    this.leftTouchStart = {
                        id: touch.identifier,
                        x: touch.clientX,
                        y: touch.clientY
                    } as CanvasTouch;
                    this.leftTouchCurrent = null;
                }
                else {
                    this.rightTouchCurrent = {
                        id: touch.identifier,
                        x: touch.clientX,
                        y: touch.clientY
                    } as CanvasTouch;
                }
            }
        }, false);
        this.canvas.addEventListener('touchend', (event: TouchEvent) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                let touch = event.changedTouches[i];
                if (touch.clientX < this.canvas.width / 2) {
                    this.leftTouchStart = null;
                    this.leftTouchCurrent = null;
                }
                else {
                    this.rightTouchCurrent = null;
                }
            }
        }, false);
        this.canvas.addEventListener('touchcancel', (event: TouchEvent) => {
            event.preventDefault();
            for (let i = 0; i < event.changedTouches.length; i++) {
                let touch = event.changedTouches[i];
                if (touch.clientX < this.canvas.width / 2) {
                    this.leftTouchStart = null;
                    this.leftTouchCurrent = null;
                }
                else {
                    this.rightTouchCurrent = null;
                }
            }
        }, false);
        this.canvas.addEventListener('touchmove', (event: TouchEvent) => {
            event.preventDefault();

            for (let i = 0; i < event.changedTouches.length; i++) {
                let touch = event.changedTouches[i];
                if (this.leftTouchStart != undefined && this.leftTouchStart.id == touch.identifier) {
                    this.leftTouchCurrent = new CanvasTouch();
                    this.leftTouchCurrent.id = touch.identifier;
                    this.leftTouchCurrent.x = touch.clientX;
                    this.leftTouchCurrent.y = touch.clientY;
                }
                else if (this.rightTouchCurrent != undefined && this.rightTouchCurrent.id == touch.identifier) {
                    this.rightTouchCurrent = new CanvasTouch();
                    this.rightTouchCurrent.id = touch.identifier;
                    this.rightTouchCurrent.x = touch.clientX;
                    this.rightTouchCurrent.y = touch.clientY;
                }
            }
        }, false);

        canvas.addEventListener('mousedown', (event: MouseEvent) => this.mousedown(event));
        canvas.addEventListener('mousemove', (event: MouseEvent) => this.mousemove(event));
        canvas.addEventListener('mouseup', (event: MouseEvent) => this.mouseup(event));

        this.points = 0;

        this.playerMetadata = new PlayerMetadata();
        this.playerMetadata.player.x = 10000;
        this.playerMetadata.player.y = 10000;
        this.playerMetadata.color = "red";
        this.resetRocket();

        this.others = new Map<number, PlayerMetadata>();

        this.communication.connect();
        this.setPoints();
    }

    resetRocket() {
        this.playerMetadata.player.rotation = Math.PI * 3 / 2;
        this.playerMetadata.player.speed = 0;
    }

    requestAnimationFrame(timestamp: number) {
        this.update(timestamp);
        window.requestAnimationFrame(this.requestAnimationFrame.bind(this));
    }

    fixShotUndefinedProperties(shot: Shot): void {
        if (shot.rotation == undefined) shot.rotation = 0;
        if (shot.speed == undefined) shot.speed = 0;
        if (shot.time == undefined) shot.time = 0;
        if (shot.type == undefined) shot.type = "";
        if (shot.x == undefined) shot.x = 0;
        if (shot.y == undefined) shot.y = 0;
    }

    fixPlayerUndefinedProperties(player: Player): void {
        if (player.animation == undefined) player.animation = null;
        if (player.animationTiming == undefined) player.animationTiming = 0;
        if (player.time == undefined) player.time = 0;
        if (player.top == undefined) player.top = false;
        if (player.bottom == undefined) player.bottom = false;
        if (player.left == undefined) player.left = false;
        if (player.right == undefined) player.right = false;
        if (player.rotation == undefined) player.rotation = 0;
        if (player.x == undefined) player.x = 0;
        if (player.y == undefined) player.y = 0;
        if (player.fire1 == undefined) player.fire1 = false;
        if (player.fire2 == undefined) player.fire2 = false;
        if (player.speed == undefined) player.speed = 0;
    }

    constantsUpdate(constants: Constants): void {
        console.log(constants);
        this.constants = constants;

        // Start animations
        this.requestAnimationFrame(0);
    }

    fireCommand(shot: Shot): void {
        //this.log("shot received: " + shot.id);
        this.fixShotUndefinedProperties(shot);
        let existingShot = this.shots.get(shot.id);
        if (existingShot != null) {
            existingShot.time = shot.time;
        }
        else {
            this.shots.set(shot.id, shot);
        }
    }

    playerUpdateCommand(player: Player): void {
        //this.log("Player update: " + player.id);
        //console.log(player);
        this.fixPlayerUndefinedProperties(player);
        if (player.id == this.playerMetadata.id) {
            // Self update
            let deltaX = this.playerMetadata.player.x - player.x;
            let deltaY = this.playerMetadata.player.y - player.y;
            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 10) {
                this.log("Player " + player.id + " distance from existing location " + distance + ".");
            }

            this.playerMetadata.player = player;
        }
        else {
            let playerMetadata = this.others.get(player.id);
            let deltaX = playerMetadata.player.x - player.x;
            let deltaY = playerMetadata.player.y - player.y;
            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 10) {
                this.log("Player " + player.id + " distance from existing location " + distance + ".");
            }

            if (playerMetadata != null) {
                playerMetadata.player = player;
            }
        }
    }

    playerMetadataUpdateCommand(action: string, playerMetadata: PlayerMetadata): void {
        //this.log("Player metadata update: " + action + " - " + playerMetadata.id);
        console.log(playerMetadata);
        if (playerMetadata.player != undefined) {
            this.fixPlayerUndefinedProperties(playerMetadata.player);
        }

        if (action == PlayerMetadataAction.add) {
            this.others.set(playerMetadata.id, playerMetadata);
        }
        else if (action == PlayerMetadataAction.delete) {
            this.others.delete(playerMetadata.id);
        }
        else if (action == PlayerMetadataAction.self) {
            this.playerMetadata = playerMetadata;
        }
    }

    updatePlayer(player: Player, delta: number) {

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
    }

    private fixAngle(angle: number): number {
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        else if (angle > 2 * Math.PI) {
            angle -= 2 * Math.PI;
        }
        return angle;
    }

    private radToDegrees(angle: number): number {
        return angle * 90 / Math.PI * 2;
    }

    update(timestamp: number) {
        let delta = (timestamp - this.animationUpdate) / 1000;

        this.updatePlayer(this.playerMetadata.player, delta);
        this.others.forEach(p => {
            this.updatePlayer(p.player, delta);
        });

        this.processInput();

        let deletedShots = new Array<number>();

        this.shots.forEach(s => {
            s.x += delta * s.speed * Math.cos(s.rotation);
            s.y += delta * s.speed * Math.sin(s.rotation);
            s.time -= delta;
            if (s.time < 0) {
                deletedShots.push(s.id);
            }
        });
        for (let i = 0; i < deletedShots.length; i++) {
            this.shots.delete(deletedShots[i]);
        }

        // Send only if properties have changed.
        let send = false;
        let properties = ["left", "right", "top", "bottom", "fire1", "fire2"];
        for (let propertyIndex in properties) {
            let property = properties[propertyIndex];
            let left = this.sendUpdatePlayer[property];
            let right = this.playerMetadata.player[property];
            if (left != right) {
                send = true;
                this.sendUpdatePlayer[property] = right;
            }
        }

        if (send || timestamp > this.sendUpdate + this.constants.network.sendUpdateFrequency) {
            let ts = (timestamp - this.sendUpdate) / 1000;
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
    }

    private processInput() {
        this.playerMetadata.player.left = this.keyboard.has(KeyCodes.LeftArrow) || this.keyboard.has(KeyCodes.KeyA);
        this.playerMetadata.player.right = this.keyboard.has(KeyCodes.RightArrow) || this.keyboard.has(KeyCodes.KeyD);
        this.playerMetadata.player.top = this.keyboard.has(KeyCodes.UpArrow) || this.keyboard.has(KeyCodes.KeyW);
        this.playerMetadata.player.bottom = this.keyboard.has(KeyCodes.DownArrow) || this.keyboard.has(KeyCodes.KeyS);
        this.playerMetadata.player.fire1 = this.keyboard.has(KeyCodes.Space) || this.rightTouchCurrent != null;
        if (this.keyboard.has(KeyCodes.KeyE)) {
            this.playerMetadata.player.animation = this.constants.animation.explosionAnimationName;
            this.playerMetadata.player.animationTiming = this.constants.animation.explosionAnimationDuration;
        }
        if (this.leftTouchStart && this.leftTouchCurrent) {
            // TODO: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
            let touchx = this.leftTouchCurrent.x - this.leftTouchStart.x;
            let touchy = this.leftTouchCurrent.y - this.leftTouchStart.y;
            let angle = Math.atan2(touchy, touchx);
            angle = angle < 0 ? Math.PI * 2 + angle : angle;
            let rotation = this.playerMetadata.player.rotation;
            let deltaLeft = this.fixAngle(rotation - angle);
            let deltaRight = this.fixAngle(angle - this.playerMetadata.player.rotation);
            let len = Math.sqrt(touchx * touchx + touchy * touchy);
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
    }

    draw() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const lineSpaceWidth = 45;
        const lineSpaceHeight = 45;

        let offsetX = this.playerMetadata.player.x % lineSpaceWidth;
        let offsetY = this.playerMetadata.player.y % lineSpaceHeight;

        for (let i = 0; i <= this.canvas.width / lineSpaceWidth; i++) {
            const lineX = i * lineSpaceWidth;

            this.context.beginPath();
            this.context.moveTo(lineX - offsetX, 0);
            this.context.lineTo(lineX - offsetX, this.canvas.height);
            this.context.stroke();
        }
        for (let i = 0; i <= this.canvas.height / lineSpaceHeight; i++) {
            const lineY = i * lineSpaceHeight;

            this.context.beginPath();
            this.context.moveTo(0, lineY - offsetY);
            this.context.lineTo(this.canvas.width, lineY - offsetY);
            this.context.stroke();
        }

        this.others.forEach(p => {
            this.drawPlayer(p);
        });

        this.drawPlayer(this.playerMetadata);

        this.shots.forEach(s => {
            this.drawShot(s);
        });

        // Click to fullscreen area
        this.context.strokeRect(this.canvas.width * 0.9, 0, this.canvas.width * 0.1, this.canvas.height * 0.1);

        this.context.fillStyle = "black";
        for (let i = 0; i < this.debug.length; i++) {
            let message = this.debug[i];
            this.context.fillText(message, 40, i * 20);
        }
        this.context.restore();
    }

    private drawShot(shot: Shot) {
        let x = shot.x - this.playerMetadata.player.x;
        let y = shot.y - this.playerMetadata.player.y;

        let screenx = x + this.canvas.width / 2;
        let screeny = y + this.canvas.height / 2;

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
    }

    private drawPlayer(playerMetadata: PlayerMetadata) {
        let x = playerMetadata.player.x - this.playerMetadata.player.x;
        let y = playerMetadata.player.y - this.playerMetadata.player.y;

        let screenx = x + this.canvas.width / 2;
        let screeny = y + this.canvas.height / 2;

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
            let rectx1 = this.playerMetadata.player.x - this.canvas.width / 2;
            let recty1 = this.playerMetadata.player.y - this.canvas.height / 2;
            let rectx2 = this.playerMetadata.player.x + this.canvas.width / 2;
            let recty2 = this.playerMetadata.player.y + this.canvas.height / 2;
            let topLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx1, recty1, rectx2, recty1);
            let bottomLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx1, recty2, rectx2, recty2);
            let leftLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx1, recty1, rectx1, recty2);
            let rightLine = this.calculateIntersection(this.playerMetadata.player.x, this.playerMetadata.player.y, playerMetadata.player.x, playerMetadata.player.y, rectx2, recty1, rectx2, recty2);

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
    }

    private calculateIntersection(
        x1: number, y1: number,
        x2: number, y2: number,
        x3: number, y3: number,
        x4: number, y4: number): Point | null {
        let point = new Point();

        // Algorithm based on this Wikipedia article:
        // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
        point.x = Math.floor((
            (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4))
            /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)));
        point.y = Math.floor((
            (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4))
            /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)));
        if (point.x && point.y) {
            let minx = Math.min(x1, x2);
            let maxx = Math.max(x1, x2);
            let miny = Math.min(y1, y2);
            let maxy = Math.max(y1, y2);

            if (point.x >= minx && point.x <= maxx && point.y >= miny && point.y <= maxy) {
                // This is inside line segment
                return point;
            }
        }

        return null;
    }

    keydown(evt: KeyboardEvent) {
        if (!this.keyboard.has(evt.keyCode)) {
            this.keyboard.set(evt.keyCode, Date.now());
        }
    }

    keyup(evt: KeyboardEvent) {
        if (this.keyboard.delete(evt.keyCode)) {
            //this.log("keyup: " + evt.keyCode);
        }
    }

    setPoints() {
        //const text = "Score: " + this.points;
        document.title = "Rocket";
        //document.getElementById("text").innerText = text;
    }
}
