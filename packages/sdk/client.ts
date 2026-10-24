/**
 * @zynocode/sdk — Official TypeScript Client
 * Thin, typed API client over the Zynocode Labs REST Tool Platform.
 * Server/PostgreSQL remains the sole authoritative source of truth.
 */

export interface ZynocodeClientOptions {
  apiKey?: string;
  baseUrl?: string;
  workspaceId?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export interface ListToolsOptions {
  category?: string;
  search?: string;
  activeOnly?: boolean;
}

export interface ToolMetadata {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string | null;
  status: "active" | "inactive" | "deprecated";
  creditCost: number;
  isNew: boolean;
  isPopular: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecuteToolOptions {
  executionId?: string;
  idempotencyKey?: string;
  workspaceId?: string;
  timeoutMs?: number;
}

export interface ToolExecutionResponse<T = unknown> {
  success: boolean;
  executionId: string;
  status: "completed" | "started" | "running" | "failed" | "cancelled";
  durationMs: number;
  creditsConsumed: number;
  isReplayed: boolean;
  result: T;
  outputSummary?: string;
}

export interface ExecutionRecordResponse {
  success: boolean;
  execution: {
    id: string;
    executionId: string;
    toolId: string;
    toolSlug: string;
    userId: string;
    workspaceId: string;
    status: string;
    creditsConsumed: number;
    durationMs?: number;
    errorDetails?: string | null;
    outputReference?: string | null;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Base error class for all Zynocode SDK errors.
 */
export class ZynocodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZynocodeError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * API error returned by Zynocode REST API endpoints.
 */
export class ZynocodeApiError extends ZynocodeError {
  public readonly status: number;
  public readonly code: string;
  public readonly retryAfter?: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: string = "API_ERROR",
    details?: unknown,
    retryAfter?: number
  ) {
    super(message);
    this.name = "ZynocodeApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ZynocodeClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly workspaceId?: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ZynocodeClientOptions = {}) {
    this.apiKey = options.apiKey || (typeof process !== "undefined" ? process.env?.ZYNOCODE_API_KEY : undefined);
    this.baseUrl = (
      options.baseUrl ||
      (typeof process !== "undefined" ? process.env?.ZYNOCODE_BASE_URL : undefined) ||
      "https://labs.zynocode.com"
    ).replace(/\/+$/, "");
    this.workspaceId = options.workspaceId || (typeof process !== "undefined" ? process.env?.ZYNOCODE_WORKSPACE_ID : undefined);
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.fetchImpl = options.fetch || globalThis.fetch;
  }

  private buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "zynocode-sdk/2.0.2",
      ...customHeaders,
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
      headers["x-api-key"] = this.apiKey;
    }

    if (this.workspaceId && !headers["x-workspace-id"]) {
      headers["x-workspace-id"] = this.workspaceId;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
      timeoutMs?: number;
    } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeout = options.timeoutMs ?? this.timeoutMs;
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await this.fetchImpl(url, {
        method: options.method || "GET",
        headers: this.buildHeaders(options.headers),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      let json: any;
      try {
        json = await res.json();
      } catch {
        json = { error: await res.text().catch(() => "Unknown response") };
      }

      if (!res.ok) {
        let retryAfter: number | undefined = undefined;
        if (typeof json?.retryAfter === "number") {
          retryAfter = json.retryAfter;
        } else {
          const headerRetry = res.headers?.get("retry-after");
          if (headerRetry) {
            const parsed = parseInt(headerRetry, 10);
            if (!isNaN(parsed)) retryAfter = parsed;
          }
        }

        throw new ZynocodeApiError(
          json?.error || `HTTP ${res.status} request failed`,
          res.status,
          json?.code || "HTTP_ERROR",
          json,
          retryAfter
        );
      }

      return json as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err instanceof ZynocodeApiError || err instanceof ZynocodeError) throw err;
      if (err?.name === "AbortError") {
        throw new ZynocodeApiError(`Request timed out after ${timeout}ms`, 408, "TIMEOUT");
      }
      throw new ZynocodeApiError(err?.message || "Network request failed", 0, "NETWORK_ERROR", err);
    }
  }

  /**
   * List available tools with optional filters.
   */
  public async listTools(
    options: ListToolsOptions = {}
  ): Promise<{ success: boolean; tools: ToolMetadata[]; count: number }> {
    const params = new URLSearchParams();
    if (options.category) params.set("category", options.category);
    if (options.search) params.set("search", options.search);
    if (options.activeOnly !== undefined) params.set("activeOnly", String(options.activeOnly));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await this.request<{ success: boolean; tools: ToolMetadata[]; count: number }>(
      `/api/v2/tools${queryString}`
    );
  }

  /**
   * Retrieve metadata for a single tool by its canonical slug or ID.
   */
  public async getTool(slug: string): Promise<ToolMetadata> {
    const cleanSlug = slug.replace(/^\/tools\//, "");
    const res = await this.request<{ success: boolean; tool: ToolMetadata }>(`/api/v2/tools/${cleanSlug}`);
    return res.tool;
  }

  /**
   * Execute a tool through the canonical Tool Platform REST interface.
   */
  public async executeTool<T = unknown>(
    slugOrId: string,
    params: Record<string, unknown> = {},
    options: ExecuteToolOptions = {}
  ): Promise<ToolExecutionResponse<T>> {
    const cleanSlug = slugOrId.replace(/^\/tools\//, "");
    const headers: Record<string, string> = {};

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }
    if (options.workspaceId) {
      headers["x-workspace-id"] = options.workspaceId;
    }

    return await this.request<ToolExecutionResponse<T>>(`/api/v2/tools/${cleanSlug}/execute`, {
      method: "POST",
      headers,
      body: {
        params,
        executionId: options.executionId,
      },
      timeoutMs: options.timeoutMs,
    });
  }

  /**
   * Retrieve execution status and result by execution ID.
   */
  public async getExecution(
    executionId: string,
    options: { workspaceId?: string; timeoutMs?: number } = {}
  ): Promise<ExecutionRecordResponse> {
    const headers: Record<string, string> = {};
    if (options.workspaceId) {
      headers["x-workspace-id"] = options.workspaceId;
    }

    return await this.request<ExecutionRecordResponse>(`/api/v2/executions/${executionId}`, {
      headers,
      timeoutMs: options.timeoutMs,
    });
  }
}
