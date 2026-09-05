import { Material, Mesh3D, StandardMaterial } from "pixi3d/pixi7";

import { CubeGeometry } from "../geometry/CubeGeometry";
import {
  PlaneGeometry,
  type PlaneGeometryOptions,
} from "../geometry/PlaneGeometry";
import {
  SphereGeometry,
  type SphereGeometryOptions,
} from "../geometry/SphereGeometry";
import {
  CylinderGeometry,
  type CylinderGeometryOptions,
} from "../geometry/CylinderGeometry";

interface CubeOptions {
  width?: number;
  height?: number;
  depth?: number;
  material?: Material;
}

export class Mesh3DCustom {
  static createCube(options?: CubeOptions) {
    return new Mesh3D(
      new CubeGeometry({
        width: options?.width ?? 1,
        height: options?.height ?? 1,
        depth: options?.depth ?? 1,
      }),
      options?.material ?? new StandardMaterial(),
    );
  }

  static createPlane(options?: PlaneGeometryOptions & { material?: Material }) {
    return new Mesh3D(
      new PlaneGeometry({
        length: options?.length ?? 10,
        width: options?.width ?? 10,
        uvRepeatX: options?.uvRepeatX,
        uvRepeatY: options?.uvRepeatY,
      }),
      options?.material ?? new StandardMaterial(),
    );
  }

  static createSphere(
    options?: SphereGeometryOptions & { material?: Material },
  ) {
    return new Mesh3D(
      new SphereGeometry({
        radius: options?.radius ?? 1,
        widthSegments: options?.widthSegments,
        heightSegments: options?.heightSegments,
      }),
      options?.material ?? new StandardMaterial(),
    );
  }

  static createCylinder(
    options?: CylinderGeometryOptions & { material?: Material },
  ) {
    return new Mesh3D(
      new CylinderGeometry({
        radius: options?.radius ?? 1,
        height: options?.height ?? 1,
        segments: options?.segments,
      }),
      options?.material ?? new StandardMaterial(),
    );
  }
}
