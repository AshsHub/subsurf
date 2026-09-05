import type { WorldEntity } from "../entity/base/WorldEntity";

export interface ColliderOptions {
  width: number;
  height: number;
  depth: number;
  layer: CollisionLayer;

  offsetX?: number;
  offsetY?: number;
  offsetZ?: number;

  enabled?: boolean;
}

export enum CollisionLayer {
  Player,
  Collectible,
  Obstacle,
}

export class Collider {
  readonly entity: WorldEntity;

  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly layer: CollisionLayer;

  readonly offsetX: number;
  readonly offsetY: number;
  readonly offsetZ: number;

  private _enabled: boolean;

  constructor(entity: WorldEntity, options: ColliderOptions) {
    this.entity = entity;

    this.width = options.width;
    this.height = options.height;
    this.depth = options.depth;
    this.layer = options.layer;

    this.offsetX = options.offsetX ?? 0;
    this.offsetY = options.offsetY ?? 0;
    this.offsetZ = options.offsetZ ?? 0;

    this._enabled = options.enabled ?? true;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
  }

  get centerX(): number {
    return this.entity.position.x + this.offsetX;
  }

  get centerY(): number {
    return this.entity.position.y + this.offsetY;
  }

  get centerZ(): number {
    return this.entity.position.z + this.offsetZ;
  }

  get minX(): number {
    return this.centerX - this.width / 2;
  }

  get maxX(): number {
    return this.centerX + this.width / 2;
  }

  get minY(): number {
    return this.centerY - this.height / 2;
  }

  get maxY(): number {
    return this.centerY + this.height / 2;
  }

  get minZ(): number {
    return this.centerZ - this.depth / 2;
  }

  get maxZ(): number {
    return this.centerZ + this.depth / 2;
  }
}
