import type { Lane } from "./world/configs/LaneConfig";
import type {
  SpawnCell,
  SpawnConfig,
  SpawnPattern,
} from "./world/configs/SpawnConfig";

export class SpawnManager {
  private readonly _patterns: readonly SpawnPattern[];
  private readonly _config: SpawnConfig;

  private readonly _spawn: (type: SpawnCell, lane: Lane, z: number) => void;

  private _running = false;

  private _currentPattern: SpawnPattern | null = null;
  private _rowIndex = 0;
  private _distanceUntilNextRow = 0;
  private _timeUntilFirstSpawn = 0;
  private _consecutiveSkips = 0;

  constructor(
    patterns: readonly SpawnPattern[],
    config: SpawnConfig,
    spawn: (type: SpawnCell, lane: Lane, z: number) => void,
  ) {
    if (patterns.length === 0) {
      throw new Error("SpawnManager requires at least one pattern");
    }

    this._patterns = patterns;
    this._config = config;
    this._spawn = spawn;
  }

  public start(): void {
    if (this._running) {
      return;
    }

    this._running = true;

    this._currentPattern = this._getRandomPattern();
    this._rowIndex = 0;
    this._consecutiveSkips = 0;

    this._timeUntilFirstSpawn = this._config.initialDelay;
    this._distanceUntilNextRow = 0;
  }

  public stop(): void {
    this._running = false;
  }

  public reset(): void {
    this._running = false;
    this._currentPattern = null;
    this._rowIndex = 0;
    this._consecutiveSkips = 0;
    this._timeUntilFirstSpawn = 0;
    this._distanceUntilNextRow = 0;
  }

  public update(deltaTime: number, speed: number): void {
    if (!this._running) {
      return;
    }

    /*
     * Initial delay is real time, so handle that separately.
     */
    if (this._timeUntilFirstSpawn > 0) {
      this._timeUntilFirstSpawn -= deltaTime;

      if (this._timeUntilFirstSpawn > 0) {
        return;
      }
    }

    /*
     * Convert movement speed into distance travelled this frame.
     */
    this._distanceUntilNextRow -= speed * deltaTime;

    /*
     * Spawn rows whenever enough world-space distance has passed.
     */
    while (this._distanceUntilNextRow <= 0) {
      this._processNextRow();

      this._distanceUntilNextRow += this._config.rowSpacing;
    }
  }

  private _processNextRow(): void {
    if (this._currentPattern === null) {
      this._startNextPattern();
    }

    const row = this._currentPattern!.rows[this._rowIndex];

    this._spawnRow(row);

    this._rowIndex++;

    if (this._rowIndex >= this._currentPattern!.rows.length) {
      this._finishPattern();
    }
  }

  private _spawnRow(row: readonly SpawnCell[]): void {
    if (row.length !== 3) {
      throw new Error(
        `Spawn row must contain exactly 3 lanes. Received ${row.length}.`,
      );
    }

    for (let lane = 0; lane < 3; lane++) {
      const cell = row[lane];

      if (cell === "x") {
        continue;
      }

      this._spawn(cell, lane as Lane, this._config.spawnZ);
    }
  }

  private _finishPattern(): void {
    const nextPattern = this._getRandomPattern();

    const canSkip = this._consecutiveSkips < this._config.maxConsecutiveSkips;

    const shouldSkip = canSkip && Math.random() < this._config.skipChance;

    if (shouldSkip) {
      /*
       * A skipped pattern still consumes the same amount
       * of world-space distance that it would have occupied.
       */
      this._distanceUntilNextRow +=
        nextPattern.rows.length * this._config.rowSpacing;

      this._currentPattern = nextPattern;
      this._rowIndex = 0;
      this._consecutiveSkips++;

      return;
    }

    this._currentPattern = nextPattern;
    this._rowIndex = 0;
    this._consecutiveSkips = 0;
  }

  private _startNextPattern(): void {
    this._currentPattern = this._getRandomPattern();
    this._rowIndex = 0;
  }

  private _getRandomPattern(): SpawnPattern {
    const index = Math.floor(Math.random() * this._patterns.length);

    return this._patterns[index];
  }
}
