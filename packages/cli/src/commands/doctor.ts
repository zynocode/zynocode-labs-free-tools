/**
 * CLI: doctor command
 * Checks connectivity, auth, and version.
 */

import { loadConfig } from "../config-store.js";
import { ApiClient } from "../api-client.js";

export async function doctorCommand(): Promise<void> {
  const config = loadConfig();
  let ok = true;

  console.log("\n  Zynocode Doctor\n");

  // 1. Config check
  if (config.apiKey) {
    console.log("  ✓ API key configured");
  } else {
    console.log("  ✗ API key not set (run: zynocode login <key>)");
    ok = false;
  }

  console.log(`  ✓ API URL: ${config.apiUrl}`);

  // 2. Connectivity check
  try {
    const client = new ApiClient();
    const manifest = (await client.listTools()) as { totalTools: number };
    console.log(`  ✓ API reachable — ${manifest.totalTools} tools available`);
  } catch (err: unknown) {
    const e = err as Error;
    console.log(`  ✗ API unreachable: ${e.message}`);
    ok = false;
  }

  // 3. Node version check
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (major >= 18) {
    console.log(`  ✓ Node.js ${nodeVersion}`);
  } else {
    console.log(`  ✗ Node.js ${nodeVersion} — requires >=18.0.0`);
    ok = false;
  }

  console.log();
  console.log(ok ? "  All checks passed ✓" : "  Some checks failed ✗");
  console.log();
}
