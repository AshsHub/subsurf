const laneOffset = 2.25;
export const LANE_POSITIONS = [-laneOffset, 0, laneOffset] as const;
export type Lane = 0 | 1 | 2;
export const STARTING_LANE: Lane = 1;
