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
    this.changeState("playing");
  }

  public pause(): void {
    if (this.state !== "playing") {
      return;
    }

    this.changeState("paused");
  }

  public resume(): void {
    if (this.state !== "paused") {
      return;
    }

    this.changeState("playing");
  }

  public end(result: Exclude<GameResult, null>): void {
    if (this.state !== "playing") {
      return;
    }

    this.result = result;
    this.changeState("ended");
  }

  private changeState(newState: GameState): void {
    console.log(`Game state changed from ${this.state} to ${newState}`);
    this.state = newState;
  }

  public reset(): void {
    this.result = null;
    this.changeState("idle");
  }
}
