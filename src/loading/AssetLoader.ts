import { Assets, extensions, ExtensionType } from "pixi.js";

export type LoadProgressHandler = (progress: number) => void;

export const ASSET_BUNDLES = {
  fonts: "fonts",
  loading: "loading",
  home: "home",
  game: "game",
} as const;

const AudioAssetParser = {
  extension: { type: ExtensionType.LoadParser, name: "audio-array-buffer" },
  test(url: string): boolean {
    return /\.(mp3|wav|ogg)$/i.test(url);
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
  public async init(): Promise<void> {
    await Assets.init({
      manifest: "/assets/manifest.json",
    });
  }

  public async loadBundle(
    bundle: string | string[],
    onProgress: LoadProgressHandler = () => {},
  ): Promise<void> {
    const bundles = Array.isArray(bundle) ? bundle : [bundle];

    onProgress(0);

    const progress = new Array(bundles.length).fill(0);

    await Promise.all(
      bundles.map((bundleName, index) =>
        Assets.loadBundle(bundleName, (bundleProgress) => {
          progress[index] = bundleProgress;

          const overallProgress =
            progress.reduce((sum, value) => sum + value, 0) / bundles.length;

          onProgress(overallProgress);
        }),
      ),
    );

    onProgress(1);
  }

  public get<T>(alias: string): T {
    const asset = Assets.get<T>(alias);

    if (!asset) {
      throw new Error(`Asset "${alias}" has not been loaded.`);
    }

    return asset;
  }

  public async unloadBundle(bundle: string): Promise<void> {
    await Assets.unloadBundle(bundle);
  }
}
