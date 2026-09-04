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
    width: 1,
    height: 1,
    depth: 1,
  },
};

export const PLAYER_CONFIG = {
  body: {
    width: 1,
    height: 1,
    depth: 1,
  },
};
