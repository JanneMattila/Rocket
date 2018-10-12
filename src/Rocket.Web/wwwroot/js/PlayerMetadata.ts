import { Player } from "./Player";

export class PlayerMetadata {
    id: number;
    color: string;
    player: Player;

    constructor() {
        this.id = 0;
        this.color = "yellow";
        this.player = new Player();
    }
}
