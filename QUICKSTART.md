# 🚀 Quick Start Guide

Get Aegis Engine running in 2 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Server

```bash
npm run dev
```

You should see:
```
Aegis Engine running on port 3000
Health check: http://localhost:3000/health
```

## Step 3: Test the Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime_seconds": 42
}
```

## Step 3.5: Open the Admin Dashboard

Open your browser and navigate to:

```
http://localhost:3000/admin
```

You should see the Aegis Engine admin dashboard with:
- Service status indicator (green dot)
- System stats
- Test validation form
- Recent validations table

## Step 4: Create a Test Policy Pack

Create a public GitHub repository with this structure:

```
my-policy-pack/
├── aegis.yaml
├── components/
│   └── inventory.json
└── tokens/
    └── tokens.json
```

**aegis.yaml:**
```yaml
id: test-design-system
name: Test Design System
version: 1.0.0
entrypoints:
  components: components/inventory.json
  tokens: tokens/tokens.json
rules:
  enforce_tokens: true
  enforce_allowed_components: true
```

**components/inventory.json:**
```json
{
  "allowed_components": ["Button", "Input", "Card"]
}
```

**tokens/tokens.json:**
```json
{
  "allowed_prefixes": ["--color-", "--theme-"]
}
```

## Step 5: Test Validation

**Option A: Using the Admin Dashboard (Recommended)**

1. Go to `http://localhost:3000/admin`
2. Fill in the Test Validation form:
   - Policy URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
   - Ref: `main`
   - Code: `const App = () => <Button>Click</Button>;`
3. Click "Run Validation"
4. View the results in formatted JSON

**Option B: Using curl**

Replace `YOUR_USERNAME/YOUR_REPO` with your repository:

```bash
curl -X POST http://localhost:3000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "policy_pack": {
      "source": "git",
      "url": "https://github.com/YOUR_USERNAME/YOUR_REPO",
      "ref": "main"
    },
    "artifact": {
      "type": "code",
      "language": "tsx",
      "content": "const App = () => <Button>Click</Button>;"
    }
  }'
```

✅ **Expected: PASS** (Button is in the allowlist)

Now try with violations:

```bash
curl -X POST http://localhost:3000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "policy_pack": {
      "source": "git",
      "url": "https://github.com/YOUR_USERNAME/YOUR_REPO",
      "ref": "main"
    },
    "artifact": {
      "type": "code",
      "language": "tsx",
      "content": "const App = () => <UnknownButton style={{ color: \"#FF0000\" }}>Click</UnknownButton>;"
    }
  }'
```

❌ **Expected: FAIL** with two violations:
1. `UnknownButton` not in allowlist
2. Hardcoded hex color `#FF0000`

## Step 6 (Optional): Test MCP Server

```bash
npm run mcp
```

Send JSON-RPC request via stdin:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run mcp
```

---

## 🎉 You're Ready!

Aegis Engine is now running and ready to validate your UI code!

### Common Issues

**Port 3000 already in use?**
```bash
PORT=3456 npm run dev
```

**Can't fetch policy pack?**
- Ensure the repository is public
- Check the URL format (no trailing .git)
- Verify all required files exist

### Next Steps

- Read the full [README.md](./README.md)
- Check [EXAMPLE_POLICY_PACK.md](./EXAMPLE_POLICY_PACK.md) for policy pack structure
- Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for technical details

