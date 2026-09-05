export type SpawnCell = "x" | "p" | "o";

export type SpawnRow = [SpawnCell, SpawnCell, SpawnCell];

export interface SpawnPattern {
  rows: readonly SpawnRow[];
}

export interface SpawnConfig {
  spawnZ: number;
  rowSpacing: number;
  initialDelay: number;
  skipChance: number;
  maxConsecutiveSkips: number;
}

export const SPAWN_CONFIG: SpawnConfig = {
  spawnZ: -35,
  // Distance between rows.
  rowSpacing: 5,
  // Seconds before the first pattern starts.
  initialDelay: 2,
  // 25% chance to skip a completed pattern.
  skipChance: 0.25,
  // Never skip more than this many patterns consecutively.
  maxConsecutiveSkips: 2,
};

export const PATTERNS: readonly SpawnPattern[] = [
  // 1. Three-wide wall
  {
    rows: [["o", "o", "o"]],
  },

  // 2. Outer lanes
  {
    rows: [
      ["o", "x", "o"],
      ["o", "x", "o"],
      ["o", "x", "o"],
    ],
  },

  // 3. Centre lane
  {
    rows: [
      ["x", "o", "x"],
      ["x", "o", "x"],
      ["x", "o", "x"],
    ],
  },

  // 4. Left → centre → right
  {
    rows: [
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
    ],
  },

  // 5. Right → centre → left
  {
    rows: [
      ["x", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "x"],
    ],
  },

  // 6. Zig-zag
  {
    rows: [
      ["o", "x", "x"],
      ["x", "x", "o"],
      ["o", "x", "x"],
      ["x", "x", "o"],
    ],
  },

  // 7. Centre → left → centre → right
  {
    rows: [
      ["x", "o", "x"],
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
    ],
  },

  // 8. Outer → centre → outer
  {
    rows: [
      ["o", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "o"],
    ],
  },

  // 9. Left lane blocked
  {
    rows: [
      ["o", "x", "x"],
      ["o", "o", "x"],
      ["o", "x", "x"],
    ],
  },

  // 10. Right lane blocked
  {
    rows: [
      ["x", "x", "o"],
      ["x", "o", "o"],
      ["x", "x", "o"],
    ],
  },

  // 11. Alternating walls
  {
    rows: [
      ["o", "o", "x"],
      ["x", "o", "o"],
      ["o", "o", "x"],
      ["x", "o", "o"],
    ],
  },

  // 12. Opening moves from left to right
  {
    rows: [
      ["o", "o", "x"],
      ["o", "x", "x"],
      ["o", "x", "o"],
      ["x", "x", "o"],
      ["x", "o", "o"],
    ],
  },

  // 13. Opening moves from right to left
  {
    rows: [
      ["x", "o", "o"],
      ["x", "x", "o"],
      ["o", "x", "o"],
      ["o", "x", "x"],
      ["o", "o", "x"],
    ],
  },

  // 14. Single gaps moving across lanes
  {
    rows: [
      ["x", "o", "o"],
      ["o", "x", "o"],
      ["o", "o", "x"],
    ],
  },

  // 15. Single safe lane moving across lanes
  {
    rows: [
      ["x", "o", "x"],
      ["x", "x", "o"],
      ["o", "x", "x"],
    ],
  },

  // 16. Alternating single obstacle
  {
    rows: [
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "x"],
    ],
  },

  // 17. Dense → sparse → dense
  {
    rows: [
      ["o", "o", "o"],
      ["o", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "o"],
      ["o", "o", "o"],
    ],
  },

  // 18. Centre corridor
  {
    rows: [
      ["o", "x", "o"],
      ["o", "x", "o"],
      ["o", "o", "o"],
      ["o", "x", "o"],
      ["o", "x", "o"],
    ],
  },

  // 19. Left/right alternation with centre openings
  {
    rows: [
      ["o", "x", "x"],
      ["o", "x", "o"],
      ["x", "x", "o"],
      ["x", "o", "o"],
    ],
  },

  // 20. Long zig-zag
  {
    rows: [
      ["o", "x", "x"],
      ["x", "o", "x"],
      ["x", "x", "o"],
      ["x", "o", "x"],
      ["o", "x", "x"],
      ["x", "x", "o"],
    ],
  },

  // 21. Pickup corridor
  {
    rows: [
      ["o", "p", "o"],
      ["o", "p", "o"],
      ["o", "p", "o"],
      ["x", "p", "x"],
    ],
  },

  // 22. Pickup on alternating lanes
  {
    rows: [
      ["p", "x", "o"],
      ["o", "p", "x"],
      ["x", "o", "p"],
      ["p", "x", "o"],
    ],
  },

  // 23. Pickup through a central opening
  {
    rows: [
      ["o", "p", "o"],
      ["o", "x", "o"],
      ["x", "p", "x"],
      ["o", "x", "o"],
      ["o", "p", "o"],
    ],
  },

  // 24. Mixed obstacle/pickup zig-zag
  {
    rows: [
      ["o", "p", "x"],
      ["x", "o", "p"],
      ["p", "x", "o"],
      ["o", "p", "x"],
    ],
  },

  // 25. Long mixed pattern
  {
    rows: [
      ["o", "x", "o"],
      ["x", "p", "x"],
      ["o", "o", "x"],
      ["x", "p", "o"],
      ["o", "x", "x"],
      ["x", "o", "p"],
      ["o", "x", "o"],
    ],
  },
];
