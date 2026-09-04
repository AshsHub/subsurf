import { Application, Renderer } from "pixi.js";
import { Camera, CameraOrbitControl, Mesh3D } from "pixi3d/pixi7";
import { GameStateManager } from "./GameState";
import { AssetLoader } from "../loading/AssetLoader";
import { BootFlow } from "../loading/BootFlow";
import { OverlayManager } from "../ui/overlay/OverlayManager";
import { UIRoot } from "../ui/UIRoot";
import { HomeOverlay } from "../ui/overlay/HomeOverlay";
import { GameWorld } from "../world/GameWorld";
import { KeyboardInput, type KeyboardAction } from "../input/KeyboardInput";

export class GameApp {
  private app: Application | undefined;
  private gameStateManager: GameStateManager = new GameStateManager();
  private assetLoader: AssetLoader = new AssetLoader();
  private gameWorld: GameWorld = new GameWorld();
  private readonly keyboard = new KeyboardInput();

  async init(): Promise<void> {
    const app = new Application({
      resizeTo: window,
      backgroundColor: 0xf9edf2,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    app.ticker.add((deltaTime) => {
      if (this.gameStateManager.getState() === "playing") {
        this.gameWorld.update(deltaTime / 60);
      }
    });

    await this.assetLoader.init();

    const bootFlow = new BootFlow(app, this.assetLoader);
    await bootFlow.run();

    const canvas = app.view as HTMLCanvasElement;
    canvas.style.display = "block";

    const container = document.querySelector<HTMLDivElement>("#app");

    if (!container) {
      throw new Error("Game container not found");
    }

    container.appendChild(canvas);

    this.app = app;

    const uiRoot = new UIRoot();

    const overlayManager = new OverlayManager(this.app, uiRoot, {
      home: () =>
        new HomeOverlay({
          onRequestClose: () => {
            void overlayManager.goTo(null);
            this.gameStateManager.start();
          },
        }),
    });

    await overlayManager.goTo("home", {
      immediate: true,
    });

    this.setupScene();

    app.stage.addChild(uiRoot);

    this.keyboard.onAction(this.onKeyboardAction);
  }

  private readonly onKeyboardAction = (action: KeyboardAction): void => {
    if (this.gameStateManager.getState() !== "playing") {
      return;
    }

    this.gameWorld.onKeyboardAction(action);
  };

  private setupScene(): void {
    if (!this.app) {
      throw new Error("GameApp has not been initialised");
    }

    this.gameWorld.init();
    this.app.stage.addChild(this.gameWorld);

    let control = new CameraOrbitControl(this.app.view as HTMLCanvasElement);
    control.angles.x = 25;
  }

  destroy(): void {
    this.app?.destroy(true);
    this.app = undefined;
    this.keyboard.destroy();
  }
}
