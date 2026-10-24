/**
 * CLI: login command
 * Stores API key in ~/.zynocode/config.json
 */

import { saveConfig, loadConfig } from "../config-store.js";

export async function loginCommand(args: string[]): Promise<void> {
  const apiKey = args[0];

  if (!apiKey) {
    console.log("\n  Usage: zynocode login <api-key>\n");
    console.log("  Get your API key at: https://labs.zynocode.com/developer/agents\n");
    process.exit(1);
  }

  if (!apiKey.startsWith("zyno_")) {
    console.error("  ✗ Invalid API key format. Keys start with 'zyno_'.");
    process.exit(1);
  }

  saveConfig({ apiKey });
  const config = loadConfig();

  console.log("\n  ✓ API key saved successfully.");
  console.log(`  ✓ API URL: ${config.apiUrl}`);
  console.log("  ✓ Run 'zynocode doctor' to verify your connection.\n");
}
