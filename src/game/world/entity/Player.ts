import { Assets, WRAP_MODES } from "pixi.js";
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

const DEFAULT_ENGINE_COLOR = [40, 40, 225];
const ENGINE_LIGHT_INTENSITY = 0.25;

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
  private _engineLightTime = 0;

  private readonly _engineBaseScale = {
    x: 0.25,
    y: 0.5,
    z: 0.25,
  };

  private readonly _ufoRotation = {
    x: -5,
    y: 0,
    z: 0,
  };
  private _bodySpin = { y: 0 };

  private lane: Lane = STARTING_LANE;
  private readonly groundY = 0;
  private airborne = false;

  private readonly jumpHeight = 1.5;
  private readonly jumpDuration = 0.65;

  private readonly laneMoveDuration = 0.2;
  private laneMoving = false;

  static create(): Player {
    return new Player();
  }

  constructor() {
    super();

    this.setAnimationController();

    this.ufo = new Container3D();

    this.visual.addChild(this.ufo);

    this._craftUFO();
    this._startIdleAnimation();

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

    this._engine = Mesh3DCustom.createSphere({
      radius: 0.5,
      material: this._engineMaterial,
    });

    this._engine.scale.set(
      this._engineBaseScale.x,
      this._engineBaseScale.y,
      this._engineBaseScale.z,
    );

    this._engine.position.set(0, 0.4, 0);

    //! Engine light

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

    this._applyUfoRotation();
  }

  moveLeft(): void {
    if (this.lane <= 0 || this.laneMoving) {
      return;
    }

    this.setLane((this.lane - 1) as Lane);
    this._animateLaneChange(-1);
  }

  moveRight(): void {
    if (this.lane >= LANE_POSITIONS.length - 1 || this.laneMoving) {
      return;
    }

    this.setLane((this.lane + 1) as Lane);
    this._animateLaneChange(1);
  }

  jump(): void {
    if (this.airborne) {
      return;
    }

    this.airborne = true;
    this._animateJump();
  }

  get currentLane(): Lane {
    return this.lane;
  }

  get isAirborne(): boolean {
    return this.airborne;
  }

  public update(dt: number): void {
    this._updateEngineLight(dt);
    this._updateEngineTexture(dt);
  }

  private _startIdleAnimation(): void {
    const controller = this.animationController!;

    controller.to(this.ufo.position, {
      y: 0.04,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    controller.to(this._ufoRotation, {
      x: -3.5,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      onUpdate: () => {
        this._applyUfoRotation();
      },
    });

    // Rotating body
    controller.to(this._bodySpin, {
      y: 360,
      duration: 3,
      repeat: -1,
      ease: "none",
      onUpdate: () => {
        this._body.rotationQuaternion.setEulerAngles(
          0,
          this._bodySpin.y % 360,
          0,
        );
      },
    });
  }

  private setLane(lane: Lane): void {
    this.lane = lane;
    this.laneMoving = true;

    this.animationController!.to(this.position, {
      x: LANE_POSITIONS[lane],
      duration: this.laneMoveDuration,
      ease: "power2.out",
      onComplete: () => {
        this.position.x = LANE_POSITIONS[lane];
        this.laneMoving = false;
      },
    });
  }

  private _animateLaneChange(direction: -1 | 1): void {
    const controller = this.animationController!;

    controller.to(this._ufoRotation, {
      z: direction * -12,
      duration: 0.1,
      ease: "power2.out",
      onUpdate: () => {
        this._applyUfoRotation();
      },
    });

    controller.to(this._ufoRotation, {
      z: 0,
      duration: 0.18,
      delay: 0.1,
      ease: "back.out(2)",
      onUpdate: () => {
        this._applyUfoRotation();
      },
    });
  }

  private _animateJump(): void {
    const controller = this.animationController!;

    const jump = {
      progress: 0,
    };

    // UFO movement

    controller.to(jump, {
      progress: 1,
      duration: this.jumpDuration,
      ease: "none",

      onUpdate: () => {
        this.position.y =
          this.groundY + Math.sin(jump.progress * Math.PI) * this.jumpHeight;
      },

      onComplete: () => {
        this.position.y = this.groundY;
        this.airborne = false;
      },
    });

    // Engine thrust burst

    controller.to(this._engine.scale, {
      x: 0.4,
      z: 0.4,
      y: 0.65,
      duration: 0.1,
      ease: "power2.out",
    });

    // Pull the engine back slightly while the UFO is airborne.
    controller.to(this._engine.scale, {
      x: 0.3,
      z: 0.3,
      y: 0.56,
      duration: 0.25,
      delay: 0.1,
      ease: "power2.out",
    });

    // Return to the normal engine size near the end of the jump.
    controller.to(this._engine.scale, {
      x: this._engineBaseScale.x,
      z: this._engineBaseScale.z,
      y: this._engineBaseScale.y,
      duration: 0.25,
      delay: 0.35,
      ease: "power2.inOut",
    });

    // Small body tilt during takeoff

    controller.to(this._ufoRotation, {
      x: -10,
      duration: 0.12,
      ease: "power2.out",
      onUpdate: () => {
        this._applyUfoRotation();
      },
    });

    controller.to(this._ufoRotation, {
      x: -5,
      duration: 0.3,
      delay: 0.12,
      ease: "power2.inOut",
      onUpdate: () => {
        this._applyUfoRotation();
      },
    });
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

    this._engineTextureTransform.offset.y = this._engineScroll % 1;
  }

  private _applyUfoRotation(): void {
    this.ufo.rotationQuaternion.setEulerAngles(
      this._ufoRotation.x,
      this._ufoRotation.y,
      this._ufoRotation.z,
    );
  }

  public reset(): void {
    this.animationController?.kill();
    this.lane = STARTING_LANE;

    this.position.x = LANE_POSITIONS[STARTING_LANE];
    this.position.y = this.groundY;
    this.ufo.position.set(0, 0, 0);

    this.airborne = false;
    this.laneMoving = false;

    this._engineLightTime = 0;
    this._engineScroll = 0;

    this._engineLight.intensity = ENGINE_LIGHT_INTENSITY;
    this._engineTextureTransform.offset.y = 0;

    this._engine.scale.set(
      this._engineBaseScale.x,
      this._engineBaseScale.y,
      this._engineBaseScale.z,
    );

    this._ufoRotation.x = -5;
    this._ufoRotation.y = 0;
    this._ufoRotation.z = 0;

    this._bodySpin.y = 0;

    this._applyUfoRotation();
    this._startIdleAnimation();
  }

  override destroyEntity(): void {
    this.reset();
    super.destroyEntity();
  }
}
