# Aegis Engine

**AI Design Governance Engine** - An MVP service for validating UI code against design system policies.

## Overview

Aegis is a Node.js + TypeScript service that provides:

1. **REST API** - Validate code artifacts via `POST /validate`
2. **MCP Server** - Expose validation tools for AI assistants via Model Context Protocol
3. **Policy Pack System** - Load design system rules from git repositories
4. **Validators** - Check component usage and token enforcement

## Features

### REST API Endpoints

- **POST /validate** - Validate code artifacts against policy packs
- **GET /health** - Health check with version and uptime
- **GET /status** - Service status, cached policy packs, and validation metrics
- **GET /admin** - Admin dashboard UI for monitoring and testing

### Validators

- **Component Allowlist** - Enforces that only approved components are used in code
- **Token Enforcement** - Flags hardcoded hex colors and recommends CSS variables

### Policy Pack Structure

Policy packs are fetched from git repositories and must contain:

```
aegis.yaml                    # Configuration
components/inventory.json     # Allowed components list
tokens/tokens.json           # Token configuration
rules/governance.md          # Human-readable rules
```

Example `aegis.yaml`:

```yaml
id: my-design-system
name: My Design System
version: 1.0.0
entrypoints:
  components: components/inventory.json
  tokens: tokens/tokens.json
  rules: rules/governance.md
rules:
  enforce_tokens: true
  enforce_allowed_components: true
```

Example `components/inventory.json`:

```json
{
  "allowed_components": ["Button", "Input", "Card", "Modal"]
}
```

Example `tokens/tokens.json`:

```json
{
  "allowed_prefixes": ["--color-", "--theme-", "--spacing-"]
}
```

## Installation

```bash
npm install
```

**Important:** Copy `env.example` to `.env` and configure if needed:

```bash
cp env.example .env
```

If port 3000 is already in use, update the `PORT` value in `.env`.

## Usage

### Running the REST API Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server starts on port 3000 (configurable via `.env`).

### REST API

#### POST /validate

Validate a code artifact against a policy pack.

**Request:**

```json
{
  "policy_pack": {
    "source": "git",
    "url": "https://github.com/your-org/design-system-policies",
    "ref": "main"
  },
  "artifact": {
    "type": "code",
    "language": "tsx",
    "content": "import React from 'react';\n\nexport const MyComponent = () => {\n  return <UnknownButton style={{ color: '#FF0000' }}>Click me</UnknownButton>;\n};",
    "path": "src/components/MyComponent.tsx"
  }
}
```

**Response:**

```json
{
  "status": "FAIL",
  "violations": [
    {
      "rule_id": "components.allowlist",
      "severity": "ERROR",
      "message": "Component \"UnknownButton\" is not in the allowed components list",
      "line": 4,
      "context": "  return <UnknownButton style={{ color: '#FF0000' }}>Click me</UnknownButton>;"
    },
    {
      "rule_id": "tokens.enforcement",
      "severity": "ERROR",
      "message": "Hardcoded hex color \"#FF0000\" found. Use CSS variables with allowed prefixes: --color-, --theme-",
      "line": 4,
      "context": "  return <UnknownButton style={{ color: '#FF0000' }}>Click me</UnknownButton>;"
    }
  ],
  "warnings": [],
  "policy_pack": {
    "id": "my-design-system",
    "name": "My Design System",
    "version": "1.0.0",
    "url": "https://github.com/your-org/design-system-policies",
    "ref": "main"
  },
  "summary": {
    "total_violations": 2,
    "total_warnings": 0,
    "rules_checked": ["components.allowlist", "tokens.enforcement"]
  },
  "artifact": {
    "type": "code",
    "language": "tsx",
    "path": "src/components/MyComponent.tsx"
  }
}
```

#### GET /health

