export type SpawnCell = "x" | "c" | "o";

export type SpawnRow = [SpawnCell, SpawnCell, SpawnCell];

export interface SpawnPattern {
  rows: readonly SpawnRow[];
  hasCollectible: boolean;
}

export interface SpawnConfig {
  spawnZ: number;
  rowSpacing: number;
  initialDelay: number;
  skipChance: number;
  maxConsecutiveSkips: number;
  maxPatternsWithoutCollectible: number;
}

export const SPAWN_CONFIG: SpawnConfig = {
  spawnZ: -35,
  rowSpacing: 6,
  initialDelay: 1,
  skipChance: 0.25,
  maxConsecutiveSkips: 2,
  maxPatternsWithoutCollectible: 4,
};

export const PATTERNS: readonly SpawnPattern[] = [
  {
    rows: [
      ["c", "c", "c"],
      ["o", "o", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "o"],
      ["o", "x", "o"],
      ["o", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["x", "o", "x"],
      ["x", "o", "x"],
      ["x", "o", "x"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["x", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "x"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "x"],
      ["x", "x", "o"],
      ["o", "x", "x"],
      ["x", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["x", "o", "x"],
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "x"],
      ["o", "o", "x"],
      ["o", "x", "x"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["x", "x", "o"],
      ["x", "o", "o"],
      ["x", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "o", "x"],
      ["x", "o", "o"],
      ["o", "o", "x"],
      ["x", "o", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "o", "x"],
      ["o", "x", "x"],
      ["o", "x", "o"],
      ["x", "x", "o"],
      ["x", "o", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["x", "o", "o"],
      ["x", "x", "o"],
      ["o", "x", "o"],
      ["o", "x", "x"],
      ["o", "o", "x"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["x", "o", "o"],
      ["o", "x", "o"],
      ["o", "o", "x"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["x", "o", "x"],
      ["x", "x", "o"],
      ["o", "x", "x"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "x"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "o", "o"],
      ["o", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "o"],
      ["o", "o", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "o"],
      ["o", "x", "o"],
      ["o", "o", "o"],
      ["o", "x", "o"],
      ["o", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "x"],
      ["o", "x", "o"],
      ["x", "x", "o"],
      ["x", "o", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "x"],
      ["x", "x", "o"],
    ],
    hasCollectible: false,
  },

  {
    rows: [
      ["o", "c", "o"],
      ["o", "c", "o"],
      ["o", "c", "o"],
      ["x", "c", "x"],
    ],
    hasCollectible: true,
  },

  {
    rows: [
      ["c", "x", "o"],
      ["o", "c", "x"],
      ["x", "o", "c"],
      ["c", "x", "o"],
    ],
    hasCollectible: true,
  },

  {
    rows: [
      ["o", "c", "o"],
      ["o", "x", "o"],
      ["x", "c", "x"],
      ["o", "x", "o"],
      ["o", "c", "o"],
    ],
    hasCollectible: true,
  },

  {
    rows: [
      ["o", "c", "x"],
      ["x", "o", "c"],
      ["c", "x", "o"],
      ["o", "c", "x"],
    ],
    hasCollectible: true,
  },

  {
    rows: [
      ["o", "x", "o"],
      ["x", "c", "x"],
      ["o", "o", "x"],
      ["x", "c", "o"],
      ["o", "x", "x"],
      ["x", "o", "c"],
      ["o", "x", "o"],
    ],
    hasCollectible: true,
  },
];
