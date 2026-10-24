/**
 * Zynocode SDK
 * Official TypeScript/JavaScript client for Zynocode Labs.
 *
 * Usage:
 *   import { ZynocodeClient } from "zynocode/sdk";
 *
 *   const client = new ZynocodeClient({ apiKey: "zyno_ak_..." });
 *   const result = await client.executeTool("json-formatter", { jsonText: '{"a":1}' });
 */

import type { ZynocodeConfig, ToolResult, ManifestResponse, StreamEvent } from "./types.js";

export type { ZynocodeConfig, ToolResult, ManifestResponse, StreamEvent };

export class ZynocodeClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: ZynocodeConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || "https://labs.zynocode.com";
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      "User-Agent": "zynocode-sdk/1.0.1",
    };
  }

  /**
   * List all available tools with metadata.
   */
  async listTools(): Promise<ManifestResponse> {
    const res = await fetch(`${this.apiUrl}/api/v1/mcp/manifest`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json() as Promise<ManifestResponse>;
  }

  /**
   * Execute a tool by slug.
   */
  async executeTool<T = unknown>(slug: string, params: Record<string, unknown> = {}): Promise<ToolResult<T>> {
    const res = await fetch(`${this.apiUrl}/api/v1/tools/${slug}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<ToolResult<T>>;
  }

  /**
   * Execute a tool with streaming SSE output.
   * Returns an async iterator of StreamEvents.
   */
  async *stream(slug: string, params: Record<string, unknown> = {}): AsyncGenerator<StreamEvent> {
    const res = await fetch(`${this.apiUrl}/api/v1/tools/${slug}/stream`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ params }),
    });

    if (!res.ok) {
      throw new Error(`Stream error ${res.status}`);
    }

    if (!res.body) {
      throw new Error("No stream body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event = JSON.parse(line.slice(6)) as StreamEvent;
            yield event;
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  }

  /**
   * Get MCP connection config for an IDE client.
   */
  async getConnectionConfig(client: string): Promise<unknown> {
    const res = await fetch(
      `${this.apiUrl}/api/v1/mcp/connect?client=${client}&apiKey=${this.apiKey}`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  }

  /**
   * Send MCP JSON-RPC request to the server.
   */
  async mcpRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(`${this.apiUrl}/api/v1/mcp`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    });
    if (!res.ok) throw new Error(`MCP error ${res.status}`);
    return res.json();
  }
}
