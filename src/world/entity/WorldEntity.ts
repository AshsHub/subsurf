import { Container3D } from "pixi3d/pixi7";

export abstract class WorldEntity extends Container3D {
  protected _shouldUpdate = false;
  private _entityDestroyed = false;
  private _active = true;
  readonly visual: Container3D;

  constructor() {
    super();

    this.visual = new Container3D();
    this.addChild(this.visual);
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
  public update(_deltaTime: number): void {}

  /**
   * Called before the entity is removed.
   */
  public onRemoved(): void {}

  public destroyEntity(): void {
    if (this._entityDestroyed) {
      return;
    }

    this._entityDestroyed = true;
    this.onRemoved();
    this.destroy({ children: true });
  }
}
