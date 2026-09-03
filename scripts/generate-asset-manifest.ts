import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ASSETS_DIR = path.resolve("public/assets");
const MANIFEST_PATH = path.resolve("public/assets/manifest.json");

const BUNDLES = ["fonts", "loading", "home", "game-core", "game-full"];

interface PixiAsset {
  alias: string;
  src: string;
}

interface PixiBundle {
  name: string;
  assets: PixiAsset[];
}

async function main() {
  const bundles: PixiBundle[] = [];

  for (const bundleName of BUNDLES) {
    const bundleDirectory = path.join(ASSETS_DIR, bundleName);

    const files = await getFiles(bundleDirectory);

    const assets = files.map((file) => {
      const relativePath = path.relative(ASSETS_DIR, file);
      const urlPath = `/assets/${relativePath.replaceAll(path.sep, "/")}`;

      const filename = path.basename(file);
      const alias = path.basename(filename, path.extname(filename));

      return {
        alias,
        src: urlPath,
      };
    });

    bundles.push({
      name: bundleName,
      assets,
    });
  }

  const manifest = {
    bundles,
  };

  await writeFile(
    MANIFEST_PATH,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(`Generated ${MANIFEST_PATH}`);

  for (const bundle of bundles) {
    console.log(`  ${bundle.name}: ${bundle.assets.length} assets`);
  }
}

async function getFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath)));
      continue;
    }

    if (isAssetFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function isAssetFile(filename: string) {
  return /\.(png|jpg|jpeg|webp|avif|svg|json|mp3|wav|ogg|mp4|ttf|woff|woff2)$/i.test(
    filename,
  );
}

main().catch((error) => {
  console.error("Failed to generate asset manifest");
  console.error(error);
  process.exit(1);
});
