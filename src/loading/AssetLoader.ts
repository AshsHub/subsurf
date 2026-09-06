import { Assets, extensions, ExtensionType } from "pixi.js";

export type LoadProgressHandler = (progress: number) => void;

export const ASSET_BUNDLES = {
  fonts: "fonts",
  home: "home",
  game: "game",
} as const;

const AudioAssetParser = {
  extension: {
    type: ExtensionType.LoadParser,
    name: "audio-array-buffer",
  },

  test(url: string): boolean {
    return /\.(mp3|wav|ogg)(\?.*)?$/i.test(url);
  },
  async load(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to load audio asset "${url}": ` +
          `${response.status} ${response.statusText}`,
      );
    }

    return response.arrayBuffer();
  },
};

extensions.add(AudioAssetParser);

export class AssetLoader {
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await Assets.init({
      manifest: "/assets/manifest.json",
    });
    this.initialized = true;
  }

  public async loadBundle(
    bundle: string | string[],
    onProgress: LoadProgressHandler = () => {},
  ): Promise<void> {
    this.assertInitialized();

    const bundles = Array.isArray(bundle) ? bundle : [bundle];

    if (bundles.length === 0) {
      onProgress(1);
      return;
    }

    const progress = new Array(bundles.length).fill(0);
    onProgress(0);
    await Promise.all(
      bundles.map((bundleName, index) =>
        Assets.loadBundle(bundleName, (bundleProgress) => {
          progress[index] = bundleProgress;

          console.log(bundleName, progress);

          const overallProgress =
            progress.reduce((sum, value) => sum + value, 0) / bundles.length;

          onProgress(overallProgress);
        }),
      ),
    );

    onProgress(1);
  }

  public get<T>(alias: string): T {
    this.assertInitialized();
    const asset = Assets.get<T>(alias);

    if (!asset) {
      throw new Error(`Asset "${alias}" has not been loaded.`);
    }

    return asset;
  }

  public async unloadBundle(bundle: string): Promise<void> {
    this.assertInitialized();
    await Assets.unloadBundle(bundle);
  }

  private assertInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "AssetLoader has not been initialized. Call init() first.",
      );
    }
  }
}
