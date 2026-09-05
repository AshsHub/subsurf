import { PICKUP_CONFIG } from "./world/configs/GameConfig";

export class GameProgress {
  private _collections = 0;
  private _collectionsTarget = PICKUP_CONFIG.pointTarget;

  public get collections(): number {
    return this._collections;
  }

  public get collectionTarget(): number {
    return this._collectionsTarget;
  }

  public addCollection(): number {
    this._collections++;
    return this._collections;
  }

  public reset(): void {
    this._collections = 0;
  }
}
