import { Mesh3D } from "pixi3d/pixi7";
import gsap from "gsap";

import { DynamicEntity } from "./base/DynamicEntity";
import {
  LANE_POSITIONS,
  STARTING_LANE,
  type Lane,
} from "../configs/LaneConfig";

export class Player extends DynamicEntity {
  static readonly poolId = "player";
  readonly body: Mesh3D;
  readonly head: Mesh3D;

  private lane: Lane = STARTING_LANE;

  private readonly groundY = 0;

  private airborne = false;
  private jumpTween: gsap.core.Timeline | undefined;

  static create(): Player {
    return new Player();
  }

  constructor() {
    super();

    this.body = Mesh3D.createCube();
    this.body.scale.set(0.7, 1, 0.5);
    this.body.position.set(0, 0.6, 0);

    this.head = Mesh3D.createCube();
    this.head.scale.set(0.5, 0.5, 0.5);
    this.head.position.set(0, 1.35, 0);

    this.visual.addChild(this.body, this.head);

    this.setCollider({
      width: 0.7,
      height: 1.85,
      depth: 0.5,
      layer: "player",
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
