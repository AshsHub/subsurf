import type { Mesh3D } from "pixi3d";
import { POOL_ID } from "../../EntityPool";
import { COLLECTIBLE_CONFIG } from "../configs/GameConfig";
import { LANE_POSITIONS, type Lane } from "../configs/LaneConfig";
import { Mesh3DCustom } from "../mesh/Mesh3DCustom";
import { DynamicEntity } from "./base/DynamicEntity";
import { CollisionLayer } from "../component/Collider";

export class Collectible extends DynamicEntity {
  readonly poolId = POOL_ID.collectible;
  readonly body: Mesh3D;

  private _spin = 0;

  static create(): Collectible {
    return new Collectible();
  }

  constructor() {
    super();

    const { width, height, depth } = COLLECTIBLE_CONFIG.body;

    // Use a cylinder for the coin
    this.body = Mesh3DCustom.createCube();
    this.body.scale.set(width, height, depth);
    this.body.position.y = height * 2;

    this.visual.addChild(this.body);

    this.setCollider({
      width: width * 1.1,
      height: height * 1.1,
      depth: depth * 1.1,
      layer: CollisionLayer.Collectible,
      offsetY: height * 2,
    });

    this.setAnimationController();
  }

  public spawn(lane: Lane, z: number): void {
    this.position.set(LANE_POSITIONS[lane], 0, z);
  }

  public override onAdded(): void {
    this.animationController?.to(this.visual.position, {
      y: 0.2,
      duration: 0.6,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  public override onPoolAcquire(): void {
    super.onPoolAcquire();
    this._reset();
  }

  public override onPoolRelease(): void {
    super.onPoolRelease();
    this._reset();
  }

  public override update(deltaTime: number, speed: number): void {
    this.position.z += speed * deltaTime;
    this._spin += speed * deltaTime * COLLECTIBLE_CONFIG.spinSpeed;
    this.body.rotationQuaternion.setEulerAngles(0, this._spin, 0);
  }

  private _reset() {
    this.position.set(0, 0, 0);
    this.rotation = 0;
    this._spin = 0;
  }
}
