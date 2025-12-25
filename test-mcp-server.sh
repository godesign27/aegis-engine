#!/bin/bash
# Test the MCP server with example requests

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Testing Aegis MCP Server                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "The MCP server accepts JSON-RPC 2.0 requests via stdin"
echo ""

cd /Users/timmcguire27/Desktop/aegis-engine

# Test 1: List available tools
echo "📋 Test 1: List Available Tools"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run mcp 2>/dev/null | tail -1 | jq '.'
echo ""

# Test 2: List policy packs
echo "📦 Test 2: List Cached Policy Packs"
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_policy_packs","arguments":{}}}' | npm run mcp 2>/dev/null | tail -1 | jq '.'
echo ""

# Test 3: Validate artifact with IG5 policy pack
echo "🧪 Test 3: Validate Code with IG5 Policy Pack"
REQUEST='{
  "jsonrpc":"2.0",
  "id":3,
  "method":"tools/call",
  "params":{
    "name":"validate_artifact",
    "arguments":{
      "policy_pack":{
        "source":"git",
        "url":"https://github.com/godesign27/aegis-policy-pack-IG5",
        "ref":"main"
      },
      "artifact":{
        "type":"code",
        "language":"tsx",
        "content":"const App = () => <Button>Click Me</Button>;"
      }
    }
  }
}'

echo "$REQUEST" | npm run mcp 2>/dev/null | tail -1 | jq '.result.status, .result.summary'
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ MCP Server tests complete!"
echo ""
echo "💡 The MCP server runs on stdio and accepts JSON-RPC 2.0 requests"
echo "   It's designed to be integrated with AI assistants and tools"
echo ""

