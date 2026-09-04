import { Renderer } from "pixi.js";
import { Camera, CameraOrbitControl } from "pixi3d/pixi7";

export interface DebugCameraOptions {
  distance?: number;
  angleX?: number;
  angleY?: number;

  target?: {
    x: number;
    y: number;
    z: number;
  };

  enableDamping?: boolean;
  dampingFactor?: number;
}

export class DebugCamera {
  readonly camera: Camera;
  readonly controls: CameraOrbitControl;

  constructor(
    renderer: Renderer,
    canvas: HTMLCanvasElement,
    options: DebugCameraOptions = {},
  ) {
    this.camera = new Camera(renderer);

    this.controls = new CameraOrbitControl(canvas, this.camera);

    this.controls.target = options.target ?? {
      x: 0,
      y: 0,
      z: 0,
    };

    this.controls.distance = options.distance ?? 8;

    this.controls.angles.set(options.angleX ?? 0, options.angleY ?? 15);

    this.controls.enableDamping = options.enableDamping ?? true;

    this.controls.dampingFactor = options.dampingFactor ?? 0.1;

    this.controls.allowControl = true;
  }

  destroy(): void {
    this.controls.destroy();
    this.camera.destroy();
  }
}
