import { Assets, WRAP_MODES } from "pixi.js";
import {
  Mesh3D,
  StandardMaterial,
  StandardMaterialTexture,
  TextureTransform,
} from "pixi3d/pixi7";

import { TRACK_CONFIG } from "../configs/GameConfig";
import { Mesh3DCustom } from "../mesh/Mesh3DCustom";
import { StaticEntity } from "./base/StaticEntity";

export class Track extends StaticEntity {
  static readonly poolId = "track";

  protected _shouldUpdate = true;

  readonly body: Mesh3D;

  private readonly _material: StandardMaterial;
  private readonly _texture: StandardMaterialTexture;

  private _scrollOffset = 0;
  private readonly _direction = -1;

  static create(): Track {
    return new Track();
  }

  constructor() {
    super();

    const texture = Assets.get("road-texture");
    texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

    this._texture = new StandardMaterialTexture(texture.baseTexture);
    this._texture.transform = new TextureTransform();

    this._material = new StandardMaterial();
    this._material.baseColorTexture = this._texture;

    this.body = Mesh3DCustom.createPlane({
      width: TRACK_CONFIG.width,
      length: TRACK_CONFIG.length,
      uvRepeatX: TRACK_CONFIG.uvRepeatX,
      uvRepeatY: TRACK_CONFIG.uvRepeatY,
      material: this._material,
    });

    this.visual.position.z = -45;
    this.visual.addChild(this.body);
  }

  public update(deltaTime: number, speed: number): void {
    const uvSpeed = speed * (TRACK_CONFIG.uvRepeatY / TRACK_CONFIG.length);

    this._scrollOffset += uvSpeed * deltaTime * this._direction;
    this._texture.transform!.offset.y = this._scrollOffset;
  }

  public reset(): void {
    this._scrollOffset = 0;
    this._texture.transform!.offset.y = 0;
  }
}
