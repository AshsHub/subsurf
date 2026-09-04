import { Material, Mesh3D } from "pixi3d/pixi7";
import { ColliderDebugMaterial } from "../../rendering/materials/collisionDebug/ColliderDebugMaterial";
import type { CollisionManager } from "../CollisionManager";
import type { Collider, CollisionLayer } from "../world/component/Collider";
import type { GameWorld } from "../world/GameWorld";
import { Mesh3DCustom } from "../world/mesh/Mesh3DCustom";

export class CollisionDebugRenderer {
  private readonly _collisionManager: CollisionManager;
  private readonly _boxes = new Map<Collider, Mesh3D>();
  private readonly _materials = new Map<string, Material>();

  private _enabled = true;
  private readonly _gameWorld: GameWorld;

  constructor(world: GameWorld, collisionManager: CollisionManager) {
    this._gameWorld = world;
    this._collisionManager = collisionManager;
    this._registerMaterial();
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
      case "player":
        return 0x00ff00;
      case "obstacle":
        return 0xff0000;
      default:
        return 0xffffff;
    }
  }

  private _registerMaterial(): void {
    const playerColiderMaterial = new ColliderDebugMaterial();
    playerColiderMaterial.color = this._getColor("player");

    const obstacleColiderMaterial = new ColliderDebugMaterial();
    obstacleColiderMaterial.color = this._getColor("obstacle");

    this._materials.set("player", playerColiderMaterial);
    this._materials.set("obstacle", obstacleColiderMaterial);
  }

  public destroy(): void {
    for (const mesh of this._boxes.values()) {
      mesh.destroy();
    }

    this._boxes.clear();
  }
}
