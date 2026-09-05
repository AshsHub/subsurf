import { PICKUP_CONFIG } from "./world/configs/GameConfig";

export interface GameStats {
  collections: number;
  collectionTarget: number;
  distance: number;
}

export class GameProgress {
  private _collections = 0;
  private _collectionsTarget = PICKUP_CONFIG.pointTarget;
  private _distance = 0;

  public get collections(): number {
    return this._collections;
  }

  public get collectionTarget(): number {
    return this._collectionsTarget;
  }

  public get distance(): number {
    return this._distance;
  }

  public addCollection(): number {
    this._collections++;
    return this._collections;
  }

  public addDistance(distance: number): void {
    this._distance += distance;
  }

  public getStats(): GameStats {
    return {
      collections: this._collections,
      collectionTarget: this._collectionsTarget,
      distance: this._distance,
    };
  }

  public reset(): void {
    this._collections = 0;
    this._distance = 0;
  }
}
