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
  private _playerCollider?: Collider;

  constructor(onCollision?: CollisionHandler) {
    this._onCollision = onCollision;
  }

  public add(collider: Collider): void {
    this._colliders.add(collider);

    if (collider.layer === CollisionLayer.Player) {
      this._playerCollider = collider;
    }
  }

  public remove(collider: Collider): void {
    this._colliders.delete(collider);

    if (collider === this._playerCollider) {
      this._playerCollider = undefined;
    }
  }

  public update(): void {
    const player = this._playerCollider;

    if (!player?.enabled) {
      return;
    }

    for (const collider of this._colliders) {
      if (collider === player || !collider.enabled) {
        continue;
      }

      if (
        collider.layer !== CollisionLayer.Obstacle &&
        collider.layer !== CollisionLayer.Collectible
      ) {
        continue;
      }

      if (!this._intersects(player, collider)) {
        continue;
      }

      const side = this._getCollisionSide(player, collider);

      this._onCollision?.({
        player,
        collider,
        side,
      });

      return;
    }
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
    this._playerCollider = undefined;
  }

  public getColliders(): readonly Collider[] {
    return [...this._colliders];
  }
}
