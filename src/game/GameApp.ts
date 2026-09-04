import { Application } from "pixi.js";
import { CameraOrbitControl } from "pixi3d/pixi7";
import { GameStateManager, type GameStateChange } from "./GameState";
import { AssetLoader } from "../loading/AssetLoader";
import { BootFlow } from "../loading/BootFlow";
import { OverlayManager } from "../ui/overlay/OverlayManager";
import { UIRoot } from "../ui/UIRoot";
import { HomeOverlay } from "../ui/overlay/HomeOverlay";
import { GameWorld } from "./world/GameWorld";
import { KeyboardInput, type KeyboardAction } from "../input/KeyboardInput";
import { PauseOverlay } from "../ui/overlay/PauseOverlay";

export class GameApp {
  private _app: Application | undefined;
  private _overlayManager!: OverlayManager;
  private _gameState: GameStateManager = new GameStateManager();
  private _assetLoader: AssetLoader = new AssetLoader();
  private _gameWorld: GameWorld;
  private readonly keyboard = new KeyboardInput();

  constructor() {
    this._gameWorld = new GameWorld(() => {
      this._gameState.end("lost");
    });

    this._gameState.onChange(this._onGameStateChange);
  }

  async init(): Promise<void> {
    const app = new Application({
      resizeTo: window,
      backgroundColor: 0xf9edf2,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    app.ticker.add(() => {
      if (this._gameState.state === "playing") {
        this._gameWorld.update(app.ticker.deltaMS / 1000);
      }
    });

    await this._assetLoader.init();

    const bootFlow = new BootFlow(app, this._assetLoader);
    await bootFlow.run();

    const canvas = app.view as HTMLCanvasElement;
    canvas.style.display = "block";

    const container = document.querySelector<HTMLDivElement>("#app");

    if (!container) {
      throw new Error("Game container not found");
    }

    container.appendChild(canvas);

    this._app = app;

    const uiRoot = new UIRoot();

    this._overlayManager = new OverlayManager(this._app, uiRoot, {
      home: () =>
        new HomeOverlay({
          onStart: () => {
            void this._overlayManager.goTo(null);
            this._gameState.start();
          },
        }),
      pause: () =>
        new PauseOverlay({
          onResume: () => {
            void this._overlayManager.goTo(null);
            this._gameState.resume();
          },
        }),
    });

    await this._overlayManager.goTo("home", {
      immediate: true,
    });

    this.setupScene();

    app.stage.addChild(uiRoot);

    this.keyboard.onAction(this.onKeyboardAction);
  }

  private readonly onKeyboardAction = (action: KeyboardAction): void => {
    if (action === "pause") {
      if (this._gameState.state === "paused") {
        this._gameState.resume();
      } else if (this._gameState.state === "playing") {
        this._gameState.pause();
      }
      return;
    }

    if (this._gameState.state !== "playing") {
      return;
    }

    this._gameWorld.onKeyboardAction(action);
  };

  private setupScene(): void {
    if (!this._app) {
      throw new Error("GameApp has not been initialised");
    }

    this._gameWorld.init();
    this._app.stage.addChild(this._gameWorld);

    const control = new CameraOrbitControl(this._app.view as HTMLCanvasElement);

    control.angles.x = 25;
  }

  private readonly _onGameStateChange = ({
    current,
  }: GameStateChange): void => {
    switch (current) {
      case "playing":
        this._gameWorld.start();
        break;
      case "paused":
        this._gameWorld.pause();
        this._overlayManager.goTo("pause");
        break;
      case "ended":
        this._gameWorld.gameOver();
        break;
      case "idle":
        this._gameWorld.reset();
        break;
    }
  };

  destroy(): void {
    this._app?.destroy(true);
    this._app = undefined;
    this.keyboard.destroy();
  }
}
