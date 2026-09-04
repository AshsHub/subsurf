export const LANE_WIDTH = 2;

export const LANE_POSITIONS = {
  left: -LANE_WIDTH,
  centre: 0,
  right: LANE_WIDTH,
} as const;

export type Lane = keyof typeof LANE_POSITIONS;

export const STARTING_LANE: Lane = "centre";
