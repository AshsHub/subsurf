export class GameProgress {
  private _collections = 0;

  public get collections(): number {
    return this._collections;
  }

  public addCollection(): number {
    this._collections++;
    return this._collections;
  }

  public reset(): void {
    this._collections = 0;
  }
}
