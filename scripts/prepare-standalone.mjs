import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next/standalone");
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

console.log("Standalone bundle ready at .next/standalone/");
