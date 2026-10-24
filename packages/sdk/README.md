# @zynocode/sdk

The official TypeScript/JavaScript SDK for interacting with the [Zynocode Labs Tool Platform](https://labs.zynocode.com).

Run Zynocode's text-based tools — financial calculators, developer utilities, writing analyzers and SEO generators — from Node.js scripts, backends, CI jobs or AI agents through the REST API.

[![npm version](https://img.shields.io/npm/v/@zynocode/sdk.svg)](https://www.npmjs.com/package/@zynocode/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

- **Documentation**: [labs.zynocode.com/developers/sdk](https://labs.zynocode.com/developers/sdk)
- **Source Code**: [github.com/zynocode/zynocode-labs-free-tools/tree/main/packages/sdk](https://github.com/zynocode/zynocode-labs-free-tools/tree/main/packages/sdk)
- **npm Package**: [@zynocode/sdk](https://www.npmjs.com/package/@zynocode/sdk)

---

## Key Capabilities

- **No runtime dependencies:** uses the built-in `fetch` (Node.js 18+).
- **Typed:** TypeScript definitions for requests, responses and errors; ships ESM and CommonJS builds.
- **Idempotency:** pass an `idempotencyKey` and a retried request returns the original execution instead of running twice.
- **Typed errors:** `ZynocodeApiError` carries `status`, `code` and, on HTTP 429, `retryAfter` seconds.

---

## Installation

```bash
npm install @zynocode/sdk
# or
pnpm add @zynocode/sdk
# or
yarn add @zynocode/sdk
```

---

## Authentication & API Keys

To execute tools via the SDK, you need an API key:

1. Log into [Zynocode Labs](https://labs.zynocode.com).
2. Open **API Keys** at [`/dashboard/account/api-keys`](https://labs.zynocode.com/dashboard/account/api-keys).
3. Create a new API key from your account dashboard.
4. Store your key in an environment variable named `ZYNOCODE_API_KEY`:

```bash
export ZYNOCODE_API_KEY="zyno_ak_your_actual_key_here"
```

The client automatically detects `ZYNOCODE_API_KEY` and defaults the API base URL to `https://labs.zynocode.com`.

---

## Quick Start

```typescript
import { ZynocodeClient } from "@zynocode/sdk";

// Initialize client (reads ZYNOCODE_API_KEY from environment by default)
const client = new ZynocodeClient();

async function main() {
  // 1. List available tools
  const { tools, count } = await client.listTools({ category: "finance" });
  console.log(`Available finance tools (${count}):`, tools.map(t => t.name));

  // 2. Execute a financial calculation
  const emiResult = await client.executeTool("emi-calculator", {
    principal: 500000,
    rate: 8.5,        // annual interest rate, %
    tenureYears: 5,
  });

  console.log("Execution status:", emiResult.status);
  console.log("EMI result:", emiResult.result);

  // 3. Execute a developer utility
  const hashResult = await client.executeTool<{ sha256: string; sha512: string }>(
    "hash-generator",
    { text: "Hello Zynocode" }
  );

  console.log("SHA-256:", hashResult.result.sha256);
}

main().catch(console.error);
```

---

## API Reference

### `new ZynocodeClient(options?)`

```typescript
const client = new ZynocodeClient({
  apiKey?: string;        // Defaults to process.env.ZYNOCODE_API_KEY
  baseUrl?: string;       // Defaults to process.env.ZYNOCODE_BASE_URL or "https://labs.zynocode.com"
  workspaceId?: string;   // Optional workspace ID override
  timeoutMs?: number;     // Request timeout in milliseconds (default: 30000)
  fetch?: typeof fetch;   // Custom fetch implementation (optional)
});
```

---

### `client.listTools(options?)`

List available tools and metadata.

```typescript
const { success, tools, count } = await client.listTools({
  category?: string;      // "finance", "developer", "writing", "seo", "utilities", "images", "pdf"
  search?: string;        // Text search across tool names and descriptions
  activeOnly?: boolean;   // Filter active tools only (default: true)
});
```

---

### `client.getTool(slug)`

Retrieve metadata for a single tool by its slug.

```typescript
const tool = await client.getTool("emi-calculator");
console.log(tool.name, tool.category, tool.creditCost);
```

---

### `client.executeTool<T>(slug, params, options?)`

Execute a tool with input parameters.

```typescript
interface HashOutput {
  sha256: string;
  sha512: string;
}

const response = await client.executeTool<HashOutput>(
  "hash-generator",
  { text: "sample" },
  {
    idempotencyKey?: string; // Prevent duplicate runs
    executionId?: string;    // Custom client execution UUID
    workspaceId?: string;    // Target workspace
    timeoutMs?: number;      // Override per-request timeout
  }
);

console.log(response.executionId);     // execution ID (use it with getExecution)
console.log(response.status);          // "completed"
console.log(response.creditsConsumed); // credits charged for this run
console.log(response.result.sha256);   // typed as HashOutput
```

---

### `client.getExecution(executionId, options?)`

Retrieve the status and results of a prior execution.

```typescript
const { success, execution } = await client.getExecution(response.executionId);
console.log(execution.status, execution.durationMs);
```

---

## Error Handling

The SDK throws typed errors (`ZynocodeApiError` and `ZynocodeError`) for clear inspection:

```typescript
import { ZynocodeClient, ZynocodeApiError } from "@zynocode/sdk";

const client = new ZynocodeClient();

try {
  await client.executeTool("emi-calculator", { amount: -500 });
} catch (error) {
  if (error instanceof ZynocodeApiError) {
    console.error("HTTP Status:", error.status);        // e.g. 400, 401, 429
    console.error("Error Code:", error.code);           // "VALIDATION_ERROR", "UNAUTHORIZED", "FORBIDDEN", "RATE_LIMIT_EXCEEDED", "EXECUTION_ERROR"
    console.error("Message:", error.message);
    
    // Handle 429 Rate Limiting
    if (error.status === 429 && error.retryAfter) {
      console.warn(`Rate limited. Retry after ${error.retryAfter} seconds.`);
    }
  } else {
    console.error("Unexpected error:", error);
  }
}
```

---

## Which tools work through the API

`executeTool` sends JSON, so tools that take text or numbers work. Call `client.listTools()` for the current list; as of this release:

- **finance:** emi-calculator, gst-calculator, sip-calculator, compound-interest-calculator, loan-amortization-schedule, retirement-calculator, fd-rd-calculator, debt-payoff-calculator, emergency-fund-planner, rent-vs-buy-calculator, salary-estimator, budget-50-30-20-planner, inflation-calculator, net-worth-calculator, mortgage-payoff-calculator, roi-calculator, credit-card-payoff-calculator, savings-goal-calculator, lumpsum-calculator
- **developer:** json-formatter, base64-encoder, hash-generator, url-encoder, color-converter, case-converter, lorem-ipsum, markdown-previewer, regex-tester, diff-checker, css-gradient-generator, svg-optimizer, json-to-csv, jwt-decoder, xml-formatter, uuid-generator, csv-to-json, bcrypt-generator
- **writing:** text-cleaner, readability-checker, data-extractor, slug-generator, list-sorter, word-counter, headline-analyzer, passive-voice-detector, markdown-to-html, social-media-formatter, duplicate-word-finder, text-summarizer, text-humanizer
- **seo:** meta-tag-generator, robots-txt-generator, schema-markup-generator, keyword-density-checker, htaccess-generator, llms-txt-generator, serp-preview-tool, utm-builder
- **utilities:** qr-generator, password-generator, unit-converter

**Not available through the API yet:**

- **Image and PDF tools** (`images` and `pdf` categories) need a file upload, which the REST execute endpoint does not accept. Use them on [labs.zynocode.com](https://labs.zynocode.com), where they run in your browser.
- **text-to-speech** uses the browser's speech engine; there is no audio output from the API.

Each tool's parameter names are the ones its engine reads (for example `emi-calculator` takes `principal`, `rate` and `tenureYears`). Some tools are free and some cost credits; `getTool(slug).creditCost` tells you which.

---

## License

MIT © [Zynocode Labs](https://labs.zynocode.com)
