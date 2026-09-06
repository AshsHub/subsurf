import { Application, Container } from "pixi.js";

import {
  GameResult,
  GameState,
  GameStateManager,
  type GameStateChange,
} from "./GameState";

import { KeyboardAction, KeyboardInput } from "../input/KeyboardInput";
import { ASSET_BUNDLES, AssetLoader } from "../loading/AssetLoader";
import { BootFlow } from "../loading/BootFlow";
import { GameUI } from "../ui/GameUI";
import { HomeOverlay } from "../ui/overlay/HomeOverlay";
import { LoseOverlay } from "../ui/overlay/LoseOverlay";
import {
  OverlayId,
  OverlayManager,
  type OverlayFactory,
  type OverlayRegistration,
} from "../ui/overlay/OverlayManager";
import { PauseOverlay } from "../ui/overlay/PauseOverlay";
import { WinOverlay } from "../ui/overlay/WinOverlay";
import { GameProgress } from "./GameProgress";
import { MusicId, SoundController, SoundId } from "./SoundController";
import { LocalStorage } from "./StorageController";
import { GameWorld } from "./world/GameWorld";

export class GameApp {
  private _app: Application | undefined;
  private _gameContainer = new Container();
  private _uiContainer = new Container();
  private _storage: LocalStorage;
  private _soundController: SoundController;

  private _gameUI!: GameUI;
  private _overlayManager!: OverlayManager;

  private readonly _gameState = new GameStateManager();
  private readonly _assetLoader = new AssetLoader();
  private readonly _keyboard = new KeyboardInput();
  private readonly _gameProgress = new GameProgress();
  private readonly _gameWorld: GameWorld;
  private _gameInitialised = false;

  constructor() {
    this._storage = new LocalStorage({
      muted: false,
    });

    this._soundController = new SoundController(this._storage);

    this._gameWorld = new GameWorld(this._soundController);

    this._gameWorld.onHitObstacle.subscribe((side) => {
      this._gameState.end(GameResult.Lost);
    });

    this._gameWorld.onScored.subscribe(() => {
      this.addPoint();
    });

    this._gameState.onChange((stateChange) => {
      this._onGameStateChange(stateChange);
    });
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

    const canvas = app.view as HTMLCanvasElement;

    canvas.style.display = "block";

    const container = document.querySelector<HTMLDivElement>("#app");

    if (!container) {
      throw new Error("Game container not found");
    }

    container.appendChild(canvas);

    this._app = app;

    app.stage.addChild(this._gameContainer, this._uiContainer);
    const bootFlow = new BootFlow(app, this._assetLoader);

    await bootFlow.run();

    const muted = this._storage.get("muted");

    const overlayFactories = new Map<OverlayId, OverlayRegistration>([
      [
        OverlayId.Home,
        {
          factory: () =>
            new HomeOverlay({
              onRequestStart: () => {
                this.initGame();
                this._gameState.start();
              },
              onToggleMute: () => {
                const mute = !this._storage.get("muted");
                this._setMute(mute);
              },
              muted,
            }),
        },
      ],
      [
        OverlayId.Pause,
        {
          factory: () =>
            new PauseOverlay({
              onResume: () => {
                this._gameState.resume();
              },
              onToggleMute: () => {
                const mute = !this._storage.get("muted");
                this._setMute(mute);
              },
              muted,
            }),
          priority: 100,
        },
      ],

      [
        OverlayId.EndWon,
        {
          factory: () =>
            new WinOverlay({
              onContinue: () => {
                this._gameState.reset();
                this._gameState.start();
              },
              onToggleMute: () => {
                const mute = !this._storage.get("muted");
                this._setMute(mute);
              },
              onResultReveal: () => {
                this._soundController.playSfx(SoundId.GameWin);
              },
              muted,
            }),
          priority: 100,
        },
      ],
      [
        OverlayId.EndLost,
        {
          factory: () =>
            new LoseOverlay({
              onContinue: () => {
                this._gameState.reset();
                this._gameState.start();
              },
              onResultReveal: () => {
                this._soundController.playSfx(SoundId.GameLose);
              },
              onToggleMute: () => {
                const mute = !this._storage.get("muted");
                this._setMute(mute);
              },
              muted,
            }),

          priority: 100,
        },
      ],
    ]);

    this._overlayManager = new OverlayManager(
      app,
      this._uiContainer,
      overlayFactories,
    );

    this._overlayManager.onResize(
      this._app.screen.width,
      this._app.screen.height,
    );

    await this._overlayManager.goTo(OverlayId.Home, {
      immediateTransition: true,
    });

    this.initListeners();
    this.loadBackgroundAssets();
  }

  private async loadBackgroundAssets(): Promise<void> {
    try {
      await this._assetLoader.loadBundle(ASSET_BUNDLES.game);
      console.log("GAME BUNDLE LOADED");

      console.log("Registering menu music...");
      await this._soundController.register(MusicId.Menu);
      console.log("Menu music OK");

      for (const soundId of Object.values(SoundId)) {
        console.log("Registering:", soundId);
        await this._soundController.register(soundId);
        console.log("OK:", soundId);
      }

      console.log("Registering gameplay music...");
      await this._soundController.register(MusicId.Gameplay);
      console.log("Gameplay music OK");

      this._soundController.startMusicOnInteraction(MusicId.Menu);
    } catch (error) {
      console.error("Failed to load background assets", error);
    }
  }

  public initGame(): void {
    if (this._gameInitialised) {
      return;
    }
    this._gameInitialised = true;
    this.setupScene();

    this._gameUI = new GameUI(
      () => this._gameState.pause(),
      this._gameProgress.collectionTarget,
    );

    this._uiContainer.addChild(this._gameUI);
    this._keyboard.onAction(this._onKeyboardAction);

    this._handleResize();
  }

  private _setMute(mute: boolean): void {
    this._storage.set("muted", mute);
    this._soundController.setMuted(mute);
  }

  private initListeners(): void {
    window.addEventListener("resize", this._handleResize);
  }

  private setupScene(): void {
    if (!this._app) {
      throw new Error("GameApp has not been initialised");
    }

    this._gameWorld.init();
    this._gameContainer.addChild(this._gameWorld);
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

  private async _onGameStateChange({
    from,
    to,
    result,
  }: GameStateChange): Promise<void> {
    if (from === GameState.Idle) {
      this._soundController.playSfx(SoundId.GameStart);
    }

    if (to === GameState.Playing) {
      this._soundController.playMusic(MusicId.Gameplay);
    } else {
      this._soundController.playMusic(MusicId.Menu);
    }

    switch (to) {
      case GameState.Playing:
        if (from === GameState.Paused) {
          this._gameWorld.resume();
        } else {
          this._gameWorld.start();
          this.resetGameProgress();
        }

        this._gameUI.show();
        await this._overlayManager.goTo(null);
        break;

      case GameState.Paused:
        this._gameWorld.pause();
        this._gameUI.hide();
        await this._overlayManager.goTo(OverlayId.Pause);
        break;

      case GameState.Ended:
        this._gameWorld.end();
        this._gameUI.hide();

        await this._overlayManager.goTo(
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
