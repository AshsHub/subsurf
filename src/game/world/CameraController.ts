import { Camera } from "pixi3d/pixi7";
import type { Player } from "./entity/Player";

export class GameplayCamera {
  private readonly _camera: Camera;
  private readonly _player: Player;

  private readonly _offset = {
    x: 0,
    y: 3,
    z: 4,
  };

  private readonly _rotation = {
    x: 25,
    y: 180,
    z: 0,
  };

  private readonly _xDamping = 8;
  private readonly _yDamping = 3;

  constructor(player: Player) {
    this._camera = Camera.main;
    this._player = player;

    this.reset();
  }

  public update(deltaTime: number): void {
    const xAlpha = 1 - Math.exp(-this._xDamping * deltaTime);
    const yAlpha = 1 - Math.exp(-this._yDamping * deltaTime);

    const targetX = this._player.position.x + this._offset.x;
    const targetY = this._player.position.y + this._offset.y;
    const targetZ = this._player.position.z + this._offset.z;

    this._camera.position.x += (targetX - this._camera.position.x) * xAlpha;
    this._camera.position.y += (targetY - this._camera.position.y) * yAlpha;
    this._camera.position.z += (targetZ - this._camera.position.z) * xAlpha;
  }

  public reset(): void {
    this._camera.position.set(
      this._player.position.x + this._offset.x,
      this._player.position.y + this._offset.y,
      this._player.position.z + this._offset.z,
    );

    this._camera.rotationQuaternion.setEulerAngles(
      this._rotation.x,
      this._rotation.y,
      this._rotation.z,
    );
  }
}
