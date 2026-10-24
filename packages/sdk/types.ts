export type ToolCategory =
  | "pdf"
  | "image"
  | "developer"
  | "converters"
  | "ai"
  | "calculators"
  | "utility";

export interface UniversalToolManifest {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  subcategory?: string;
  version: string;
  status: "active" | "beta" | "deprecated";
  iconName: string;
  accentColor: string;
  tags: string[];
  permissions?: Array<"file-system" | "network" | "camera" | "clipboard">;
  creditsRequired?: number;
  maxFileSizeBytes?: number;
  acceptedMimeTypes?: string[];
  isNew?: boolean;
  isPopular?: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface ExecutionInput {
  params?: Record<string, any>;
  files?: File[];
  workspaceId?: string;
}

export interface ExecutionContext {
  userId?: string;
  workspaceId?: string;
  userRole?: string;
  userPlan?: string;
  executionId?: string;
}

export interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  outputFiles?: Array<{ name: string; blob: Blob; mimeType: string }>;
  inputSummary?: string;
  outputSummary?: string;
  durationMs: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ToolHandler = (
  input: ExecutionInput,
  context: ExecutionContext
) => Promise<Omit<ExecutionResult, "durationMs">>;
