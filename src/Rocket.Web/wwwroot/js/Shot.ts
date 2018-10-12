export class Shot {
    id: number;
    parent: number;
    type: string;

    time: number;
    rotation: number;
    speed: number;
    x: number;
    y: number;

    constructor() {
        this.id = 0;
        this.parent = 0;
        this.type = "basic";
        this.time = 0;
        this.rotation = 0;
        this.speed = 0;
        this.x = 0;
        this.y = 0;
    }
}
