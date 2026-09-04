import type { CollisionManager } from "./CollisionManager";
import type { WorldEntity } from "./world/entity/base/WorldEntity";
import type { GameWorld } from "./world/GameWorld";

export class EntityManager {
  private readonly _entities = new Set<WorldEntity>();
  private _collisionManager!: CollisionManager;
  private _gameWorld!: GameWorld;

  public init(world: GameWorld, collisionManager: CollisionManager): void {
    this._gameWorld = world;
    this._collisionManager = collisionManager;
  }

  public add<T extends WorldEntity>(entity: T): T {
    if (entity.destroyed) {
      throw new Error("Cannot add a destroyed entity");
    }

    if (this._entities.has(entity)) {
      return entity;
    }

    this._entities.add(entity);
    this._gameWorld.addChild(entity);

    if (entity.collider) {
      this._collisionManager.add(entity.collider);
    }

    entity.onAdded();

    return entity;
  }

  public remove(entity: WorldEntity): void {
    if (!this._entities.has(entity)) {
      return;
    }

    this._entities.delete(entity);

    if (entity.collider) {
      this._collisionManager.remove(entity.collider);
    }

    if (entity.parent === this._gameWorld) {
      this._gameWorld.removeChild(entity);
    }
  }

  public destroy(entity: WorldEntity): void {
    if (!this._entities.has(entity)) {
      return;
    }

    this.remove(entity);
    entity.destroyEntity();
  }

  public update(deltaTime: number, speed: number): void {
    for (const entity of this._entities) {
      if (entity.destroyed || !entity.shouldUpdate) {
        continue;
      }

      entity.update(deltaTime, speed);
    }
  }

  public forEach(callback: (entity: WorldEntity) => void): void {
    for (const entity of this._entities) {
      callback(entity);
    }
  }

  public getEntities(): readonly WorldEntity[] {
    return [...this._entities];
  }

  public clear(): void {
    for (const entity of this._entities) {
      entity.destroyEntity();
    }

    this._entities.clear();
    this._gameWorld.removeChildren();
  }

  public has(entity: WorldEntity): boolean {
    return this._entities.has(entity);
  }

  public get size(): number {
    return this._entities.size;
  }
}
