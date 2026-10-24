#!/usr/bin/env node

/**
 * Zynocode CLI
 * Official command-line tool for Zynocode Labs.
 *
 * Commands:
 *   login <api-key>    Save API key
 *   logout             Clear saved credentials
 *   tools              List all available tools
 *   search <query>     Search tools by name/tag
 *   run <slug>         Execute a tool
 *   config             Manage CLI configuration
 *   doctor             Check connectivity & auth
 *   version            Show CLI version
 *   mcp-serve          Start stdio MCP server (for IDEs)
 */

import { loginCommand } from "./commands/login.js";
import { toolsCommand } from "./commands/tools.js";
import { runCommand } from "./commands/run.js";
import { searchCommand } from "./commands/search.js";
import { configCommand } from "./commands/config.js";
import { doctorCommand } from "./commands/doctor.js";
import { versionCommand } from "./commands/version.js";
import { mcpServeCommand } from "./commands/mcp-serve.js";
import { clearConfig } from "./config-store.js";

const HELP = `
  zynocode — AI Agent Platform CLI

  Commands:
    login <api-key>         Save API key
    logout                  Clear credentials
    tools [--category=X]    List all tools
    search <query>          Search tools
    run <slug> [--param]    Execute a tool
    config [list|get|set]   Manage config
    doctor                  Check connectivity
    version                 Show version
    mcp-serve               Start MCP server (stdio)

  Examples:
    zynocode login zyno_ak_abc123...
    zynocode tools --category=developer
    zynocode run json-formatter --param jsonText='{"a":1}'
    zynocode search pdf
    zynocode mcp-serve

  Docs: https://labs.zynocode.com/docs/agents
`;

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }

  switch (command) {
    case "login":
      await loginCommand(args);
      break;

    case "logout":
      clearConfig();
      console.log("\n  ✓ Credentials cleared.\n");
      break;

    case "tools":
      await toolsCommand(args);
      break;

    case "search":
      await searchCommand(args);
      break;

    case "run":
      await runCommand(args);
      break;

    case "config":
      await configCommand(args);
      break;

    case "doctor":
      await doctorCommand();
      break;

    case "version":
    case "--version":
    case "-v":
      await versionCommand();
      break;

    case "mcp-serve":
      await mcpServeCommand();
      break;

    default:
      console.error(`\n  Unknown command: ${command}\n`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n  Fatal error: ${err.message}\n`);
  process.exit(1);
});
