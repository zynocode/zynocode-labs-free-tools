# zynocode

Official command-line interface for the Zynocode Labs Developer Platform. Execute developer, calculator, and text utilities from your terminal, run diagnostics, and expose local Model Context Protocol (MCP) servers for AI assistants (Cursor, Claude Desktop, VS Code).

- **Documentation**: [labs.zynocode.com/developers/cli](https://labs.zynocode.com/developers/cli)
- **Source Code**: [github.com/zynocode/zynocode-labs-free-tools/tree/main/packages/cli](https://github.com/zynocode/zynocode-labs-free-tools/tree/main/packages/cli)
- **npm Package**: [zynocode](https://www.npmjs.com/package/zynocode)

## Installation

```bash
npm install -g zynocode
```

Or run directly without installing via `npx`:

```bash
npx zynocode --help
```

## Prerequisites

- Node.js >= 18.0.0

## Quick Start

### 1. Authenticate

Get your API key from the [Zynocode Labs Developer Portal](https://labs.zynocode.com/developers/api-reference):

```bash
zynocode login zyno_ak_your_api_key_here
```

Stored securely in `~/.zynocode/config.json`.

### 2. Verify Connectivity

```bash
zynocode doctor
```

Output:
```text
  Zynocode Doctor

  ✓ API key configured
  ✓ API URL: https://labs.zynocode.com
  ✓ API reachable — 77 tools available
  ✓ Node.js v20.x.x

  All checks passed ✓
```

### 3. List and Search Tools

```bash
# List all available tools grouped by category
zynocode tools

# Filter tools by category
zynocode tools --category=developer

# Search tools by keyword or tag
zynocode search json
```

### 4. Execute a Tool

Run tools directly with `--param`:

```bash
zynocode run json-formatter --param jsonText='{"name":"Zynocode","active":true}' --param indent=2
```

Pass structured inputs or stream responses where supported:

```bash
zynocode run base64-encoder --param text="Hello World" --param mode="encode"
```

### 5. Model Context Protocol (MCP) Server

Start a stdio MCP server for AI IDEs and desktop clients:

```bash
zynocode mcp-serve
```

#### Claude Desktop Configuration (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "zynocode": {
      "command": "npx",
      "args": ["-y", "zynocode", "mcp-serve"],
      "env": {
        "ZYNOCODE_API_KEY": "zyno_ak_your_key_here"
      }
    }
  }
}
```

#### Cursor Configuration (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "zynocode": {
      "command": "npx",
      "args": ["-y", "zynocode", "mcp-serve"],
      "env": {
        "ZYNOCODE_API_KEY": "zyno_ak_your_key_here"
      }
    }
  }
}
```

## CLI Commands

| Command | Description |
|---|---|
| `zynocode login <api-key>` | Authenticate and persist API key to local config |
| `zynocode logout` | Clear saved credentials |
| `zynocode tools [--category=X] [--json]` | List all registered tools in the platform catalog |
| `zynocode search <query>` | Search tools by name, description, slug, or tag |
| `zynocode run <slug> [--param key=value]` | Execute a tool via the REST API |
| `zynocode config [list\|get\|set]` | Inspect or modify CLI configuration |
| `zynocode doctor` | Verify connectivity, API key validity, and Node.js version |
| `zynocode version` | Display the installed CLI version |
| `zynocode mcp-serve` | Run stdio JSON-RPC 2.0 MCP server for AI agents |

## Configuration & Environment Variables

- `ZYNOCODE_API_URL`: Override the target API endpoint (default: `https://labs.zynocode.com`).
- `ZYNOCODE_API_KEY`: Fallback API key used if not logged in via `login`.
- Config file location: `~/.zynocode/config.json`.

## License

MIT © [Zynocode Labs](https://labs.zynocode.com)
