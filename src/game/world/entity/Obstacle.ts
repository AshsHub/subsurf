import {
  Color,
  StandardMaterial,
  StandardMaterialTexture,
  TextureTransform,
  type Mesh3D,
} from "pixi3d/pixi7";
import { DynamicEntity } from "./base/DynamicEntity";
import { Assets, WRAP_MODES } from "pixi.js";
import { Mesh3DCustom } from "../mesh/Mesh3DCustom";
import { LANE_POSITIONS, type Lane } from "../configs/LaneConfig";
import { CollisionLayer } from "../component/Collider";

export abstract class Obstacle extends DynamicEntity {
  private readonly _obstacleHeight: number;

  private readonly _leftSupport: Mesh3D;
  private readonly _rightSupport: Mesh3D;
  private readonly _laser: Mesh3D;

  private readonly _laserTexture: StandardMaterialTexture;
  private readonly _laserTextureTransform: TextureTransform;

  private _laserScroll = 0;

  constructor(obstacleHeight: number) {
    super();

    this._obstacleHeight = obstacleHeight;
    const width = 1.7;
    const depth = 0.2;
    const supportWidth = Math.min(width * 0.12, 0.18);

    const supportMaterial = new StandardMaterial();

    supportMaterial.baseColor = Color.fromBytes(18, 24, 32);
    supportMaterial.metallic = 0.95;
    supportMaterial.roughness = 0.22;

    const laserTexture = Assets.get("player-engine-texture");

    if (!laserTexture) {
      throw new Error(
        'Obstacle: "player-engine-texture" has not been loaded before creating the Obstacle.',
      );
    }

    laserTexture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

    this._laserTexture = new StandardMaterialTexture(laserTexture.baseTexture);

    this._laserTextureTransform = new TextureTransform();
    this._laserTexture.transform = this._laserTextureTransform;

    const laserMaterial = new StandardMaterial();

    laserMaterial.baseColor = Color.fromBytes(255, 45, 80);
    laserMaterial.baseColorTexture = this._laserTexture;
    laserMaterial.emissive = Color.fromBytes(255, 60, 90);
    laserMaterial.metallic = 0;
    laserMaterial.roughness = 0.05;

    this._leftSupport = Mesh3DCustom.createCube({
      material: supportMaterial,
    });

    this._leftSupport.scale.set(
      supportWidth,
      this._obstacleHeight,
      depth * 1.1,
    );

    this._leftSupport.position.set(
      -width / 2 + supportWidth / 2,
      this._obstacleHeight / 2,
      0,
    );

    this._rightSupport = Mesh3DCustom.createCube({
      material: supportMaterial,
    });

    this._rightSupport.scale.set(
      supportWidth,
      this._obstacleHeight,
      depth * 1.1,
    );

    this._rightSupport.position.set(
      width / 2 - supportWidth / 2,
      this._obstacleHeight / 2,
      0,
    );

    this._laser = Mesh3DCustom.createPlane({
      width: width - supportWidth * 2,
      length: this._obstacleHeight,
      uvRepeatX: 1,
      uvRepeatY: 3,
      material: laserMaterial,
    });

    this._laser.position.set(0, this._obstacleHeight / 2, 0);

    this._laser.rotationQuaternion.setEulerAngles(90, 0, 0);

    this.visual.addChild(this._leftSupport, this._rightSupport, this._laser);

    this.setCollider({
      width: width * 0.85,
      height: this._obstacleHeight,
      depth: depth * 0.9,
      layer: CollisionLayer.Obstacle,
      offsetY: this._obstacleHeight / 2,
      enabled: false,
    });

    this.setAnimationController();
  }

  public spawn(lane: Lane, z: number): void {
    this.position.set(LANE_POSITIONS[lane], 0, z);
    this._startSpawnAnimation();
  }

  private _startSpawnAnimation(): void {
    const controller = this.animationController!;

    controller.kill();

    const startY = -this._obstacleHeight * 0.9;
    const endY = this._obstacleHeight / 2;

    this._leftSupport.position.y = startY;
    this._rightSupport.position.y = startY;

    this._laser.scale.set(0.02, 0.02, 1);

    controller.to(this._leftSupport.position, {
      y: endY,
      duration: 0.45,
      ease: "power4.out",
    });

    controller.to(this._rightSupport.position, {
      y: endY,
      duration: 0.45,
      ease: "power4.out",
    });

    controller.to(this._laser.scale, {
      x: 1,
      duration: 0.16,
      delay: 0.4,
      ease: "power3.out",
    });

    controller.to(this._laser.scale, {
      y: 1.35,
      duration: 0.08,
      ease: "power2.out",
    });

    controller.to(this._laser.scale, {
      y: 1,
      duration: 0.14,
      ease: "elastic.out(1, 0.5)",
    });
  }

  override onPoolAcquire(): void {
    super.onPoolAcquire();

    this._reset();
    this._startSpawnAnimation();
  }

  override onPoolRelease(): void {
    super.onPoolRelease();

    this.animationController?.kill();
    this._reset();
  }

  override update(deltaTime: number, speed: number): void {
    this.position.z += speed * deltaTime;

    this._laserScroll += deltaTime;
    this._laserTextureTransform.rotation = this._laserScroll * 0.6;
    this._laserTextureTransform.offset.y = -((this._laserScroll * 0.25) % 1);
  }

  private _reset(): void {
    this.position.set(0, 0, 0);
    this.rotation = 0;

    const startY = -this._obstacleHeight * 0.9;

    this._leftSupport.position.y = startY;
    this._rightSupport.position.y = startY;
    this._laser.scale.set(0);

    this._laserScroll = 0;
    this._laserTextureTransform.rotation = 0;

    this.visible = true;
  }
}
