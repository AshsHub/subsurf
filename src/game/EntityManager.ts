import { Container3D } from "pixi3d/pixi7";
import type { WorldEntity } from "../world/entity/WorldEntity";

export class EntityManager extends Container3D {
  private readonly entities = new Set<WorldEntity>();

  add<T extends WorldEntity>(entity: T): T {
    if (entity.destroyed) {
      throw new Error("Cannot add a destroyed entity");
    }

    if (this.entities.has(entity)) {
      return entity;
    }

    this.entities.add(entity);
    this.addChild(entity);

    entity.onAdded();

    return entity;
  }

  remove(entity: WorldEntity): void {
    if (!this.entities.has(entity)) {
      return;
    }

    this.entities.delete(entity);

    if (entity.parent === this) {
      this.removeChild(entity);
    }

    entity.destroyEntity();
  }

  update(deltaTime: number): void {
    for (const entity of this.entities) {
      if (entity.destroyed || !entity.shouldUpdate) {
        continue;
      }

      entity.update(deltaTime);
    }
  }

  clear(): void {
    for (const entity of this.entities) {
      entity.destroyEntity();
    }

    this.entities.clear();
    this.removeChildren();
  }

  has(entity: WorldEntity): boolean {
    return this.entities.has(entity);
  }

  get size(): number {
    return this.entities.size;
  }
}
