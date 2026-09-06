import { Material, Mesh3D } from "pixi3d/pixi7";
import { ColliderDebugMaterial } from "../../rendering/materials/collisionDebug/ColliderDebugMaterial";
import type { CollisionManager } from "../CollisionManager";
import { CollisionLayer, type Collider } from "../world/component/Collider";
import type { GameWorld } from "../world/GameWorld";
import { Mesh3DCustom } from "../world/mesh/Mesh3DCustom";

export class CollisionDebugRenderer {
  private readonly _collisionManager: CollisionManager;
  private readonly _boxes = new Map<Collider, Mesh3D>();
  private readonly _materials = new Map<CollisionLayer, Material>();

  private _enabled = false;
  private readonly _gameWorld: GameWorld;

  constructor(world: GameWorld, collisionManager: CollisionManager) {
    this._gameWorld = world;
    this._collisionManager = collisionManager;
    this._registerMaterials();
  }

  public set enabled(value: boolean) {
    this._enabled = value;
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public update(): void {
    if (!this._enabled) {
      return;
    }

    const colliders = this._collisionManager.getColliders();
    const active = new Set(colliders);

    // Create debug boxes for new colliders.
    for (const collider of colliders) {
      if (!this._boxes.has(collider)) {
        this._addCollider(collider);
      }

      this._updateCollider(collider);
    }

    // Remove boxes for colliders that no longer exist.
    for (const [collider, mesh] of this._boxes) {
      if (!active.has(collider)) {
        mesh.destroy();
        this._boxes.delete(collider);
      }
    }
  }

  private _addCollider(collider: Collider): void {
    const material = this._materials.get(collider.layer);

    const mesh = Mesh3DCustom.createCube({
      material,
    });

    this._gameWorld.addChild(mesh);
    this._boxes.set(collider, mesh);
  }

  private _updateCollider(collider: Collider): void {
    const mesh = this._boxes.get(collider);

    if (!mesh) {
      return;
    }

    mesh.visible = collider.enabled;

    if (!collider.enabled) {
      return;
    }

    mesh.position.set(collider.centerX, collider.centerY, collider.centerZ);

    mesh.scale.set(collider.width, collider.height, collider.depth);
  }

  private _getColor(layer: CollisionLayer): number {
    switch (layer) {
      case CollisionLayer.Player:
        return 0x00ff00;

      case CollisionLayer.Obstacle:
        return 0xff0000;

      default:
        return 0xffffff;
    }
  }

  private _registerMaterials(): void {
    for (const layer of [
      CollisionLayer.Player,
      CollisionLayer.Obstacle,
      CollisionLayer.Collectible,
    ]) {
      const material = new ColliderDebugMaterial();
      material.color = this._getColor(layer);

      this._materials.set(layer, material);
    }
  }

  public destroy(): void {
    for (const mesh of this._boxes.values()) {
      mesh.destroy();
    }

    this._boxes.clear();
  }
}
