import { UniversalToolManifest, ToolHandler, ToolCategory } from "./types";
import { ManifestValidator } from "./manifest-validator";

export class ToolBuilder {
  private manifest: Partial<UniversalToolManifest> = {
    version: "2.0.0",
    status: "active",
    accentColor: "#e5322d",
    tags: [],
  };
  private handlerFn?: ToolHandler;

  constructor(id: string) {
    this.manifest.id = id;
    this.manifest.slug = `/tools/${id}`;
  }

  public setName(name: string): this {
    this.manifest.name = name;
    return this;
  }

  public setDescription(desc: string): this {
    this.manifest.description = desc;
    return this;
  }

  public setCategory(category: ToolCategory): this {
    this.manifest.category = category;
    return this;
  }

  public setIcon(iconName: string): this {
    this.manifest.iconName = iconName;
    return this;
  }

  public setTags(tags: string[]): this {
    this.manifest.tags = tags;
    return this;
  }

  public setLimits(maxFileSizeBytes: number, acceptedMimeTypes: string[]): this {
    this.manifest.maxFileSizeBytes = maxFileSizeBytes;
    this.manifest.acceptedMimeTypes = acceptedMimeTypes;
    return this;
  }

  public setSeo(title: string, description: string, keywords: string[]): this {
    this.manifest.seo = { title, description, keywords };
    return this;
  }

  public setHandler(handler: ToolHandler): this {
    this.handlerFn = handler;
    return this;
  }

  public build(): { manifest: UniversalToolManifest; handler: ToolHandler } {
    if (!this.handlerFn) {
      throw new Error(`ToolBuilder error [${this.manifest.id}]: Execution handler is required.`);
    }

    const fullManifest = this.manifest as UniversalToolManifest;
    ManifestValidator.validate(fullManifest);

    return {
      manifest: fullManifest,
      handler: this.handlerFn,
    };
  }
}

export function createTool(id: string): ToolBuilder {
  return new ToolBuilder(id);
}
