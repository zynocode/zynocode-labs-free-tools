/**
 * Smoke test for @zynocode/sdk
 * Tests ESM and CJS imports, client initialization, public endpoint query,
 * and typed error handling against https://labs.zynocode.com.
 */

import assert from "node:assert";
import { createRequire } from "node:module";
import { ZynocodeClient, ZynocodeError, ZynocodeApiError } from "../dist/index.mjs";

const require = createRequire(import.meta.url);
const cjs = require("../dist/index.js");

console.log("=== @zynocode/sdk Smoke Test ===");

// 1. Verify Exports
assert(typeof ZynocodeClient === "function", "ESM ZynocodeClient export missing");
assert(typeof ZynocodeError === "function", "ESM ZynocodeError export missing");
assert(typeof ZynocodeApiError === "function", "ESM ZynocodeApiError export missing");

assert(typeof cjs.ZynocodeClient === "function", "CJS ZynocodeClient export missing");
assert(typeof cjs.ZynocodeError === "function", "CJS ZynocodeError export missing");
assert(typeof cjs.ZynocodeApiError === "function", "CJS ZynocodeApiError export missing");
console.log("✓ ESM and CJS exports verified");

// 2. Client Initialization & Default Base URL
const client = new ZynocodeClient();
assert.strictEqual(client["baseUrl"], "https://labs.zynocode.com", "Default baseUrl must be https://labs.zynocode.com");
console.log("✓ Default baseUrl verified:", client["baseUrl"]);

// 3. Test listTools() on Live Public Endpoint
console.log("Fetching live tools list from https://labs.zynocode.com/api/v2/tools...");
const listResult = await client.listTools();
assert.strictEqual(listResult.success, true, "listTools response success must be true");
assert(Array.isArray(listResult.tools), "listTools tools must be an array");
assert(listResult.tools.length > 0, "listTools tools array must not be empty");
assert.strictEqual(listResult.count, listResult.tools.length, "listTools count must match tools array length");
console.log(`✓ listTools() returned ${listResult.count} live tools`);

// 4. Test getTool() for single tool metadata
const sampleSlug = listResult.tools[0].slug;
console.log(`Fetching tool metadata for slug '${sampleSlug}'...`);
const toolDetail = await client.getTool(sampleSlug);
assert.strictEqual(toolDetail.slug, sampleSlug, `Tool slug must match requested '${sampleSlug}'`);
assert(typeof toolDetail.name === "string" && toolDetail.name.length > 0, "Tool must have a name");
assert(typeof toolDetail.category === "string" && toolDetail.category.length > 0, "Tool must have a category");
console.log(`✓ getTool('${sampleSlug}') verified: "${toolDetail.name}" [${toolDetail.category}]`);

// 5. Test Typed Error Handling (Unauthenticated Tool Execution)
console.log("Testing unauthenticated executeTool() error handling...");
try {
  await client.executeTool(sampleSlug, { amount: 100000 });
  assert.fail("executeTool should have thrown an unauthorized error");
} catch (err) {
  assert(err instanceof ZynocodeError, "Error must be instance of ZynocodeError");
  assert(err instanceof ZynocodeApiError, "Error must be instance of ZynocodeApiError");
  assert.strictEqual(err.status, 401, `HTTP status must be 401, got ${err.status}`);
  assert.strictEqual(err.code, "UNAUTHORIZED", `Error code must be UNAUTHORIZED, got ${err.code}`);
  console.log(`✓ ZynocodeApiError caught correctly: status=${err.status}, code=${err.code}, message="${err.message}"`);
}

// 6. CJS Client Instance Verification
const cjsClient = new cjs.ZynocodeClient();
assert.strictEqual(cjsClient["baseUrl"], "https://labs.zynocode.com", "CJS client default baseUrl must be https://labs.zynocode.com");
console.log("✓ CJS client initialization verified");

console.log("\n=== ALL SMOKE TESTS PASSED SUCCESSFULLY ===");
