/**
 * CLI: search command
 * Fuzzy search across tool names and tags.
 */

import { ApiClient } from "../api-client.js";

interface ManifestResponse {
  tools: Array<{
    tool: { name: string; description: string };
    metadata: { slug: string; category: string; tags: string[] };
  }>;
}

export async function searchCommand(args: string[]): Promise<void> {
  const query = args.join(" ").toLowerCase().trim();

  if (!query) {
    console.log("\n  Usage: zynocode search <query>\n");
    console.log("  Example: zynocode search json\n");
    process.exit(1);
  }

  const client = new ApiClient();

  try {
    const manifest = (await client.listTools()) as ManifestResponse;

    const results = manifest.tools.filter((t) => {
      const name = t.tool.name.toLowerCase();
      const desc = t.tool.description.toLowerCase();
      const slug = t.metadata.slug.toLowerCase();
      const tags = t.metadata.tags.join(" ").toLowerCase();

      return (
        name.includes(query) ||
        desc.includes(query) ||
        slug.includes(query) ||
        tags.includes(query)
      );
    });

    if (results.length === 0) {
      console.log(`\n  No tools found matching "${query}"\n`);
      return;
    }

    console.log(`\n  Found ${results.length} tool(s) matching "${query}":\n`);

    for (const t of results) {
      console.log(`    ${t.metadata.slug.padEnd(35)} ${t.tool.name}`);
      console.log(`    ${"".padEnd(35)} ${t.tool.description.substring(0, 70)}`);
      console.log();
    }
  } catch (err: unknown) {
    const e = err as Error;
    console.error(`  ✗ Search failed: ${e.message}`);
    process.exit(1);
  }
}
