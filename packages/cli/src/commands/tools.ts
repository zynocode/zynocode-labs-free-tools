/**
 * CLI: tools command
 * Lists all available tools.
 */

import { ApiClient } from "../api-client.js";

interface ManifestResponse {
  totalTools: number;
  categories: Record<string, number>;
  tools: Array<{
    tool: { name: string; description: string };
    metadata: { slug: string; category: string; tags: string[] };
  }>;
}

export async function toolsCommand(args: string[]): Promise<void> {
  const client = new ApiClient();
  const categoryFilter = args.find((a) => a.startsWith("--category="))?.split("=")[1];
  const jsonOutput = args.includes("--json");

  try {
    const manifest = (await client.listTools()) as ManifestResponse;

    let tools = manifest.tools;
    if (categoryFilter) {
      tools = tools.filter((t) => t.metadata.category === categoryFilter);
    }

    if (jsonOutput) {
      console.log(JSON.stringify(tools, null, 2));
      return;
    }

    console.log(`\n  Zynocode Labs — ${manifest.totalTools} tools available\n`);

    if (categoryFilter) {
      console.log(`  Category: ${categoryFilter} (${tools.length} tools)\n`);
    } else {
      console.log("  Categories:", Object.entries(manifest.categories).map(([k, v]) => `${k}(${v})`).join(", "), "\n");
    }

    // Group by category
    const grouped = new Map<string, typeof tools>();
    for (const t of tools) {
      const cat = t.metadata.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(t);
    }

    for (const [category, catTools] of grouped) {
      console.log(`  ── ${category.toUpperCase()} ──`);
      for (const t of catTools) {
        console.log(`    ${t.metadata.slug.padEnd(35)} ${t.tool.description.substring(0, 60)}`);
      }
      console.log();
    }
  } catch (err: unknown) {
    const e = err as Error;
    console.error(`  ✗ Failed to fetch tools: ${e.message}`);
    process.exit(1);
  }
}
