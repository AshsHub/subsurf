import { Application, Renderer } from "pixi.js";
import { Camera, Mesh3D } from "pixi3d/pixi7";

export class GameApp {
  private app: Application | undefined;

  async init(): Promise<void> {
    const app = new Application({
      width: 960,
      height: 540,
      backgroundColor: 0xf9edf2,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    const canvas = app.view as HTMLCanvasElement;

    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const container = document.querySelector<HTMLDivElement>("#app");

    if (!container) {
      throw new Error("Game container not found");
    }

    container.appendChild(canvas);

    this.app = app;

    this.setupScene();
  }

  private setupScene(): void {
    if (!this.app) {
      throw new Error("GameApp has not been initialised");
    }

    const camera = new Camera(this.app.renderer as Renderer);

    camera.position.set(0, 0, 5);

    this.app.stage.addChild(camera);

    const cube = Mesh3D.createCube();

    cube.position.set(0, 0, 0);

    this.app.stage.addChild(cube);
  }

  destroy(): void {
    this.app?.destroy(true);
    this.app = undefined;
  }
}
