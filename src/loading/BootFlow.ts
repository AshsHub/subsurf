import type { Application } from "pixi.js";
import type { AssetLoader } from "./AssetLoader";
import { ASSET_BUNDLES } from "./AssetLoader";
import { LoadingScene } from "../scenes/LoadingScene";

export class BootFlow {
  constructor(
    private readonly app: Application,
    private readonly assetLoader: AssetLoader,
  ) {}

  public async run(): Promise<void> {
    const loadingScene = new LoadingScene();
    this.app.stage.addChild(loadingScene);

    loadingScene.onResize(this.app.screen.width, this.app.screen.height);

    loadingScene.setProgress(0);
    loadingScene.onEnter?.();
    loadingScene.alpha = 1;
    await this.nextFrame();
    await this.assetLoader.init();

    await this.assetLoader.loadBundle(
      [ASSET_BUNDLES.fonts, ASSET_BUNDLES.home],
      (progress) => {
        loadingScene.setProgress(progress);
      },
    );

    loadingScene.setProgress(1);

    // Let the final loading state render.
    await this.nextFrame();

    loadingScene.onExit?.();

    this.app.stage.removeChild(loadingScene);

    loadingScene.destroy({
      children: true,
    });
  }

  private nextFrame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}
