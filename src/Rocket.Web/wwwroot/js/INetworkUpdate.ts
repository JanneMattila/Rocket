import { Constants } from "./Constants";
import { Player } from "./Player";
import { Shot } from "./Shot";
import { PlayerMetadata } from "./PlayerMetadata";
import { PlayerMetadataAction } from "./PlayerMetadataAction";

export interface INetworkUpdate {
    constantsUpdate(constants: Constants): void;
    playerUpdateCommand(player: Player): void;
    playerMetadataUpdateCommand(action: string, player: PlayerMetadata): void;
    fireCommand(shot: Shot): void;
}