import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const serverEntry = join(standaloneDir, "server.js");

if (!existsSync(serverEntry)) {
  console.error("Standalone build not found. Run `npm run build` first.");
  process.exit(1);
}

cpSync(join(root, "public"), join(standaloneDir, "public"), { recursive: true });
cpSync(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), {
  recursive: true,
});

const child = spawn("node", ["server.js"], {
  cwd: standaloneDir,
  stdio: "inherit",
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME ?? "0.0.0.0",
    PORT: process.env.PORT ?? "3000",
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
