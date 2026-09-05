import { MeshGeometry3D } from "pixi3d/pixi7";

export interface SphereGeometryOptions {
  radius?: number;
  widthSegments?: number;
  heightSegments?: number;
}

export class SphereGeometry extends MeshGeometry3D {
  constructor(options: SphereGeometryOptions = {}) {
    super();

    const { radius = 1, widthSegments = 16, heightSegments = 8 } = options;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;
      const theta = v * Math.PI;

      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const phi = u * Math.PI * 2;

        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const nx = sinTheta * cosPhi;
        const ny = cosTheta;
        const nz = sinTheta * sinPhi;

        positions.push(radius * nx, radius * ny, radius * nz);

        normals.push(nx, ny, nz);

        uvs.push(u, 1 - v);
      }
    }

    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        const topLeft = y * (widthSegments + 1) + x;
        const topRight = topLeft + 1;
        const bottomLeft = (y + 1) * (widthSegments + 1) + x;
        const bottomRight = bottomLeft + 1;

        indices.push(
          // First triangle
          topLeft,
          topRight,
          bottomLeft,

          // Second triangle
          topRight,
          bottomRight,
          bottomLeft,
        );
      }
    }

    this.positions = {
      normalized: false,
      buffer: new Float32Array(positions),
    };

    this.normals = {
      normalized: false,
      buffer: new Float32Array(normals),
    };

    this.uvs = [
      {
        normalized: false,
        buffer: new Float32Array(uvs),
      },
    ];

    this.indices = {
      normalized: false,
      buffer: new Uint16Array(indices),
    };
  }
}
