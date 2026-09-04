import { Program } from "pixi.js";
import { Camera, Material, MeshShader } from "pixi3d/pixi7";

import trackVert from "./trackVert.glsl?raw";
import trackFrag from "./trackFrag.glsl?raw";
import { TRACK_CONFIG } from "../../../game/world/configs/GameConfig";

export class TrackMaterial extends Material {
  private readonly texture: any;

  private _scrollOffset = 0;
  private _direction = -1;

  constructor(texture: any) {
    super();

    this.texture = texture;
  }

  override createShader() {
    return new MeshShader(Program.from(trackVert, trackFrag));
  }

  override updateUniforms(mesh: any, shader: any) {
    shader.uniforms.u_Texture = this.texture;

    shader.uniforms.u_ScrollOffset = this._scrollOffset;

    shader.uniforms.u_Model = mesh.worldTransform.array;

    shader.uniforms.u_ViewProjection = Camera.main.viewProjection.array;
  }

  scroll(dt: number, speed: number): void {
    const uvSpeed = speed * (TRACK_CONFIG.uvRepeatY / TRACK_CONFIG.length);
    this._scrollOffset += uvSpeed * (dt * this._direction);
  }

  resetScroll(): void {
    this._scrollOffset = 0;
  }
}
