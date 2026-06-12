import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next/standalone");
const envFile = join(root, ".env.local");

if (!existsSync(join(standaloneDir, "server.js"))) {
  console.error("Standalone build not found. Run: npm run build");
  process.exit(1);
}

const nodeArgs = [];

if (existsSync(envFile)) {
  nodeArgs.push(`--env-file=${envFile}`);
}

nodeArgs.push("server.js");

const child = spawn(process.execPath, nodeArgs, {
  cwd: standaloneDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
