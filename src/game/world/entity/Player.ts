import { Mesh3D } from "pixi3d/pixi7";

import { CollisionLayer } from "../component/Collider";
import { PLAYER_CONFIG } from "../configs/GameConfig";
import {
  LANE_POSITIONS,
  STARTING_LANE,
  type Lane,
} from "../configs/LaneConfig";
import { Mesh3DCustom } from "../mesh/Mesh3DCustom";
import { DynamicEntity } from "./base/DynamicEntity";

export class Player extends DynamicEntity {
  readonly body: Mesh3D;

  private lane: Lane = STARTING_LANE;

  private readonly groundY = 0;

  private airborne = false;
  private jumpTime = 0;

  private readonly jumpHeight = 1.5;
  private readonly jumpDuration = 0.65;

  private laneStartX = 0;
  private laneTargetX = 0;
  private laneMoveTime = 0;
  private laneMoveDuration = 0.2;
  private laneMoving = false;

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
      layer: CollisionLayer.Player,
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
    this.jumpTime = 0;
  }

  get currentLane(): Lane {
    return this.lane;
  }

  get isAirborne(): boolean {
    return this.airborne;
  }

  public update(dt: number): void {
    this._updateLaneMovement(dt);
    this._updateJump(dt);
  }

  private _updateLaneMovement(dt: number): void {
    if (!this.laneMoving) {
      return;
    }

    this.laneMoveTime += dt;

    const progress = Math.min(this.laneMoveTime / this.laneMoveDuration, 1);

    const easedProgress = this._easeOut(progress);

    this.position.x =
      this.laneStartX + (this.laneTargetX - this.laneStartX) * easedProgress;

    if (progress >= 1) {
      this.position.x = this.laneTargetX;
      this.laneMoving = false;
    }
  }

  private _updateJump(dt: number): void {
    if (!this.airborne) {
      return;
    }

    this.jumpTime += dt;

    const progress = Math.min(this.jumpTime / this.jumpDuration, 1);

    // Sin gives a clean arc:
    // 0 -> 1 -> 0
    this.position.y =
      this.groundY + Math.sin(progress * Math.PI) * this.jumpHeight;

    if (progress >= 1) {
      this.airborne = false;
      this.jumpTime = 0;
      this.position.y = this.groundY;
    }
  }

  private setLane(lane: Lane): void {
    this.lane = lane;

    this.laneStartX = this.position.x;
    this.laneTargetX = LANE_POSITIONS[lane];
    this.laneMoveTime = 0;
    this.laneMoving = true;
  }

  public reset(): void {
    this.lane = STARTING_LANE;

    this.position.x = LANE_POSITIONS[STARTING_LANE];
    this.position.y = this.groundY;

    this.airborne = false;
    this.jumpTime = 0;

    this.laneStartX = this.position.x;
    this.laneTargetX = this.position.x;
    this.laneMoveTime = 0;
    this.laneMoving = false;
  }

  override destroyEntity(): void {
    this.reset();
    super.destroyEntity();
  }

  private _easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 2);
  }
}
