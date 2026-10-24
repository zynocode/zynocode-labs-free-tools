/**
 * SDK Types
 * TypeScript type definitions for the Zynocode SDK.
 */

export interface ZynocodeConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface ToolExecution {
  toolSlug: string;
  params: Record<string, unknown>;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs?: number;
}

export interface ToolManifest {
  name: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  version: string;
  status: string;
  inputSchema?: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface StreamEvent {
  type: "progress" | "log" | "event" | "completion" | "error";
  data: unknown;
  timestamp: string;
}

export interface ManifestResponse {
  totalTools: number;
  categories: Record<string, number>;
  tools: Array<{
    tool: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
    };
    metadata: {
      slug: string;
      category: string;
      tags: string[];
      version: string;
      status: string;
    };
  }>;
}
