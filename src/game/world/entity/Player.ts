import { Mesh3D } from "pixi3d/pixi7";
import gsap from "gsap";

import { DynamicEntity } from "./base/DynamicEntity";
import {
  LANE_POSITIONS,
  STARTING_LANE,
  type Lane,
} from "../configs/LaneConfig";
import { PLAYER_CONFIG } from "../configs/GameConfig";
import { Mesh3DCustom } from "../mesh/CubeMesh";

export class Player extends DynamicEntity {
  static readonly poolId = "player";
  readonly body: Mesh3D;

  private lane: Lane = STARTING_LANE;

  private readonly groundY = 0;

  private airborne = false;
  private jumpTween: gsap.core.Timeline | undefined;

  static create(): Player {
    return new Player();
  }

  constructor() {
    super();

    const { body } = PLAYER_CONFIG;

    this.body = Mesh3DCustom.createCube();
    this.body.scale.set(body.width, body.height, body.depth);
    this.body.position.set(0, body.height / 2, 0);

    this.visual.addChild(this.body);

    this.setCollider({
      ...body,
      layer: "player",
      offsetY: body.height / 2,
    });
  }

  moveLeft(): void {
    if (this.lane <= 0) {
      return;
    }

    this.setLane((this.lane - 1) as Lane);
  }

  moveRight(): void {
    if (this.lane >= LANE_POSITIONS.length - 1) {
      return;
    }

    this.setLane((this.lane + 1) as Lane);
  }

  jump(): void {
    if (this.airborne) {
      return;
    }

    this.airborne = true;

    this.jumpTween?.kill();

    this.jumpTween = gsap.timeline({
      onComplete: () => {
        this.airborne = false;
        this.position.y = this.groundY;
        this.jumpTween = undefined;
      },
    });

    this.jumpTween
      .to(this.position, {
        y: 1.5,
        duration: 0.3,
        ease: "power2.out",
      })
      .to(this.position, {
        y: this.groundY,
        duration: 0.35,
        ease: "power2.in",
      });
  }

  get currentLane(): Lane {
    return this.lane;
  }

  get isAirborne(): boolean {
    return this.airborne;
  }

  private setLane(lane: Lane): void {
    this.lane = lane;

    gsap.killTweensOf(this.position, "x");

    gsap.to(this.position, {
      x: LANE_POSITIONS[lane],
      duration: 0.2,
      ease: "power2.out",
    });
  }

  override destroyEntity(): void {
    this.jumpTween?.kill();
    this.jumpTween = undefined;

    gsap.killTweensOf(this.position);

    super.destroyEntity();
  }

  public update(dt: number) {}
}
