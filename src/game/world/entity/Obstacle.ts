import { Mesh3D } from "pixi3d/pixi7";
import { DynamicEntity } from "./base/DynamicEntity";
import { LANE_POSITIONS, type Lane } from "../configs/LaneConfig";

export class Obstacle extends DynamicEntity {
  static readonly poolId = "obstacle";
  readonly body: Mesh3D;

  static create(): Obstacle {
    return new Obstacle();
  }

  constructor() {
    super();

    this.body = Mesh3D.createCube();
    this.body.scale.set(1, 0.75, 0.5);
    this.visual.addChild(this.body);

    this.setCollider({
      width: 1.2,
      height: 1,
      depth: 1.2,
      layer: "obstacle",
    });
  }

  spawn(lane: Lane, z: number): void {
    this.position.set(LANE_POSITIONS[lane], 0, z);
  }

  override onPoolAcquire(): void {
    super.onPoolAcquire();

    this.position.set(0, 0, 0);
    this.rotation = 0;
  }

  override onPoolRelease(): void {
    super.onPoolRelease();

    this.position.set(0, 0, 0);
    this.rotation = 0;
  }

  override update(deltaTime: number, speed: number): void {
    this.position.z += speed * deltaTime;
  }
}
