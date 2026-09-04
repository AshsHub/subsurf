import { MeshGeometry3D } from "pixi3d/pixi7";

export interface CubeGeometryOptions {
  width: number;
  height: number;
  depth: number;

  uvRepeatX?: number;
  uvRepeatY?: number;
}

export class CubeGeometry extends MeshGeometry3D {
  constructor(options: CubeGeometryOptions) {
    super();

    const { width, height, depth, uvRepeatX = 1, uvRepeatY = 1 } = options;

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    /*
     * Six faces.
     *
     * Each face has its own 4 vertices because each face
     * needs a different normal.
     *
     * The cube is centred at the local origin.
     */

    this.positions = {
      normalized: false,
      buffer: new Float32Array([
        // --------------------------------------------------
        // Front (+Z)
        // --------------------------------------------------

        -halfWidth,
        -halfHeight,
        halfDepth,
        halfWidth,
        -halfHeight,
        halfDepth,
        halfWidth,
        halfHeight,
        halfDepth,
        -halfWidth,
        halfHeight,
        halfDepth,

        // --------------------------------------------------
        // Back (-Z)
        // --------------------------------------------------

        halfWidth,
        -halfHeight,
        -halfDepth,
        -halfWidth,
        -halfHeight,
        -halfDepth,
        -halfWidth,
        halfHeight,
        -halfDepth,
        halfWidth,
        halfHeight,
        -halfDepth,

        // --------------------------------------------------
        // Top (+Y)
        // --------------------------------------------------

        -halfWidth,
        halfHeight,
        -halfDepth,
        -halfWidth,
        halfHeight,
        halfDepth,
        halfWidth,
        halfHeight,
        halfDepth,
        halfWidth,
        halfHeight,
        -halfDepth,

        // --------------------------------------------------
        // Bottom (-Y)
        // --------------------------------------------------

        -halfWidth,
        -halfHeight,
        halfDepth,
        -halfWidth,
        -halfHeight,
        -halfDepth,
        halfWidth,
        -halfHeight,
        -halfDepth,
        halfWidth,
        -halfHeight,
        halfDepth,

        // --------------------------------------------------
        // Right (+X)
        // --------------------------------------------------

        halfWidth,
        -halfHeight,
        halfDepth,
        halfWidth,
        -halfHeight,
        -halfDepth,
        halfWidth,
        halfHeight,
        -halfDepth,
        halfWidth,
        halfHeight,
        halfDepth,

        // --------------------------------------------------
        // Left (-X)
        // --------------------------------------------------

        -halfWidth,
        -halfHeight,
        -halfDepth,
        -halfWidth,
        -halfHeight,
        halfDepth,
        -halfWidth,
        halfHeight,
        halfDepth,
        -halfWidth,
        halfHeight,
        -halfDepth,
      ]),
    };

    this.normals = {
      normalized: false,
      buffer: new Float32Array([
        // Front
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

        // Back
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

        // Top
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

        // Bottom
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

        // Right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

        // Left
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      ]),
    };

    this.uvs = [
      {
        normalized: false,
        buffer: new Float32Array([
          // Front
          0,
          uvRepeatY,
          uvRepeatX,
          uvRepeatY,
          uvRepeatX,
          0,
          0,
          0,

          // Back
          0,
          uvRepeatY,
          uvRepeatX,
          uvRepeatY,
          uvRepeatX,
          0,
          0,
          0,

          // Top
          0,
          uvRepeatY,
          uvRepeatX,
          uvRepeatY,
          uvRepeatX,
          0,
          0,
          0,

          // Bottom
          0,
          uvRepeatY,
          uvRepeatX,
          uvRepeatY,
          uvRepeatX,
          0,
          0,
          0,

          // Right
          0,
          uvRepeatY,
          uvRepeatX,
          uvRepeatY,
          uvRepeatX,
          0,
          0,
          0,

          // Left
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
      buffer: new Uint16Array([
        // Front
        0, 1, 2, 0, 2, 3,

        // Back
        4, 5, 6, 4, 6, 7,

        // Top
        8, 9, 10, 8, 10, 11,

        // Bottom
        12, 13, 14, 12, 14, 15,

        // Right
        16, 17, 18, 16, 18, 19,

        // Left
        20, 21, 22, 20, 22, 23,
      ]),
    };
  }
}
