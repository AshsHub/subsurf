export enum GameState {
  Idle,
  Playing,
  Paused,
  Ended,
}
export enum GameResult {
  Won,
  Lost,
}

type GameResultOrNull = GameResult | null;

export interface GameStateChange {
  from: GameState;
  to: GameState;
  result: GameResultOrNull;
}
export class GameStateManager {
  private _state: GameState = GameState.Idle;
  private _result: GameResultOrNull = null;
  private readonly _listeners = new Set<(change: GameStateChange) => void>();
  public get state(): GameState {
    return this._state;
  }
  public get result(): GameResultOrNull {
    return this._result;
  }
  public onChange(listener: (change: GameStateChange) => void): void {
    this._listeners.add(listener);
  }
  public start(): void {
    if (this._state !== GameState.Idle) {
      return;
    }
    this._result = null;
    this._changeState(GameState.Playing);
  }
  public pause(): void {
    if (this._state !== GameState.Playing) {
      return;
    }
    this._changeState(GameState.Paused);
  }
  public resume(): void {
    if (this._state !== GameState.Paused) {
      return;
    }
    this._changeState(GameState.Playing);
  }
  public end(result: Exclude<GameResult, null>): void {
    if (this._state !== GameState.Playing && this._state !== GameState.Paused) {
      return;
    }
    this._result = result;
    this._changeState(GameState.Ended);
  }
  public reset(): void {
    this._result = null;
    this._changeState(GameState.Idle);
  }
  private _changeState(to: GameState): void {
    const from = this._state;
    if (from === to) {
      return;
    }
    this._state = to;
    const change: GameStateChange = { from, to, result: this._result };
    for (const listener of this._listeners) {
      listener(change);
    }
  }
}
