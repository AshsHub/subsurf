import { Subject } from "rxjs";
import type { Lane } from "./world/configs/LaneConfig";
import type {
  SpawnCell,
  SpawnConfig,
  SpawnPattern,
} from "./world/configs/SpawnConfig";

export type SpawnData = { type: SpawnCell; lane: Lane; z: number };
type SpawnState = "idle" | "running" | "paused" | "ended";
export class SpawnManager {
  public onSpawn: Subject<SpawnData> = new Subject<SpawnData>();

  private readonly _patterns: readonly SpawnPattern[];
  private readonly _config: SpawnConfig;

  private _state: SpawnState = "idle";

  private _currentPattern: SpawnPattern | null = null;
  private _rowIndex = 0;
  private _distanceUntilNextRow = 0;
  private _timeUntilFirstSpawn = 0;
  private _consecutiveSkips = 0;

  constructor(patterns: readonly SpawnPattern[], config: SpawnConfig) {
    if (patterns.length === 0) {
      throw new Error("SpawnManager requires at least one pattern");
    }

    this._patterns = patterns;
    this._config = config;
  }

  public start(): void {
    if (this._state !== "idle") {
      return;
    }

    this._state = "running";

    this._currentPattern = this._getRandomPattern();
    this._rowIndex = 0;
    this._consecutiveSkips = 0;
    this._timeUntilFirstSpawn = this._config.initialDelay;
    this._distanceUntilNextRow = 0;
  }

  public pause(): void {
    if (this._state !== "running") {
      return;
    }

    this._state = "paused";
  }

  public resume(): void {
    if (this._state !== "paused") {
      return;
    }

    this._state = "running";
  }

  public end(): void {
    if (this._state !== "running" && this._state !== "paused") {
      return;
    }

    this._state = "ended";
  }

  public reset(): void {
    this._state = "idle";

    this._currentPattern = null;
    this._rowIndex = 0;
    this._consecutiveSkips = 0;
    this._timeUntilFirstSpawn = 0;
    this._distanceUntilNextRow = 0;
  }

  public update(deltaTime: number, speed: number): void {
    if (this._state !== "running") {
      return;
    }

    if (this._timeUntilFirstSpawn > 0) {
      this._timeUntilFirstSpawn -= deltaTime;

      if (this._timeUntilFirstSpawn > 0) {
        return;
      }
    }

    this._distanceUntilNextRow -= speed * deltaTime;

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

      this.onSpawn.next({
        type: cell,
        lane: lane as Lane,
        z: this._config.spawnZ,
      });
    }
  }

  private _finishPattern(): void {
    const nextPattern = this._getRandomPattern();

    const canSkip = this._consecutiveSkips < this._config.maxConsecutiveSkips;

    const shouldSkip = canSkip && Math.random() < this._config.skipChance;

    if (shouldSkip) {
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
