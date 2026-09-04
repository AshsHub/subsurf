import type { Application } from "pixi.js";
import { gsap } from "gsap";
import type { AssetLoader } from "./AssetLoader";
import { ASSET_BUNDLES } from "./AssetLoader";
import { LoadingScene } from "../scenes/LoadingScene";

const LOADING_SCENE_DELAY_MS = 200;

export class BootFlow {
  private readonly app: Application;
  private readonly assetLoader: AssetLoader;

  constructor(app: Application, assetLoader: AssetLoader) {
    this.app = app;
    this.assetLoader = assetLoader;
  }

  async run() {
    let loadingScene: LoadingScene | undefined;
    let loadComplete = false;
    let lastProgress = 0;

    const loadPromise = this.assetLoader.loadBundle(
      [
        ASSET_BUNDLES.fonts,
        ASSET_BUNDLES.loading,
        ASSET_BUNDLES.home,
        ASSET_BUNDLES["game-core"],
      ],
      (progress) => {
        lastProgress = progress;
        loadingScene?.setProgress(progress);
      },
    );

    const delayPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, LOADING_SCENE_DELAY_MS);
    });

    loadPromise.then(() => {
      loadComplete = true;
    });

    await Promise.race([loadPromise, delayPromise]);

    if (!loadComplete) {
      loadingScene = new LoadingScene();
      this.app.stage.addChild(loadingScene);
      loadingScene.setProgress(lastProgress);
      loadingScene.onResize?.(this.app.screen.width, this.app.screen.height);
      await loadingScene.fadeIn();
      await loadPromise;
      loadingScene.setProgress(1);
      await loadingScene.fadeOut();
      this.app.stage.removeChild(loadingScene);
      loadingScene.destroy({ children: true });
    } else {
      await loadPromise;
    }

    gsap.killTweensOf(this.app.stage);
  }
}
