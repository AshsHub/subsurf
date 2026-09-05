import { Container3D } from "pixi3d/pixi7";
import { Collider, type ColliderOptions } from "../../component/Collider";
import type { Lane } from "../../configs/LaneConfig";
import type { POOL_ID } from "../../../EntityPool";
import { AnimationController } from "../../component/AnimationController";

export abstract class WorldEntity extends Container3D {
  public abstract readonly poolId: POOL_ID | null;
  protected _shouldUpdate = false;
  private _entityDestroyed = false;
  private _active = true;
  readonly visual: Container3D;
  private _collider?: Collider;
  private _animationController?: AnimationController;

  constructor() {
    super();

    this.visual = new Container3D();
    this.addChild(this.visual);
  }

  protected _setActive(value: boolean): void {
    this._active = value;
    this._shouldUpdate = value;
    this.visible = value;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._setActive(value);
  }

  get destroyed(): boolean {
    return this._entityDestroyed;
  }

  get shouldUpdate() {
    return this._shouldUpdate;
  }

  /**
   * Called once when the entity is added to an EntityManager.
   */
  public onAdded(): void {}

  /**
   * Called every frame while the entity is active.
   */
  public update(_deltaTime: number, _speed: number): void {}

  /**
   * Called before the entity is removed.
   */
  public onRemoved(): void {
    this._animationController?.kill();
  }

  public get collider(): Collider | undefined {
    return this._collider;
  }

  public setCollider(options: ColliderOptions): Collider {
    this._collider = new Collider(this, options);

    return this._collider;
  }

  public get animationController(): AnimationController | undefined {
    return this._animationController;
  }

  public setAnimationController(): AnimationController {
    this._animationController = new AnimationController();
    return this._animationController;
  }

  public destroyEntity(): void {
    if (this._entityDestroyed) {
      return;
    }

    this._entityDestroyed = true;
    this.onRemoved();
    this.destroy({ children: true });
  }

  public spawn(_lane: Lane, _z: number): void {}

  public onPoolRelease(): void {
    this._setActive(false);

    if (this._collider) {
      this._collider.enabled = false;
    }
  }

  public onPoolAcquire(): void {
    this._setActive(true);

    if (this._collider) {
      this._collider.enabled = true;
    }
  }
}
