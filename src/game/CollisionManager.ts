import { CollisionLayer, type Collider } from "./world/component/Collider";

export enum CollisionSide {
  Top,
  Bottom,
  Left,
  Right,
  Front,
  Back,
}

export type CollisionResult = {
  player: Collider;
  collider: Collider;
  side: CollisionSide;
};

export type CollisionHandler = (collision: CollisionResult) => void;

export class CollisionManager {
  private readonly _colliders = new Set<Collider>();
  private readonly _onCollision?: CollisionHandler;
  private readonly _colliderBuffer: Collider[] = [];

  constructor(onCollision?: CollisionHandler) {
    this._onCollision = onCollision;
  }

  public add(collider: Collider): void {
    this._colliders.add(collider);
  }

  public remove(collider: Collider): void {
    this._colliders.delete(collider);
  }

  public update(): void {
    this._colliderBuffer.length = 0;

    for (const collider of this._colliders) {
      this._colliderBuffer.push(collider);
    }

    const colliders = this._colliderBuffer;

    for (let i = 0; i < colliders.length; i++) {
      const a = colliders[i];

      if (!a.enabled) {
        continue;
      }

      for (let j = i + 1; j < colliders.length; j++) {
        const b = colliders[j];

        if (!b.enabled) {
          continue;
        }

        if (!this._canCollide(a, b)) {
          continue;
        }

        if (!this._intersects(a, b)) {
          continue;
        }

        const player = a.layer === CollisionLayer.Player ? a : b;
        const collider = player === a ? b : a;
        const side = this._getCollisionSide(player, collider);

        this._onCollision?.({
          player,
          collider,
          side,
        });

        return;
      }
    }
  }

  private _canCollide(a: Collider, b: Collider): boolean {
    return (
      (a.layer === CollisionLayer.Player &&
        (b.layer === CollisionLayer.Obstacle ||
          b.layer === CollisionLayer.Collectible)) ||
      (b.layer === CollisionLayer.Player &&
        (a.layer === CollisionLayer.Obstacle ||
          a.layer === CollisionLayer.Collectible))
    );
  }

  private _intersects(a: Collider, b: Collider): boolean {
    return (
      a.minX < b.maxX &&
      a.maxX > b.minX &&
      a.minY < b.maxY &&
      a.maxY > b.minY &&
      a.minZ < b.maxZ &&
      a.maxZ > b.minZ
    );
  }

  private _getCollisionSide(
    player: Collider,
    collider: Collider,
  ): CollisionSide {
    const overlapX =
      Math.min(player.maxX, collider.maxX) -
      Math.max(player.minX, collider.minX);
    const overlapY =
      Math.min(player.maxY, collider.maxY) -
      Math.max(player.minY, collider.minY);
    const overlapZ =
      Math.min(player.maxZ, collider.maxZ) -
      Math.max(player.minZ, collider.minZ);

    const sideTolerance = 0.15;

    if (overlapX <= overlapZ + sideTolerance) {
      return player.centerX < collider.centerX
        ? CollisionSide.Right
        : CollisionSide.Left;
    }
    if (overlapY <= overlapZ) {
      return player.centerY < collider.centerY
        ? CollisionSide.Top
        : CollisionSide.Bottom;
    }
    return player.centerZ < collider.centerZ
      ? CollisionSide.Front
      : CollisionSide.Back;
  }

  public clear(): void {
    this._colliders.clear();
  }

  public getColliders(): readonly Collider[] {
    return [...this._colliders];
  }
}
