# Example Policy Pack for Testing

This is a sample policy pack structure that you can use to test Aegis Engine.

## Repository Structure

Create a git repository with this structure:

```
my-design-system-policies/
├── aegis.yaml
├── components/
│   └── inventory.json
├── tokens/
│   └── tokens.json
└── rules/
    └── governance.md
```

## aegis.yaml

```yaml
id: test-design-system
name: Test Design System
version: 1.0.0
entrypoints:
  components: components/inventory.json
  tokens: tokens/tokens.json
  rules: rules/governance.md
rules:
  enforce_tokens: true
  enforce_allowed_components: true
```

## components/inventory.json

```json
{
  "allowed_components": [
    "Button",
    "Input",
    "Card",
    "Modal",
    "Header",
    "Footer",
    "Container",
    "Text"
  ]
}
```

## tokens/tokens.json

```json
{
  "allowed_prefixes": ["--color-", "--theme-", "--spacing-", "--size-"]
}
```

## rules/governance.md

```markdown
# Design System Governance Rules

## Component Usage
Only use approved components from the allowlist.

## Token Usage
Use CSS variables instead of hardcoded values.
```

## Testing Locally

Once you've pushed this to a public git repository (e.g., GitHub), you can test with:

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
      "content": "const App = () => <UnknownComponent style={{ color: \"#FF0000\" }}>Test</UnknownComponent>;",
      "path": "test.tsx"
    }
  }'
```

This should return violations for both the unknown component and the hardcoded color.

