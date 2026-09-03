import { Assets } from "pixi.js";

export type LoadProgressHandler = (progress: number) => void;

export const ASSET_BUNDLES = {
  fonts: "fonts",
  loading: "loading",
  home: "home",
  "game-core": "game-core",
  "game-full": "game-full",
} as const;

export class AssetLoader {
  async init() {
    await Assets.init({
      manifest: "/assets/manifest.json",
    });
  }

  async loadBundle(
    bundle: string | string[],
    onProgress: LoadProgressHandler = () => {},
  ) {
    const bundles = Array.isArray(bundle) ? bundle : [bundle];
    onProgress(0);

    const progress = new Array(bundles.length).fill(0);
    await Promise.all(
      bundles.map((bundle, index) =>
        Assets.loadBundle(bundle, (bundleProgress) => {
          progress[index] = bundleProgress;

          const overallProgress =
            progress.reduce((sum, value) => sum + value, 0) / bundles.length;

          console.log(
            `Loading bundle "${bundle}": ${Math.round(bundleProgress * 100)}%`,
          );

          onProgress(overallProgress);
        }),
      ),
    );

    onProgress(1);
  }

  async unloadBundle(bundle: string) {
    await Assets.unloadBundle(bundle);
  }
}
