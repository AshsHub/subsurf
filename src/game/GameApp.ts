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
import { GameUI } from "../ui/GameUI";

export class GameApp {
  private _app: Application | undefined;

  private _gameUI!: GameUI;
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
      if (this._gameState.state !== "playing") {
        return;
      }

      const dt = Math.min(app.ticker.deltaMS / 1000, 0.05);

      this._gameWorld.update(dt);
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
            this._gameState.start();
          },
        }),

      pause: () =>
        new PauseOverlay({
          onResume: () => {
            this._gameState.resume();
          },
        }),
    });

    await this._overlayManager.goTo("home", {
      immediate: true,
    });

    this.setupScene();

    this._gameUI = new GameUI(() => {
      this._gameState.pause();
    });

    this._gameUI.hide();

    app.stage.addChild(uiRoot, this._gameUI);

    this.keyboard.onAction(this.onKeyboardAction);

    this.initListeners();

    this.handleResize();
  }

  private initListeners(): void {
    window.addEventListener("resize", this.handleResize);
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
        this._gameUI.show();
        this._overlayManager.goTo(null);
        break;

      case "paused":
        this._gameWorld.pause();
        void this._overlayManager.goTo("pause");
        this._gameUI.hide();
        break;

      case "ended":
        this._gameWorld.gameOver();
        this._gameUI.hide();
        break;

      case "idle":
        this._gameWorld.reset();
        this._gameUI.hide();
        break;
    }
  };

  private readonly handleResize = (): void => {
    if (!this._app) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    this._gameUI.resize(width, height);
    this._overlayManager.handleResize(width, height);
  };

  public destroy(): void {
    window.removeEventListener("resize", this.handleResize);

    this._app?.destroy(true);
  }
}
