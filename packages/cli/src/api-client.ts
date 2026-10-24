/**
 * API Client
 * HTTP client wrapper for Zynocode Labs REST API.
 * Uses Node 18+ built-in fetch. Zero dependencies.
 */

import { loadConfig } from "./config-store.js";

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs?: number;
}

export class ApiClient {
  private apiUrl: string;
  private apiKey: string | undefined;

  constructor(apiUrl?: string, apiKey?: string) {
    const config = loadConfig();
    this.apiUrl = apiUrl || config.apiUrl;
    this.apiKey = apiKey || config.apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "zynocode-cli/1.0.1",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async get<T = unknown>(path: string): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API error ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async executeTool(slug: string, params: Record<string, unknown>): Promise<APIResponse> {
    return this.post(`/api/v1/tools/${slug}`, params);
  }

  async listTools(): Promise<unknown> {
    return this.get("/api/v1/mcp/manifest");
  }

  async streamTool(slug: string, params: Record<string, unknown>): Promise<Response> {
    const res = await fetch(`${this.apiUrl}/api/v1/tools/${slug}/stream`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ params }),
    });
    return res;
  }
}
