import { UniversalToolManifest } from "./types";

export class ManifestValidator {
  public static validate(manifest: UniversalToolManifest): void {
    if (!manifest.id || typeof manifest.id !== "string") {
      throw new Error("Manifest validation error: 'id' is required and must be a string.");
    }

    if (!manifest.name || typeof manifest.name !== "string") {
      throw new Error(`Manifest validation error [${manifest.id}]: 'name' is required.`);
    }

    if (!manifest.slug || !manifest.slug.startsWith("/tools/")) {
      throw new Error(`Manifest validation error [${manifest.id}]: 'slug' must start with '/tools/'.`);
    }

    const validCategories = ["pdf", "image", "developer", "converters", "ai", "calculators", "utility"];
    if (!validCategories.includes(manifest.category)) {
      throw new Error(
        `Manifest validation error [${manifest.id}]: invalid category '${manifest.category}'. Allowed: ${validCategories.join(", ")}`
      );
    }

    if (!manifest.seo || !manifest.seo.title || !manifest.seo.description) {
      throw new Error(`Manifest validation error [${manifest.id}]: 'seo.title' and 'seo.description' are required.`);
    }
  }
}