Health check endpoint with version and uptime information.

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime_seconds": 3600
}
```

#### GET /status

Service status including cached policy packs, validation counters, and recent validations.

```bash
curl http://localhost:3000/status
```

Response:
```json
{
  "cached_policy_packs": [
    {
      "url": "https://github.com/org/policies",
      "ref": "main",
      "id": "my-design-system",
      "name": "My Design System",
      "version": "1.0.0",
      "fetchedAt": 1703520000000
    }
  ],
  "counters": {
    "validations_run": 42,
    "last_validation_at": "2025-12-25T18:00:00.000Z"
  },
  "recent_validations": [
    {
      "timestamp": "2025-12-25T18:00:00.000Z",
      "status": "PASS",
      "policy_pack": {
        "id": "my-design-system",
        "name": "My Design System",
        "url": "https://github.com/org/policies",
        "ref": "main"
      },
      "artifact_path": "src/App.tsx",
      "violation_count": 0,
      "warning_count": 0,
      "rules_checked": ["components.allowlist", "tokens.enforcement"]
    }
  ]
}
```

#### GET /admin

Admin dashboard UI for monitoring and testing the service. Open in your browser:

```
http://localhost:3000/admin
```

The dashboard provides:
- **Service Status**: Real-time health indicator with version and uptime
- **System Stats**: Validation counters and metrics
- **Cached Policy Packs**: List of all loaded policy packs
- **Test Validation**: Interactive form to test validations with custom code
- **Recent Validations**: Table showing the last 10 validations with status and details

Auto-refreshes every 5 seconds to show the latest data.

### Running the MCP Server

The MCP server exposes validation tools via stdin/stdout using JSON-RPC 2.0.

```bash
npm run mcp
```

#### Available Tools

1. **list_policy_packs** - List all cached policy packs
2. **get_policy_pack** - Get details of a specific policy pack
3. **validate_artifact** - Validate code against a policy pack

#### Example MCP Usage

List tools:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

Call validate_artifact:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "validate_artifact",
    "arguments": {
      "policy_pack": {
        "source": "git",
        "url": "https://github.com/your-org/design-system-policies",
        "ref": "main"
      },
      "artifact": {
        "type": "code",
        "language": "tsx",
        "content": "const App = () => <Button>Click</Button>;"
      }
    }
  }
}
```

## Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Available options:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CACHE_TTL_SECONDS` - Policy pack cache duration (default: 3600)

## Architecture

```
src/
├── index.ts                 # REST API server entry point
├── config.ts                # Configuration management
├── types.ts                 # TypeScript type definitions
├── api/
│   ├── routes.ts           # REST API routes
│   └── validate.ts         # Validation request handler
├── policy/
│   ├── fetch.ts            # Fetch policy packs from git
│   ├── parse.ts            # Parse policy pack files
│   └── registry.ts         # In-memory cache for policy packs
├── validators/
│   ├── componentValidator.ts  # Component allowlist validator
│   ├── tokenValidator.ts      # Token enforcement validator
│   └── uiCodeValidator.ts     # Orchestrates all validators
└── mcp/
    ├── server.ts           # MCP JSON-RPC server
    └── tools.ts            # MCP tool implementations
```

## Policy Pack Format

### Required: aegis.yaml

```yaml
id: string               # Unique identifier
name: string            # Display name
version: string         # Semantic version
entrypoints:
  components: string    # Path to components file
  tokens: string        # Path to tokens file
  rules: string         # Path to rules documentation
rules:
  enforce_tokens: boolean
  enforce_allowed_components: boolean
```

### Optional: components/inventory.json

```json
{
  "allowed_components": ["Component1", "Component2"]
}
```

### Optional: tokens/tokens.json

```json
{
  "allowed_prefixes": ["--prefix-"],
  "tokens": {}
}
```

## Caching

Policy packs are cached in memory with a configurable TTL. The cache key is `{url}:{ref}`. To invalidate the cache, restart the server or wait for the TTL to expire.

## Limitations (MVP)

- No authentication for private git repositories (use public repos only)
- No database (in-memory cache only)
- Simple regex-based parsing for JSX components
- Limited to GitHub and GitLab raw file URLs
- No support for local policy packs

## Future Enhancements

- Git authentication for private repositories
- Persistent storage for policy packs
- Advanced AST-based code parsing
- Additional validators (accessibility, performance, etc.)
- Web UI for validation results
- CI/CD integration examples

## License

MIT

