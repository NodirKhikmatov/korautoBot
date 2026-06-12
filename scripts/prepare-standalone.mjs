import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next/standalone");
const standaloneNodeModules = join(standaloneDir, "node_modules");
const staticSrc = join(root, ".next/static");
const staticDest = join(standaloneDir, ".next/static");
const publicSrc = join(root, "public");
const publicDest = join(standaloneDir, "public");

if (!existsSync(join(standaloneDir, "server.js"))) {
  throw new Error(
    "Standalone build not found. Run npm run build first (output: standalone).",
  );
}

mkdirSync(join(standaloneDir, ".next"), { recursive: true });

if (existsSync(staticSrc)) {
  cpSync(staticSrc, staticDest, { recursive: true });
  console.log("Copied .next/static → .next/standalone/.next/static");
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
  console.log("Copied public → .next/standalone/public");
}

/** Next standalone tracing can miss sharp native bindings — copy from root install. */
function copySharpNativeModules() {
  mkdirSync(standaloneNodeModules, { recursive: true });

  const sharpSrc = join(root, "node_modules/sharp");
  if (existsSync(sharpSrc)) {
    cpSync(sharpSrc, join(standaloneNodeModules, "sharp"), { recursive: true });
    console.log("Copied node_modules/sharp → standalone");
  }

  const imgSrc = join(root, "node_modules/@img");
  if (existsSync(imgSrc)) {
    cpSync(imgSrc, join(standaloneNodeModules, "@img"), { recursive: true });
    console.log("Copied node_modules/@img → standalone");
  }
}

/** Next bundles its own sharp — two libvips copies break image upload on macOS. */
function removeNestedSharpDuplicates() {
  const nestedPaths = [
    join(standaloneNodeModules, "next/node_modules/sharp"),
    join(standaloneNodeModules, "next/node_modules/@img"),
  ];

  for (const path of nestedPaths) {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
      console.log(`Removed duplicate ${path.replace(standaloneDir + "/", "")}`);
    }
  }
}

copySharpNativeModules();
removeNestedSharpDuplicates();

console.log("Standalone bundle ready at .next/standalone/");
