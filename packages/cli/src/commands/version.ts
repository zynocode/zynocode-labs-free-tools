/**
 * CLI: version command
 */

import { readFileSync } from "fs";
import { join } from "path";

export async function versionCommand(): Promise<void> {
  try {
    const pkgPath = join(__dirname, "..", "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    console.log(`  zynocode v${pkg.version}`);
  } catch {
    console.log("  zynocode v1.0.1");
  }
}
