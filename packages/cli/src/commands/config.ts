/**
 * CLI: config command
 * Get/set CLI configuration.
 */

import { loadConfig, setConfigValue, ZynocodeConfig } from "../config-store.js";

export async function configCommand(args: string[]): Promise<void> {
  const action = args[0]; // get, set, list

  if (!action || action === "list") {
    const config = loadConfig();
    console.log("\n  Zynocode CLI Configuration:\n");
    console.log(`    apiUrl:           ${config.apiUrl}`);
    console.log(`    apiKey:           ${config.apiKey ? config.apiKey.substring(0, 12) + "..." : "(not set)"}`);
    console.log(`    defaultWorkspace: ${config.defaultWorkspace || "(not set)"}`);
    console.log();
    return;
  }

  if (action === "get") {
    const key = args[1] as keyof ZynocodeConfig;
    if (!key) {
      console.log("  Usage: zynocode config get <key>");
      return;
    }
    const config = loadConfig();
    console.log(config[key] || "(not set)");
    return;
  }

  if (action === "set") {
    const key = args[1] as keyof ZynocodeConfig;
    const value = args[2];
    if (!key || !value) {
      console.log("  Usage: zynocode config set <key> <value>");
      return;
    }
    setConfigValue(key, value);
    console.log(`  ✓ ${key} = ${value}`);
    return;
  }

  console.log("  Usage: zynocode config [list|get|set]");
}
