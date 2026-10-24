import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliEntry = join(__dirname, "..", "dist", "index.js");

console.log("=== zynocode CLI Smoke Test ===");

// 1. Test --help
console.log("Testing: node dist/index.js --help");
const helpOut = execFileSync(process.execPath, [cliEntry, "--help"], { encoding: "utf8" });
assert(helpOut.includes("zynocode"), "Help output must mention zynocode");
assert(helpOut.includes("Commands:"), "Help output must list commands");
assert(helpOut.includes("tools"), "Help output must list tools command");
assert(helpOut.includes("mcp-serve"), "Help output must list mcp-serve command");
console.log("✓ --help exited 0 with valid help text");

// 2. Test --version
console.log("Testing: node dist/index.js --version");
const versionOut = execFileSync(process.execPath, [cliEntry, "--version"], { encoding: "utf8" });
assert(versionOut.includes("1.0.1"), `Version output must contain 1.0.1, got: ${versionOut}`);
console.log("✓ --version exited 0 and printed 1.0.1");

// 3. Test version command
console.log("Testing: node dist/index.js version");
const versionCmdOut = execFileSync(process.execPath, [cliEntry, "version"], { encoding: "utf8" });
assert(versionCmdOut.includes("1.0.1"), `version command must contain 1.0.1, got: ${versionCmdOut}`);
console.log("✓ version command exited 0 and printed 1.0.1");

console.log("\n=== ALL CLI SMOKE TESTS PASSED ===");
