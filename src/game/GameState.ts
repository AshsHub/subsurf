export type GameState = "idle" | "playing" | "paused" | "ended";
export type GameResult = "won" | "lost" | null;

export interface GameStateChange {
  previous: GameState;
  current: GameState;
  result: GameResult;
}

export class GameStateManager {
  private _state: GameState = "idle";
  private _result: GameResult = null;

  private readonly _listeners = new Set<(change: GameStateChange) => void>();

  public get state(): GameState {
    return this._state;
  }

  public get result(): GameResult {
    return this._result;
  }

  public onChange(listener: (change: GameStateChange) => void): void {
    this._listeners.add(listener);
  }

  public start(): void {
    if (this._state !== "idle") {
      return;
    }

    this._result = null;
    this._changeState("playing");
  }

  public pause(): void {
    if (this._state !== "playing") {
      return;
    }

    this._changeState("paused");
  }

  public resume(): void {
    if (this._state !== "paused") {
      return;
    }

    this._changeState("playing");
  }

  public end(result: Exclude<GameResult, null>): void {
    if (this._state !== "playing" && this._state !== "paused") {
      return;
    }

    this._result = result;
    this._changeState("ended");
  }

  public reset(): void {
    this._result = null;
    this._changeState("idle");
  }

  private _changeState(state: GameState): void {
    const previous = this._state;

    if (previous === state) {
      return;
    }

    this._state = state;

    const change = {
      previous,
      current: state,
      result: this._result,
    };

    for (const listener of this._listeners) {
      listener(change);
    }
  }
}
