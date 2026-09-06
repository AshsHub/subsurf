import { Application } from "pixi.js";

import {
  GameResult,
  GameState,
  GameStateManager,
  type GameStateChange,
} from "./GameState";

import { KeyboardAction, KeyboardInput } from "../input/KeyboardInput";
import { AssetLoader } from "../loading/AssetLoader";
import { BootFlow } from "../loading/BootFlow";
import { GameUI } from "../ui/GameUI";
import { HomeOverlay } from "../ui/overlay/HomeOverlay";
import { LoseOverlay } from "../ui/overlay/LoseOverlay";
import {
  OverlayId,
  OverlayManager,
  type OverlayFactory,
} from "../ui/overlay/OverlayManager";
import { PauseOverlay } from "../ui/overlay/PauseOverlay";
import { WinOverlay } from "../ui/overlay/WinOverlay";
import { UIRoot } from "../ui/UIRoot";
import { GameProgress } from "./GameProgress";
import { GameWorld } from "./world/GameWorld";

export class GameApp {
  private _app: Application | undefined;

  private _gameUI!: GameUI;
  private _overlayManager!: OverlayManager;

  private _uiRoot: UIRoot;
  private readonly _gameState = new GameStateManager();
  private readonly _assetLoader = new AssetLoader();
  private readonly _keyboard = new KeyboardInput();
  private readonly _gameProgress = new GameProgress();
  private readonly _gameWorld: GameWorld;

  constructor() {
    this._gameWorld = new GameWorld();

    this._gameWorld.onHitObstacle.subscribe((side) => {
      this._gameState.end(GameResult.Lost);
    });

    this._gameWorld.onScored.subscribe(() => {
      this.addPoint();
    });

    this._gameState.onChange((stateChange) => {
      this._onGameStateChange(stateChange);
    });

    this._uiRoot = new UIRoot();
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
      this._gameProgress.addDistance(this._gameWorld.speed * deltaTime);
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

    const overlayFactories = new Map<OverlayId, OverlayFactory>([
      [
        OverlayId.Home,
        () =>
          new HomeOverlay({
            onRequestStart: () => {
              this._gameState.start();
            },
            onReady: () => {
              this._assetLoader.loadBundle("game").then(() => {
                this.initGame();
              });
            },
          }),
      ],
      [
        OverlayId.Pause,
        () =>
          new PauseOverlay({
            onResume: () => {
              this._gameState.resume();
            },
          }),
      ],
      [
        OverlayId.EndWon,
        () =>
          new WinOverlay({
            onContinue: () => {
              this._gameState.reset();
              this._gameState.start();
            },
          }),
      ],
      [
        OverlayId.EndLost,
        () =>
          new LoseOverlay({
            onContinue: () => {
              this._gameState.reset();
              this._gameState.start();
            },
          }),
      ],
    ]);

    this._overlayManager = new OverlayManager(
      this._app,
      this._uiRoot,
      overlayFactories,
    );

    await this._overlayManager.goTo(OverlayId.Home, {
      immediateTransition: true,
    });

    this.initListeners();
  }

  public initGame(): void {
    this.setupScene();

    this._gameUI = new GameUI(() => {
      this._gameState.pause();
    }, this._gameProgress.collectionTarget);

    this._gameUI.hide();
    this._uiRoot.addChild(this._gameUI);

    this._app?.stage.addChild(this._uiRoot);

    this._keyboard.onAction(this._onKeyboardAction);
    this._handleResize();
  }

  private initListeners(): void {
    window.addEventListener("resize", this._handleResize);
  }

  private setupScene(): void {
    if (!this._app) {
      throw new Error("GameApp has not been initialised");
    }

    this._gameWorld.init();
    this._app.stage.addChild(this._gameWorld);
  }

  private addPoint(): void {
    const collections = this._gameProgress.addCollection();
    this._gameUI.setCollections(collections);

    if (collections >= this._gameProgress.collectionTarget) {
      this._gameState.end(GameResult.Won);
    }
  }

  private resetGameProgress(): void {
    this._gameProgress.reset();
    this._gameUI.reset();
  }

  private _onGameStateChange({ from, to, result }: GameStateChange): void {
    switch (to) {
      case GameState.Playing:
        if (from === GameState.Paused) {
          this._gameWorld.resume();
        } else {
          this._gameWorld.start();
          this.resetGameProgress();
        }

        this._gameUI.show();
        this._overlayManager.goTo(null);
        break;

      case GameState.Paused:
        this._gameWorld.pause();
        void this._overlayManager.goTo(OverlayId.Pause);
        this._gameUI.hide();
        break;

      case GameState.Ended:
        this._gameWorld.end();
        this._gameUI.hide();
        void this._overlayManager.goTo(
          result === GameResult.Won ? OverlayId.EndWon : OverlayId.EndLost,
          {
            meta: { ...this._gameProgress.getStats() },
          },
        );
        break;

      case GameState.Idle:
        this._gameWorld.reset();
        this._gameUI.hide();
        break;
    }
  }

  public destroy(): void {
    window.removeEventListener("resize", this._handleResize);

    this._keyboard.destroy();

    this._app?.destroy(true);
  }

  private _onKeyboardAction = (action: KeyboardAction): void => {
    if (
      [
        KeyboardAction.MoveLeft,
        KeyboardAction.MoveRight,
        KeyboardAction.Jump,
      ].includes(action)
    ) {
      this._gameUI.hideDemo();
    }

    if (action === KeyboardAction.end_win) {
      this._gameState.end(GameResult.Won);
    }
    if (action === KeyboardAction.end_lose) {
      this._gameState.end(GameResult.Lost);
    }
    if (action === KeyboardAction.Pause) {
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

  private readonly _handleResize = (): void => {
    if (!this._app) {
      return;
    }

    const { width, height } = this._app.screen;

    this._overlayManager.onResize(width, height);
    this._gameUI.onResize(width, height);
  };
}
