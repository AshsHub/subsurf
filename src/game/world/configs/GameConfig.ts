export interface GameSpeedConfig {
  initial: number;
  maximum: number;
  acceleration: number;
}

export const GAME_SPEED: GameSpeedConfig = {
  initial: 5,
  maximum: 25,
  acceleration: 0.5,
};

export const PICKUP_CONFIG = {
  pointTarget: 20,
};

export const TRACK_CONFIG = {
  width: 8,
  length: 100,
  uvRepeatX: 1,
  uvRepeatY: 5,
};

export const OBSTACLE_CONFIG = {
  body: {
    width: 1.5,
    height: 0.6,
    depth: 0.5,
  },
};

export const COLLECTIBLE_CONFIG = {
  body: {
    width: 0.5,
    height: 0.5,
    depth: 0.25,
  },
  spinSpeed: 10,
};

export const PLAYER_CONFIG = {
  body: {
    width: 1,
    height: 1,
    depth: 1,
  },
};
