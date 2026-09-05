import {
  Color,
  Container3D,
  Light,
  LightingEnvironment,
  LightType,
  Mesh3D,
  StandardMaterial,
  StandardMaterialTexture,
  TextureTransform,
} from "pixi3d/pixi7";

import { CollisionLayer } from "../component/Collider";
import {
  LANE_POSITIONS,
  STARTING_LANE,
  type Lane,
} from "../configs/LaneConfig";
import { Mesh3DCustom } from "../mesh/Mesh3DCustom";
import { DynamicEntity } from "./base/DynamicEntity";
import { Assets, WRAP_MODES } from "pixi.js";

const DEFAULT_ENGINE_COLOR = [255, 40, 40];
const ENGINE_LIGHT_INTENSITY = 0.35;

export class Player extends DynamicEntity {
  private readonly ufo: Container3D;
  private _body!: Mesh3D;
  private _cockpit!: Mesh3D;
  private _engine!: Mesh3D;
  private _engineLight!: Light;

  private _engineMaterial!: StandardMaterial;
  private _engineMaterialTexture!: StandardMaterialTexture;
  private _engineTextureTransform!: TextureTransform;
  private readonly _engineColor = Color.from(DEFAULT_ENGINE_COLOR);
  private readonly _engineEmissiveColor = Color.from(DEFAULT_ENGINE_COLOR);
  private readonly _engineLightColor = Color.from(DEFAULT_ENGINE_COLOR);

  private _engineScroll = 0;

  private lane: Lane = STARTING_LANE;

  private readonly groundY = 0;

  private airborne = false;
  private jumpTime = 0;
  private _engineLightTime = 0;

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

    this.ufo = new Container3D();

    this.visual.addChild(this.ufo);

    this._craftUFO();

    this.setCollider({
      width: 1,
      height: 1,
      depth: 1,
      layer: CollisionLayer.Player,
      offsetY: 0.5,
    });
  }

  private _craftUFO(): void {
    //! Body
    const bodyTexture = Assets.get("player-body-texture");

    if (!bodyTexture) {
      throw new Error(
        'Player: "player-body-texture" has not been loaded before creating the Player.',
      );
    }

    bodyTexture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

    const bodyMaterialTexture = new StandardMaterialTexture(
      bodyTexture.baseTexture,
    );

    const bodyMaterial = new StandardMaterial();

    bodyMaterial.baseColor = Color.fromBytes(100, 110, 120);
    bodyMaterial.baseColorTexture = bodyMaterialTexture;
    bodyMaterial.metallic = 0.35;
    bodyMaterial.roughness = 0.4;
    bodyMaterial.emissive = Color.fromBytes(8, 12, 16);

    this._body = Mesh3DCustom.createSphere({
      radius: 0.5,
      widthSegments: 24,
      heightSegments: 12,
      material: bodyMaterial,
    });

    this._body.scale.set(1, 0.25, 1);
    this._body.position.set(0, 0.5, 0);

    //! Cockpit

    const cockpitTexture = Assets.get("player-cockpit-texture");

    if (!cockpitTexture) {
      throw new Error(
        'Player: "player-cockpit-texture" has not been loaded before creating the Player.',
      );
    }

    cockpitTexture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

    const cockpitMaterialTexture = new StandardMaterialTexture(
      cockpitTexture.baseTexture,
    );

    const cockpitMaterial = new StandardMaterial();

    cockpitMaterial.baseColor = Color.fromBytes(20, 55, 70);
    cockpitMaterial.baseColorTexture = cockpitMaterialTexture;
    cockpitMaterial.metallic = 0.65;
    cockpitMaterial.roughness = 0.15;
    cockpitMaterial.emissive = Color.fromBytes(0, 15, 25);

    cockpitMaterial.emissive = Color.fromBytes(0, 8, 12);

    this._cockpit = Mesh3DCustom.createSphere({
      radius: 0.5,
      widthSegments: 24,
      heightSegments: 12,
      material: cockpitMaterial,
    });

    this._cockpit.scale.set(0.5, 0.35, 0.5);
    this._cockpit.position.set(0, 0.7, 0);

    //! Engine

    this._engineMaterial = new StandardMaterial();

    this._engineMaterial.baseColor = this._engineColor;
    this._engineMaterial.emissive = this._engineEmissiveColor;

    this._engineMaterial.metallic = 0.1;
    this._engineMaterial.roughness = 0.18;

    const engineTexture = Assets.get("player-engine-texture");

    if (!engineTexture) {
      throw new Error(
        'Player: "player-engine-texture" has not been loaded before creating the Player.',
      );
    }

    engineTexture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

    this._engineMaterialTexture = new StandardMaterialTexture(
      engineTexture.baseTexture,
    );

    this._engineTextureTransform = new TextureTransform();

    this._engineMaterialTexture.transform = this._engineTextureTransform;

    this._engineMaterial.baseColorTexture = this._engineMaterialTexture;

    this._engine = Mesh3DCustom.createCylinder({
      radius: 0.5,
      height: 1,
      segments: 24,
      material: this._engineMaterial,
    });

    this._engine.scale.set(0.25, 0.5, 0.25);
    this._engine.position.set(0, 0.25, 0);

    this._engineLight = new Light();

    this._engineLight.type = LightType.point;
    this._engineLight.intensity = ENGINE_LIGHT_INTENSITY;
    this._engineLight.color = this._engineLightColor;
    this._engineLight.position.set(0, 0.1, 0);

    LightingEnvironment.main.lights.push(this._engineLight);

    this.ufo.addChild(
      this._body,
      this._cockpit,
      this._engine,
      this._engineLight,
    );

    this.ufo.rotationQuaternion.setEulerAngles(-5, 0, 0);
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
    this._updateEngineLight(dt);
    this._updateEngineTexture(dt);
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

    this.position.y =
      this.groundY + Math.sin(progress * Math.PI) * this.jumpHeight;

    if (progress >= 1) {
      this.airborne = false;
      this.jumpTime = 0;
      this.position.y = this.groundY;
    }
  }

  private _updateEngineLight(dt: number): void {
    this._engineLightTime += dt;

    const flicker =
      Math.sin(this._engineLightTime * 12) * 0.08 +
      Math.sin(this._engineLightTime * 27) * 0.03;

    this._engineLight.intensity = ENGINE_LIGHT_INTENSITY * (1 + flicker);
  }

  private _updateEngineTexture(dt: number): void {
    this._engineScroll += dt * 2.5;

    this._engineTextureTransform.offset.y = (this._engineScroll % 1) * -1;
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

    this._engineLightTime = 0;
    this._engineScroll = 0;

    this._engineLight.intensity = ENGINE_LIGHT_INTENSITY;
    this._engineTextureTransform.offset.y = 0;
  }

  override destroyEntity(): void {
    this.reset();
    super.destroyEntity();
  }

  private _easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 2);
  }
}
