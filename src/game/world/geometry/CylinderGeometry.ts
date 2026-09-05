import { MeshGeometry3D } from "pixi3d/pixi7";

export interface CylinderGeometryOptions {
  radius?: number;
  height?: number;
  segments?: number;
}

export class CylinderGeometry extends MeshGeometry3D {
  constructor(options: CylinderGeometryOptions = {}) {
    super();

    const { radius = 1, height = 1, segments = 16 } = options;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const halfHeight = height / 2;

    // Side vertices
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const angle = u * Math.PI * 2;

      const x = Math.cos(angle);
      const z = Math.sin(angle);

      positions.push(radius * x, -halfHeight, radius * z);
      positions.push(radius * x, halfHeight, radius * z);

      // Outward-facing radial normals
      normals.push(x, 0, z);
      normals.push(x, 0, z);

      uvs.push(u, 1);
      uvs.push(u, 0);
    }

    // Side indices
    //
    // Reverse winding so the geometric face normals
    // point in the same direction as the supplied normals.
    for (let i = 0; i < segments; i++) {
      const bottomLeft = i * 2;
      const topLeft = bottomLeft + 1;
      const bottomRight = bottomLeft + 2;
      const topRight = bottomRight + 1;

      indices.push(
        bottomLeft,
        topLeft,
        bottomRight,

        topLeft,
        topRight,
        bottomRight,
      );
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
