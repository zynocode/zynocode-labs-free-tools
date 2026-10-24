import { UniversalToolManifest, ExecutionInput, ExecutionResult, ToolHandler } from "./types";
import { ManifestValidator } from "./manifest-validator";

export async function testToolExecution(
  handler: ToolHandler,
  input: ExecutionInput
): Promise<ExecutionResult> {
  const result = await handler(input, {});
  return {
    ...result,
    durationMs: 0,
  };
}

export function assertValidManifest(manifest: UniversalToolManifest): boolean {
  try {
    ManifestValidator.validate(manifest);
    return true;
  } catch {
    return false;
  }
}
