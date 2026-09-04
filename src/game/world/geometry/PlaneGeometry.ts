import { MeshGeometry3D } from "pixi3d/pixi7";

export interface PlaneGeometryOptions {
  width: number;
  length: number;

  uvRepeatX?: number;
  uvRepeatY?: number;
}

export class PlaneGeometry extends MeshGeometry3D {
  constructor(options: PlaneGeometryOptions) {
    super();

    const { width, length, uvRepeatX = 1, uvRepeatY = 1 } = options;

    const halfWidth = width / 2;
    const halfLength = length / 2;

    this.positions = {
      normalized: false,
      buffer: new Float32Array([
        // Front-left
        -halfWidth,
        0,
        halfLength,

        // Front-right
        halfWidth,
        0,
        halfLength,

        // Back-right
        halfWidth,
        0,
        -halfLength,

        // Back-left
        -halfWidth,
        0,
        -halfLength,
      ]),
    };

    this.normals = {
      normalized: false,
      buffer: new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
    };

    this.uvs = [
      {
        normalized: false,
        buffer: new Float32Array([
          0,
          uvRepeatY,
          uvRepeatX,
          uvRepeatY,
          uvRepeatX,
          0,
          0,
          0,
        ]),
      },
    ];

    this.indices = {
      normalized: false,
      buffer: new Uint16Array([0, 1, 2, 0, 2, 3]),
    };
  }
}
