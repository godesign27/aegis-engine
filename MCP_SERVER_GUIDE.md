# 🔌 Aegis MCP Server - Usage Guide

## What is the MCP Server?

The MCP (Model Context Protocol) server allows AI assistants and other tools to access Aegis Engine's validation capabilities through a standardized JSON-RPC 2.0 interface over stdin/stdout.

## How It Works

The MCP server is **stdio-based**, which means:
- It reads JSON-RPC requests from **stdin**
- It writes JSON-RPC responses to **stdout**
- It logs diagnostic messages to **stderr**

This design allows it to be easily integrated with AI assistants like Claude, Cursor, and other MCP-compatible tools.

## Starting the MCP Server

### For Interactive Use (Testing)

```bash
npm run mcp
```

The server will start and wait for JSON-RPC requests on stdin.

### For AI Assistant Integration

The MCP server is designed to be launched by AI assistant tools. They will:
1. Start the process: `npm run mcp`
2. Send JSON-RPC requests via stdin
3. Read JSON-RPC responses from stdout

## Available Tools

The MCP server exposes 3 tools:

### 1. `list_policy_packs`

Lists all cached policy packs.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_policy_packs",
    "arguments": {}
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "policy_packs": [
      {
        "url": "https://github.com/godesign27/aegis-policy-pack-IG5",
        "ref": "main",
        "id": "ig5-design-system-v1",
        "name": "IG5 Design System",
        "version": "1.0.0",
        "fetchedAt": 1703520000000
      }
    ],
    "count": 1
  }
}
```

### 2. `get_policy_pack`

Gets details of a specific policy pack.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_policy_pack",
    "arguments": {
      "url": "https://github.com/godesign27/aegis-policy-pack-IG5",
      "ref": "main"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "id": "ig5-design-system-v1",
    "name": "IG5 Design System",
    "version": "1.0.0",
    "url": "https://github.com/godesign27/aegis-policy-pack-IG5",
    "ref": "main",
    "rules": {
      "enforce_tokens": true,
      "enforce_allowed_components": true
    },
    "allowed_components": ["Button", "Input", "Card", ...],
    "token_config": { "allowed_prefixes": [...] },
    "fetched_at": "2025-12-25T18:00:00.000Z"
  }
}
```

### 3. `validate_artifact`

Validates code against a policy pack.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "validate_artifact",
    "arguments": {
      "policy_pack": {
        "source": "git",
        "url": "https://github.com/godesign27/aegis-policy-pack-IG5",
        "ref": "main"
      },
      "artifact": {
        "type": "code",
        "language": "tsx",
        "content": "const App = () => <Button>Click Me</Button>;"
      }
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "status": "PASS",
    "violations": [],
    "warnings": [],
    "policy_pack": {
      "id": "ig5-design-system-v1",
      "name": "IG5 Design System",
      "version": "1.0.0",
      "url": "https://github.com/godesign27/aegis-policy-pack-IG5",
      "ref": "main"
    },
    "summary": {
      "total_violations": 0,
      "total_warnings": 0,
      "rules_checked": ["components.allowlist", "tokens.enforcement"]
    }
  }
}
```

## Testing the MCP Server

### Method 1: Command Line (echo + pipe)

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run mcp
```

### Method 2: Using the Test Script

```bash
bash test-mcp-server.sh
```

This script tests all three tools with example data.

### Method 3: Interactive (for debugging)

```bash
npm run mcp
# Then type JSON-RPC requests (one per line)
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
# Press Enter to send
```

## Integration with AI Assistants

### Cursor Integration

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "aegis": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/path/to/aegis-engine"
    }
  }
}
```

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "aegis-engine": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/Users/you/aegis-engine"
    }
  }
}
```

### Custom Integration

Any tool that supports MCP can integrate:

```javascript
const { spawn } = require('child_process');

// Start MCP server
const mcpServer = spawn('npm', ['run', 'mcp'], {
  cwd: '/path/to/aegis-engine',
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'validate_artifact',
    arguments: { /* ... */ }
  }
};

mcpServer.stdin.write(JSON.stringify(request) + '\n');

// Read response
mcpServer.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log(response.result);
});
```

## Error Handling

### Error Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": "Detailed error message"
  }
}
```

### Error Codes

- `-32700` - Parse error (invalid JSON)
- `-32600` - Invalid Request (malformed JSON-RPC)
- `-32601` - Method not found
- `-32602` - Invalid params
- `-32603` - Internal error (tool execution failed)

## Logging

The MCP server logs to stderr:

```bash
npm run mcp 2> mcp-server.log  # Save logs to file
```

Log messages include:
- Server startup confirmation
- Tool execution attempts
- Errors and warnings

## Performance Notes

- **First validation** with a policy pack will fetch from GitHub (slower)
- **Subsequent validations** use cached policy packs (fast)
- Policy packs are cached in memory with TTL
- Multiple requests can reuse the same cached policy pack

## Comparison: MCP vs REST API

### MCP Server (stdio)
✅ Designed for AI assistants  
✅ Stateful (keeps cache)  
✅ Low overhead  
✅ Direct integration  
❌ Not accessible via HTTP  

### REST API (HTTP)
✅ Accessible via HTTP  
✅ Standard curl/fetch  
✅ Admin dashboard  
✅ Browser-based testing  
❌ Requires network connection  

**Use both!** The MCP server and REST API share the same validation logic and cache.

## Example Use Cases

### 1. AI Assistant Code Review

AI assistant validates code during review:
```
User: "Check if this component follows our design system"
AI: Uses validate_artifact tool
AI: "Found 2 violations: CustomButton not in allowlist, hardcoded color #FF0000"
```

### 2. Real-time IDE Integration

IDE plugin validates on save:
- User saves file
- Plugin sends to MCP server
- Shows inline errors for violations

### 3. CI/CD Pipeline

Build script validates before deployment:
```bash
echo "$VALIDATION_REQUEST" | npm run mcp | jq '.result.status'
```

## Troubleshooting

### Server immediately exits

This is **normal**! The MCP server waits for stdin input. It will exit when:
- stdin is closed (no input source)
- It receives EOF

### No response

Check that:
1. Request is valid JSON-RPC 2.0
2. Request ends with newline (`\n`)
3. Reading from stdout (not stderr)

### Validation fails

Check:
1. Policy pack URL is accessible
2. Policy pack has valid structure
3. Network connection is available

---

**The MCP server is running and ready for AI assistant integration!** 🚀

Test it now:
```bash
bash test-mcp-server.sh
```

