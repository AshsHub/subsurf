import type { CollisionManager } from "./CollisionManager";
import { EntityPool, POOL_ID, type Poolable } from "./EntityPool";

import type { WorldEntity } from "./world/entity/base/WorldEntity";
import { Collectible } from "./world/entity/Collectible";
import { Obstacle } from "./world/entity/Obstacle";
import type { GameWorld } from "./world/GameWorld";

export class EntityManager {
  private readonly _entityPool = new EntityPool();

  private readonly _entities = new Set<WorldEntity>();
  private readonly _activeEntities = new Set<WorldEntity>();

  private _collisionManager!: CollisionManager;
  private _gameWorld!: GameWorld;
  private _paused = false;

  public init(world: GameWorld, collisionManager: CollisionManager): void {
    this._gameWorld = world;
    this._collisionManager = collisionManager;
    this._registerPools();
  }

  private _registerPools(): void {
    this._entityPool.register(POOL_ID.obstacle, Obstacle.create, 5);
    this._entityPool.register(POOL_ID.collectible, Collectible.create, 5);
  }

  /**
   * Acquire an entity from the appropriate pool.
   *
   * The entity is not part of the world until add() is called.
   */
  public create<T extends Poolable>(id: POOL_ID): T {
    return this._entityPool.create<T>(id);
  }

  /**
   * Add an entity to the world.
   *
   * active = true means the entity participates in
   * active-entity operations such as despawning.
   */
  public add<T extends WorldEntity>(entity: T, active = false): T {
    if (entity.destroyed) {
      throw new Error("Cannot add a destroyed entity");
    }

    if (this._entities.has(entity)) {
      return entity;
    }

    this._entities.add(entity);

    if (active) {
      this._activeEntities.add(entity);
    }

    this._gameWorld.addChild(entity);

    if (entity.collider) {
      this._collisionManager.add(entity.collider);
    }

    entity.onAdded();

    return entity;
  }

  /**
   * Remove an entity from the world and return it
   * to its pool.
   * This does NOT destroy the entity.
   */
  public remove(entity: WorldEntity): void {
    if (!this._entities.has(entity)) {
      return;
    }

    this._entities.delete(entity);
    this._activeEntities.delete(entity);

    if (entity.collider) {
      this._collisionManager.remove(entity.collider);
    }

    if (entity.parent === this._gameWorld) {
      this._gameWorld.removeChild(entity);
    }

    entity.onRemoved();
    if (entity.poolId) {
      this._entityPool.release(entity.poolId, entity);
    }
  }

  /**
   * Permanently destroy an entity.
   * A destroyed entity must NEVER be returned to a pool.
   */
  public destroy(entity: WorldEntity): void {
    if (!this._entities.has(entity)) {
      return;
    }

    this._entities.delete(entity);
    this._activeEntities.delete(entity);

    if (entity.collider) {
      this._collisionManager.remove(entity.collider);
    }

    if (entity.parent === this._gameWorld) {
      this._gameWorld.removeChild(entity);
    }

    entity.destroyEntity();
  }

  /**
   * Update all entities currently owned by the manager.
   */
  public update(deltaTime: number, speed: number): void {
    for (const entity of this._entities) {
      if (entity.destroyed || !entity.shouldUpdate) {
        continue;
      }

      entity.update(deltaTime, speed);
    }

    this._checkObstacles();
  }

  /**
   * Automatically recycle active entities once they
   * have travelled beyond the playable area.
   */
  private _checkObstacles(): void {
    for (const entity of this.getActiveEntities()) {
      if (entity.position.z > 5) {
        this.remove(entity);
      }
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

  public getActiveEntities(): readonly WorldEntity[] {
    return [...this._activeEntities];
  }

  /**
   * Permanently destroy every entity owned by the manager
   * and clear all pools.
   * Use this when the entire world is being destroyed.
   */
  public clear(): void {
    for (const entity of this.getEntities()) {
      this.destroy(entity);
    }

    this._collisionManager.clear();

    this._entities.clear();
    this._activeEntities.clear();

    this._entityPool.clear();
  }

  /**
   * Reset the current game run.
   * Runtime entities are recycled rather than destroyed so
   * they can be reused on the next game.
   */
  public reset(): void {
    for (const entity of this.getActiveEntities()) {
      this.remove(entity);
    }
  }

  public has(entity: WorldEntity): boolean {
    return this._entities.has(entity);
  }

  public isActive(entity: WorldEntity): boolean {
    return this._activeEntities.has(entity);
  }

  public get size(): number {
    return this._entities.size;
  }

  public get activeSize(): number {
    return this._activeEntities.size;
  }

  public pause(): void {
    if (this._paused) {
      return;
    }

    this._paused = true;

    for (const entity of this._entities) {
      entity.animationController?.pause();
    }
  }

  public resume(): void {
    if (!this._paused) {
      return;
    }

    this._paused = false;

    for (const entity of this._entities) {
      entity.animationController?.resume();
    }
  }
}
