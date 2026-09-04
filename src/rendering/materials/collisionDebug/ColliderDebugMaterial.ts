import { Program } from "pixi.js";
import { Camera, Material, MeshShader } from "pixi3d/pixi7";

import colliderVert from "./colliderVert.glsl?raw";
import colliderFrag from "./colliderFrag.glsl?raw";

export class ColliderDebugMaterial extends Material {
  private _color = 0xff0000;
  private _alpha = 0.2;

  public set color(value: number) {
    this._color = value;
  }

  public get color(): number {
    return this._color;
  }

  public set alpha(value: number) {
    this._alpha = value;
  }

  public get alpha(): number {
    return this._alpha;
  }

  override createShader() {
    return new MeshShader(Program.from(colliderVert, colliderFrag));
  }

  override updateUniforms(mesh: any, shader: any) {
    const r = ((this._color >> 16) & 0xff) / 255;
    const g = ((this._color >> 8) & 0xff) / 255;
    const b = (this._color & 0xff) / 255;

    shader.uniforms.u_Color = [r, g, b];
    shader.uniforms.u_Alpha = this._alpha;

    shader.uniforms.u_Model = mesh.worldTransform.array;
    shader.uniforms.u_ViewProjection = Camera.main.viewProjection.array;
  }
}
