import { Application } from "pixi.js";
import { CameraOrbitControl } from "pixi3d/pixi7";

import {
  GameResult,
  GameState,
  GameStateManager,
  type GameStateChange,
} from "./GameState";

import { AssetLoader } from "../loading/AssetLoader";
import { BootFlow } from "../loading/BootFlow";
import { GameUI } from "../ui/GameUI";
import { HomeOverlay } from "../ui/overlay/HomeOverlay";
import { OverlayManager } from "../ui/overlay/OverlayManager";
import { PauseOverlay } from "../ui/overlay/PauseOverlay";
import { UIRoot } from "../ui/UIRoot";
import { KeyboardInput, type KeyboardAction } from "../input/KeyboardInput";
import { GameWorld } from "./world/GameWorld";
import { CollisionLayer } from "./world/component/Collider";
import { PICKUP_CONFIG } from "./world/configs/GameConfig";

export class GameApp {
  private _app: Application | undefined;

  private _gameUI!: GameUI;
  private _overlayManager!: OverlayManager;

  private readonly _gameState = new GameStateManager();

  private readonly _assetLoader = new AssetLoader();

  private readonly _keyboard = new KeyboardInput();

  private readonly _gameWorld: GameWorld;

  constructor() {
    this._gameWorld = new GameWorld((_player, collider) => {
      if (collider.layer === CollisionLayer.Collectible) {
        // Collection handling goes here.
      } else if (collider.layer === CollisionLayer.Obstacle) {
        this._gameState.end(GameResult.Lost);
      }
    });

    this._gameState.onChange(this._onGameStateChange);
  }

  public async init(): Promise<void> {
    const app = new Application({
      resizeTo: window,
      backgroundColor: 0xf9edf2,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    app.ticker.add(() => {
      if (this._gameState.state !== GameState.Playing) {
        return;
      }

      const deltaTime = Math.min(app.ticker.deltaMS / 1000, 0.05);

      this._gameWorld.update(deltaTime);
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
          onRequestStart: () => {
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
    }, PICKUP_CONFIG.pointTarget);

    this._gameUI.hide();

    app.stage.addChild(uiRoot, this._gameUI);

    this._keyboard.onAction(this.onKeyboardAction);

    this.initListeners();
    this.handleResize();
  }

  private initListeners(): void {
    window.addEventListener("resize", this.handleResize);
  }

  private readonly onKeyboardAction = (action: KeyboardAction): void => {
    if (action === "pause") {
      if (this._gameState.state === GameState.Paused) {
        this._gameState.resume();
      } else if (this._gameState.state === GameState.Playing) {
        this._gameState.pause();
      }

      return;
    }

    if (this._gameState.state !== GameState.Playing) {
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
    from,
    to,
  }: GameStateChange): void => {
    switch (to) {
      case GameState.Playing:
        if (from === GameState.Paused) {
          this._gameWorld.resume();
        } else {
          this._gameWorld.start();
        }

        this._gameUI.show();
        this._overlayManager.goTo(null);
        break;

      case GameState.Paused:
        this._gameWorld.pause();
        void this._overlayManager.goTo("pause");
        this._gameUI.hide();
        break;

      case GameState.Ended:
        this._gameWorld.end();
        this._gameUI.hide();
        break;

      case GameState.Idle:
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

    this._keyboard.destroy();

    this._app?.destroy(true);
  }
}
