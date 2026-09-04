import { Mesh3D } from "pixi3d/pixi7";
import { DynamicEntity } from "./base/DynamicEntity";
import { LANE_POSITIONS, type Lane } from "../configs/LaneConfig";
import { OBSTACLE_CONFIG } from "../configs/GameConfig";
import { Mesh3DCustom } from "../mesh/Mesh3DCustom";

export class Obstacle extends DynamicEntity {
  static readonly poolId = "obstacle";
  readonly body: Mesh3D;

  static create(): Obstacle {
    return new Obstacle();
  }

  constructor() {
    super();

    const { width, height, depth } = OBSTACLE_CONFIG.body;

    this.body = Mesh3DCustom.createCube();

    this.body.scale.set(width, height, depth);
    this.body.position.y = height / 2;

    this.visual.addChild(this.body);

    this.setCollider({
      width: width * 0.8,
      height: height * 0.8,
      depth: depth * 0.8,
      layer: "obstacle",
      offsetY: height / 2,
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
