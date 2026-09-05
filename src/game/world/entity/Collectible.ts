import { Color, Container3D, Mesh3D, StandardMaterial } from "pixi3d/pixi7";

import { POOL_ID } from "../../EntityPool";
import { CollisionLayer } from "../component/Collider";
import { LANE_POSITIONS, type Lane } from "../configs/LaneConfig";
import { Mesh3DCustom } from "../mesh/Mesh3DCustom";
import { DynamicEntity } from "./base/DynamicEntity";

export class Collectible extends DynamicEntity {
  readonly poolId = POOL_ID.collectible;

  private readonly _orbit = new Container3D();

  private readonly _redOrb: Mesh3D;
  private readonly _greenOrb: Mesh3D;
  private readonly _blueOrb: Mesh3D;

  private _orbitAngle = 0;
  private _collecting = false;

  private readonly _orbitRadius = 0.28;
  private readonly _orbitHeight = 0.12;
  private readonly _orbitSpeed = 2.5;

  static create(): Collectible {
    return new Collectible();
  }

  constructor() {
    super();

    this._redOrb = this._createOrb(
      Color.fromBytes(255, 40, 40),
      Color.fromBytes(255, 15, 15),
    );

    this._greenOrb = this._createOrb(
      Color.fromBytes(40, 255, 100),
      Color.fromBytes(10, 220, 60),
    );

    this._blueOrb = this._createOrb(
      Color.fromBytes(40, 120, 255),
      Color.fromBytes(10, 70, 255),
    );

    const width = 0.35;
    const height = 0.35;
    const depth = 0.35;

    const orbScale = Math.min(width, height, depth) * 0.55;

    this._redOrb.scale.set(orbScale);
    this._greenOrb.scale.set(orbScale);
    this._blueOrb.scale.set(orbScale);

    this._orbit.addChild(this._redOrb, this._greenOrb, this._blueOrb);

    // Visual offset only. The entity itself remains at y = 0.
    this.visual.position.y = 0.8;
    this.visual.addChild(this._orbit);

    this.setCollider({
      width: width * 1.1,
      height: height * 1.1,
      depth: depth * 1.1,
      layer: CollisionLayer.Collectible,
      offsetY: height * 1.75,
    });

    this.setAnimationController();
  }

  private _createOrb(baseColor: Color, emissive: Color): Mesh3D {
    const material = new StandardMaterial();

    material.baseColor = baseColor;
    material.emissive = emissive;
    material.metallic = 0.1;
    material.roughness = 0.15;

    return Mesh3DCustom.createSphere({
      radius: 0.5,
      widthSegments: 12,
      heightSegments: 8,
      material,
    });
  }

  public spawn(lane: Lane, z: number): void {
    this.position.set(LANE_POSITIONS[lane], 0, z);

    this._startAnimation();
  }

  private _startAnimation(): void {
    const controller = this.animationController!;

    controller.kill();

    this._collecting = false;
    this._orbitAngle = 0;
    this._orbit.scale.set(1, 1, 1);
    this._orbit.position.set(0, 0, 0);

    controller.to(this._orbit.position, {
      y: 0.12,
      duration: 0.7,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  public collect(onComplete?: () => void): void {
    if (this._collecting || !this.active) {
      return;
    }

    this._collecting = true;

    const controller = this.animationController!;

    controller.kill();

    this._orbit.position.y = 0;
    this._orbit.scale.set(1, 1, 1);

    controller.to(this._orbit.scale, {
      x: 2,
      y: 2,
      z: 2,
      duration: 0.2,
      ease: "back.out(2)",
    });

    controller.to(this._orbit.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.22,
      ease: "back.in(2)",
      onComplete: () => {
        this._collecting = false;
        this.active = false;

        onComplete?.();
      },
    });

    controller.to(this._orbit.position, {
      y: -0.3,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  public override onPoolAcquire(): void {
    super.onPoolAcquire();

    this._reset();
  }

  public override onPoolRelease(): void {
    super.onPoolRelease();

    this.animationController?.kill();

    this._reset();
  }

  override update(deltaTime: number, speed: number): void {
    if (!this.active || this._collecting) {
      return;
    }

    this.position.z += speed * deltaTime;

    this._orbitAngle += this._orbitSpeed * deltaTime;

    const angle = this._orbitAngle;

    // Red orb.
    this._redOrb.position.set(
      Math.cos(angle) * this._orbitRadius,
      Math.sin(angle * 2) * this._orbitHeight,
      Math.sin(angle) * this._orbitRadius,
    );

    // Green orb — 120 degrees behind red.
    const greenAngle = angle + (Math.PI * 2) / 3;

    this._greenOrb.position.set(
      Math.cos(greenAngle) * this._orbitRadius,
      Math.sin(greenAngle * 2) * this._orbitHeight,
      Math.sin(greenAngle) * this._orbitRadius,
    );

    // Blue orb — 240 degrees behind red.
    const blueAngle = angle + (Math.PI * 4) / 3;

    this._blueOrb.position.set(
      Math.cos(blueAngle) * this._orbitRadius,
      Math.sin(blueAngle * 2) * this._orbitHeight,
      Math.sin(blueAngle) * this._orbitRadius,
    );
  }

  private _reset(): void {
    this.position.set(0, 0, 0);

    this._orbitAngle = 0;
    this._collecting = false;

    this._orbit.position.set(0, 0, 0);
    this._orbit.scale.set(1, 1, 1);

    this._redOrb.position.set(0, 0, 0);
    this._greenOrb.position.set(0, 0, 0);
    this._blueOrb.position.set(0, 0, 0);

    this.visual.position.set(0, 0.8, 0);
  }
}
