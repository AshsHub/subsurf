import type { WorldEntity } from "../entity/base/WorldEntity";

export interface CollisionComponentOptions {
  width: number;
  height: number;
  depth: number;
  layer: CollisionLayer;
  enabled?: boolean;
}

export type CollisionLayer = "player" | "obstacle";

export class CollisionComponent {
  readonly entity: WorldEntity;

  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly layer: CollisionLayer;

  private _enabled: boolean;

  constructor(entity: WorldEntity, options: CollisionComponentOptions) {
    this.entity = entity;

    this.width = options.width;
    this.height = options.height;
    this.depth = options.depth;
    this.layer = options.layer;

    this._enabled = options.enabled ?? true;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  get minX(): number {
    return this.entity.position.x - this.width / 2;
  }

  get maxX(): number {
    return this.entity.position.x + this.width / 2;
  }

  get minY(): number {
    return this.entity.position.y - this.height / 2;
  }

  get maxY(): number {
    return this.entity.position.y + this.height / 2;
  }

  get minZ(): number {
    return this.entity.position.z - this.depth / 2;
  }

  get maxZ(): number {
    return this.entity.position.z + this.depth / 2;
  }

  public canCollide(b: CollisionComponent): boolean {
    return (
      (this.layer === "player" && b.layer === "obstacle") ||
      (this.layer === "obstacle" && b.layer === "player")
    );
  }

  public intersects(b: CollisionComponent): boolean {
    return (
      this.minX < b.maxX &&
      this.maxX > b.minX &&
      this.minY < b.maxY &&
      this.maxY > b.minY &&
      this.minZ < b.maxZ &&
      this.maxZ > b.minZ
    );
  }
}
