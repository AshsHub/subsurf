import { Container3D } from "pixi3d/pixi7";
import {
  CollisionComponent,
  type CollisionComponentOptions,
} from "../../component/CollisionComponent";

export abstract class WorldEntity extends Container3D {
  protected _shouldUpdate = false;
  private _entityDestroyed = false;
  private _active = true;
  readonly visual: Container3D;
  private _collider?: CollisionComponent;

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

  get destroyed(): boolean {
    return this._entityDestroyed;
  }

  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
    this.visible = value;
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
  public onRemoved(): void {}

  public get collider(): CollisionComponent | undefined {
    return this._collider;
  }

  public setCollider(options: CollisionComponentOptions): CollisionComponent {
    this._collider = new CollisionComponent(this, options);

    return this._collider;
  }

  public destroyEntity(): void {
    if (this._entityDestroyed) {
      return;
    }

    this._entityDestroyed = true;
    this.onRemoved();
    this.destroy({ children: true });
  }

  onPoolRelease(): void {
    this._setActive(false);

    if (this._collider) {
      this._collider.enabled = false;
    }
  }

  onPoolAcquire(): void {
    this._setActive(true);

    if (this._collider) {
      this._collider.enabled = true;
    }
  }
}
