#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { resolve } = require("node:path");

const repositoryRoot = resolve(__dirname, "..");
const legacyEnvironment = {
  ...process.env,
  CODEPAIR_LEGACY_SETUP: "1",
  YORKIE_API_ADDR: process.env.YORKIE_API_ADDR || "localhost:8080",
  WEBHOOK_URL:
    process.env.WEBHOOK_URL || "http://localhost:3000/yorkie/document-events",
};
const cliArguments = [
  "cli",
  "setup",
  "yorkie",
  "--yes",
  "--allow-insecure-remote",
];
const command =
  process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "pnpm";
const commandArguments =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "pnpm cli setup yorkie --yes --allow-insecure-remote"]
    : cliArguments;
const result = spawnSync(command, commandArguments, {
  cwd: repositoryRoot,
  env: legacyEnvironment,
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(`Unable to start the CodePair CLI: ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
