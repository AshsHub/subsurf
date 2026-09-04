import { Assets, WRAP_MODES } from "pixi.js";
import { Mesh3D } from "pixi3d/pixi7";

import { StaticEntity } from "./entity/StaticEntity";
import { TrackMaterial } from "../rendering/materials/track/TrackMaterial";
import { PlaneGeometry } from "./geometry/PlaneGeometry";

export class Track extends StaticEntity {
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
      width: 8,
      length: 100,
      uvRepeatX: 1,
      uvRepeatY: 4,
    });

    this.body = new Mesh3D(geometry, this._material);

    this.visual.addChild(this.body);
  }

  update(deltaTime: number): void {
    this._material.scroll(deltaTime);
  }
}
