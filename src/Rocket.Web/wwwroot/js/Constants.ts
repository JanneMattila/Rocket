export class Constants {
    world: WorldConstants;
    network: NetworkConstants;
    movement: MovementConstants;
    shooting: ShootingConstants;
    animation: AnimationConstants;
}

export class WorldConstants {
    rocket: Size;
    rocketIcon: number;

    shot: Size;
}

export class NetworkConstants {
    sendUpdateFrequency: number;
}

export class MovementConstants {
    accelerationRate: number;
    deAccelerationRate: number;
    brakeRate: number;
    turnRate: number;
    maxSpeedPerSecond: number;
}

export class ShootingConstants {
    speedPerSecond: number;
    shotDuration: number;
}

export class AnimationConstants {
    screenUpdateFrequency: number;

    explosionAnimationName: string;
    explosionAnimationDuration: number;
}

export class Size {
    width: number;
    height: number;
}
