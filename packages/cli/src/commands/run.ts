/**
 * CLI: run command
 * Execute a tool via the REST API.
 * Usage: zynocode run <tool-slug> --param key=value
 */

import { ApiClient } from "../api-client.js";

export async function runCommand(args: string[]): Promise<void> {
  const slug = args[0];

  if (!slug) {
    console.log("\n  Usage: zynocode run <tool-slug> [--param key=value ...]\n");
    console.log("  Example: zynocode run json-formatter --param jsonText='{\"a\":1}'\n");
    process.exit(1);
  }

  // Parse --param flags
  const params: Record<string, unknown> = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--param" && args[i + 1]) {
      const kv = args[i + 1];
      const eqIdx = kv.indexOf("=");
      if (eqIdx > 0) {
        const key = kv.substring(0, eqIdx);
        let value: unknown = kv.substring(eqIdx + 1);

        // Try parsing as JSON
        try {
          value = JSON.parse(value as string);
        } catch {
          // Keep as string
        }

        params[key] = value;
      }
      i++; // Skip next arg
    }
  }

  const stream = args.includes("--stream");
  const client = new ApiClient();

  try {
    console.log(`\n  ▸ Running ${slug}...`);

    if (stream) {
      const res = await client.streamTool(slug, params);
      if (!res.body) {
        console.error("  ✗ No stream body received");
        process.exit(1);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        process.stdout.write(text);
      }
      console.log();
    } else {
      const result = await client.executeTool(slug, params);

      if (result.success) {
        console.log("  ✓ Success");
        if (result.executionTimeMs) {
          console.log(`  ⏱ ${result.executionTimeMs}ms`);
        }
        if (result.data) {
          console.log("\n  Output:");
          const output = typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2);
          console.log(output.split("\n").map((l: string) => `    ${l}`).join("\n"));
        }
      } else {
        console.error(`  ✗ Error: ${result.error}`);
        process.exit(1);
      }
    }
  } catch (err: unknown) {
    const e = err as Error;
    console.error(`  ✗ Execution failed: ${e.message}`);
    process.exit(1);
  }

  console.log();
}
