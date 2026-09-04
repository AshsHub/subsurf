import type { Collider } from "./world/component/Collider";

export class CollisionManager {
  private readonly _colliders = new Set<Collider>();

  public add(collider: Collider): void {
    this._colliders.add(collider);
  }

  public remove(collider: Collider): void {
    this._colliders.delete(collider);
  }

  public update(): void {
    const colliders = [...this._colliders];

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

        if (this._intersects(a, b)) {
          this._handleCollision(a, b);
        }
      }
    }
  }

  private _canCollide(a: Collider, b: Collider): boolean {
    return (
      (a.layer === "player" && b.layer === "obstacle") ||
      (a.layer === "obstacle" && b.layer === "player")
    );
  }

  private _intersects(a: Collider, b: Collider): boolean {
    const x = a.minX < b.maxX && a.maxX > b.minX;
    const y = a.minY < b.maxY && a.maxY > b.minY;
    const z = a.minZ < b.maxZ && a.maxZ > b.minZ;

    return x && y && z;
  }

  private _handleCollision(a: Collider, b: Collider): void {
    console.log("Collision:", a.layer, b.layer);
  }

  public clear(): void {
    this._colliders.clear();
  }

  public getColliders(): readonly Collider[] {
    return [...this._colliders];
  }
}
