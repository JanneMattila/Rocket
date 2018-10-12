export class Player {
    id: number;
    color: string;

    rotation: number;
    speed: number;
    x: number;
    y: number;

    animation: string;
    animationTiming: number;
    shotUpdateFrequency: number

    fire1: boolean;
    fire2: boolean;
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;

    time: number;

    constructor() {
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
}
