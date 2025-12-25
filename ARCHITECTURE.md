# Aegis Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AEGIS ENGINE                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐                        ┌──────────────────┐
│   REST Client    │                        │   MCP Client     │
│   (curl, apps)   │                        │  (AI Assistant)  │
└────────┬─────────┘                        └────────┬─────────┘
         │ HTTP/JSON                                 │ JSON-RPC 2.0
         │                                          │ (stdin/stdout)
         ▼                                          ▼
┌─────────────────────────────────┐   ┌──────────────────────────┐
│      Express REST API           │   │     MCP Server           │
│  ┌──────────────────────────┐   │   │  ┌──────────────────┐    │
│  │ POST /validate           │   │   │  │ tools/list       │    │
│  │ GET  /health             │   │   │  │ tools/call       │    │
│  └──────────────────────────┘   │   │  └──────────────────┘    │
└────────────┬────────────────────┘   └───────────┬──────────────┘
             │                                     │
             └──────────────┬──────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │   Validation Handler         │
            │  (api/validate.ts)           │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │   Policy Registry            │
            │  (In-Memory Cache)           │
            │  - TTL-based expiration      │
            │  - Key: {url}:{ref}          │
            └──────────────┬───────────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
         ┌────────────────┐  ┌──────────────┐
         │ Policy Fetcher │  │ Cache Hit?   │
         │ - HTTPS GET    │  │ Return cache │
         │ - GitHub/GitLab│  └──────────────┘
         └────────┬───────┘
                  │
                  ▼
         ┌─────────────────────────┐
         │   Git Repository        │
         │   (Policy Pack)         │
         │  ┌───────────────────┐  │
         │  │ aegis.yaml        │  │
         │  │ components/...    │  │
         │  │ tokens/...        │  │
         │  └───────────────────┘  │
         └──────────┬──────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │   Policy Parser         │
         │  - YAML parsing         │
         │  - JSON parsing         │
         │  - Validation           │
         └──────────┬──────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │   UI Code Validator     │
         │  (Orchestrator)         │
         └──────────┬──────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────────┐   ┌──────────────────┐
│ Component         │   │ Token            │
│ Validator         │   │ Validator        │
│ - Regex JSX tags  │   │ - Regex hex      │
│ - Allowlist check │   │ - CSS var rec.   │
└─────────┬─────────┘   └─────────┬────────┘
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │  Validation Result  │
            │  - Status           │
            │  - Violations       │
            │  - Warnings         │
            │  - Summary          │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  JSON Response      │
            │  (Client)           │
            └─────────────────────┘

═══════════════════════════════════════════════════════════════

DATA FLOW EXAMPLE:

1. Client sends validation request
   └─> policy_pack: {url, ref}
   └─> artifact: {code, language}

2. Policy Registry checks cache
   └─> Cache hit? Return cached policy
   └─> Cache miss? Fetch from git

3. Policy Fetcher downloads files
   └─> aegis.yaml (required)
   └─> components/inventory.json (optional)
   └─> tokens/tokens.json (optional)

4. Policy Parser validates structure
   └─> Parse YAML config
   └─> Parse JSON inventories
   └─> Create PolicyPack object

5. UI Code Validator orchestrates
   └─> Run Component Validator
   └─> Run Token Validator
   └─> Merge results

6. Validators analyze code
   └─> Component: Extract JSX tags, check allowlist
   └─> Token: Find hex colors, check enforcement

7. Return ValidationResult
   └─> Status: PASS/FAIL/WARN
   └─> Violations with line numbers
   └─> Summary statistics

═══════════════════════════════════════════════════════════════

KEY DESIGN PATTERNS:

1. Registry Pattern - Central policy pack management
2. Strategy Pattern - Pluggable validators
3. Cache-Aside Pattern - In-memory caching with TTL
4. Repository Pattern - Policy fetching abstraction
5. Facade Pattern - UI Code Validator as orchestrator

═══════════════════════════════════════════════════════════════

EXTENSION POINTS:

• Add new validators in src/validators/
• Support new git providers in src/policy/fetch.ts
• Add new MCP tools in src/mcp/tools.ts
• Extend PolicyPackConfig in src/types.ts
```

