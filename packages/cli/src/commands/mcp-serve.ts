/**
 * CLI: mcp-serve command
 * Stdio MCP server for local IDE integrations.
 * Reads JSON-RPC from stdin, writes responses to stdout.
 * Used by Cursor, Claude Desktop, VS Code, etc.
 */

import { ApiClient } from "../api-client.js";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface ManifestResponse {
  tools: Array<{
    tool: MCPTool;
    metadata: { slug: string; category: string };
  }>;
}

let toolsCache: MCPTool[] | null = null;
let toolSlugMap: Map<string, string> | null = null;

async function loadTools(client: ApiClient): Promise<void> {
  if (toolsCache) return;

  const manifest = (await client.listTools()) as ManifestResponse;
  toolsCache = manifest.tools.map((t) => t.tool);
  toolSlugMap = new Map(manifest.tools.map((t) => [t.tool.name, t.metadata.slug]));
}

function respond(id: string | number | null, result: unknown): void {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, result });
  process.stdout.write(msg + "\n");
}

function respondError(id: string | number | null, code: number, message: string): void {
  const msg = JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
  process.stdout.write(msg + "\n");
}

export async function mcpServeCommand(): Promise<void> {
  const client = new ApiClient();

  // Read stdin line by line
  let buffer = "";

  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", async (chunk: string) => {
    buffer += chunk;

    // Process complete JSON messages (newline-delimited)
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const req = JSON.parse(line) as JsonRpcRequest;
        await handleRequest(req, client);
      } catch {
        respondError(null, -32700, "Parse error");
      }
    }
  });

  process.stdin.on("end", () => {
    process.exit(0);
  });

  // Keep process alive
  process.stdin.resume();
}

async function handleRequest(req: JsonRpcRequest, client: ApiClient): Promise<void> {
  switch (req.method) {
    case "initialize":
      respond(req.id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "zynocode-labs", version: "1.0.0" },
      });
      break;

    case "initialized":
      // No response needed for notification
      break;

    case "ping":
      respond(req.id, {});
      break;

    case "tools/list":
      try {
        await loadTools(client);
        respond(req.id, { tools: toolsCache || [] });
      } catch (err: unknown) {
        const e = err as Error;
        respondError(req.id, -32603, `Failed to list tools: ${e.message}`);
      }
      break;

    case "tools/call": {
      const toolName = req.params?.name as string;
      const toolArgs = (req.params?.arguments || {}) as Record<string, unknown>;

      if (!toolName) {
        respondError(req.id, -32602, 'Missing "name" parameter');
        break;
      }

      try {
        await loadTools(client);
        const slug = toolSlugMap?.get(toolName) || toolName.replace(/_/g, "-");
        const params = (toolArgs.params as Record<string, unknown>) || toolArgs;

        const result = await client.executeTool(slug, params);

        if (result.success) {
          respond(req.id, {
            content: [
              {
                type: "text",
                text: typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2),
              },
            ],
          });
        } else {
          respond(req.id, {
            content: [{ type: "text", text: JSON.stringify({ error: result.error }) }],
            isError: true,
          });
        }
      } catch (err: unknown) {
        const e = err as Error;
        respondError(req.id, -32002, e.message || "Tool execution failed");
      }
      break;
    }

    default:
      respondError(req.id, -32601, `Method "${req.method}" not found`);
  }
}
