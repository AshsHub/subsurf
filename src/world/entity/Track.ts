import { Assets, WRAP_MODES } from "pixi.js";
import { Mesh3D } from "pixi3d/pixi7";

import { StaticEntity } from "./base/StaticEntity";
import { TrackMaterial } from "../../rendering/materials/track/TrackMaterial";
import { PlaneGeometry } from "../geometry/PlaneGeometry";
import { TRACK_CONFIG } from "../configs/GameConfig";

export class Track extends StaticEntity {
  static readonly poolId = "track";
  protected _shouldUpdate = true;
  private _material: TrackMaterial;
  readonly body: Mesh3D;
  static create(): Track {
    return new Track();
  }

  constructor() {
    super();

    const texture = Assets.get("road-texture");
    texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
    this._material = new TrackMaterial(texture);

    const geometry = new PlaneGeometry({
      width: TRACK_CONFIG.width,
      length: TRACK_CONFIG.length,
      uvRepeatX: TRACK_CONFIG.uvRepeatX,
      uvRepeatY: TRACK_CONFIG.uvRepeatY,
    });

    this.body = new Mesh3D(geometry, this._material);

    this.visual.addChild(this.body);
  }

  public update(deltaTime: number, speed: number): void {
    this._material.scroll(deltaTime, speed);
  }
}
