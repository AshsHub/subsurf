export type GameState = "idle" | "playing" | "paused" | "ended";
export type GameResult = "won" | "lost" | null;

export class GameStateManager {
  private state: GameState = "idle";
  private result: GameResult = null;

  public getState(): GameState {
    return this.state;
  }

  public getResult(): GameResult {
    return this.result;
  }

  public start(): void {
    if (this.state !== "idle") {
      return;
    }

    this.result = null;
    this.state = "playing";
  }

  public pause(): void {
    if (this.state !== "playing") {
      return;
    }

    this.state = "paused";
  }

  public resume(): void {
    if (this.state !== "paused") {
      return;
    }

    this.state = "playing";
  }

  public end(result: Exclude<GameResult, null>): void {
    if (this.state !== "playing") {
      return;
    }

    this.result = result;
    this.state = "ended";
  }

  public reset(): void {
    this.result = null;
    this.state = "idle";
  }
}
