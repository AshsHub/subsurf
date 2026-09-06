export interface GameSpeedConfig {
  initial: number;
  maximum: number;
  acceleration: number;
  sideCollisionPenalty: number;
}

export const GAME_SPEED: GameSpeedConfig = {
  initial: 5,
  maximum: 16,
  acceleration: 0.18,
  sideCollisionPenalty: 3,
};

export const PICKUP_CONFIG = {
  pointTarget: 30,
};

export const COLLECTIBLE_CONFIG = {
  spinSpeed: 10,
};
