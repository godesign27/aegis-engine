#!/bin/bash
# Test the IG5 policy pack with Aegis Engine

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       Testing IG5 Policy Pack with Aegis Engine           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

POLICY_URL="https://github.com/godesign27/aegis-policy-pack-IG5"

echo "📦 Policy Pack: $POLICY_URL"
echo "🔗 Aegis Engine: http://localhost:3001"
echo ""

# Test 1: Valid Button component
echo "🧪 Test 1: Valid Component (Button)"
echo "Expected: PASS ✅"
echo ""

curl -s -X POST http://localhost:3001/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"policy_pack\": {
      \"source\": \"git\",
      \"url\": \"$POLICY_URL\",
      \"ref\": \"main\"
    },
    \"artifact\": {
      \"type\": \"code\",
      \"language\": \"tsx\",
      \"content\": \"const App = () => <Button variant='primary'>Click Me</Button>;\",
      \"path\": \"src/components/App.tsx\"
    }
  }" | jq '.status, .summary'

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Test 2: Invalid component
echo "🧪 Test 2: Invalid Component (CustomButton)"
echo "Expected: FAIL ❌"
echo ""

curl -s -X POST http://localhost:3001/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"policy_pack\": {
      \"source\": \"git\",
      \"url\": \"$POLICY_URL\",
      \"ref\": \"main\"
    },
    \"artifact\": {
      \"type\": \"code\",
      \"language\": \"tsx\",
      \"content\": \"const App = () => <CustomButton>Not Allowed</CustomButton>;\",
      \"path\": \"src/components/App.tsx\"
    }
  }" | jq '.status, .violations[0].message'

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Test 3: Hardcoded color
echo "🧪 Test 3: Hardcoded Hex Color"
echo "Expected: FAIL ❌"
echo ""

curl -s -X POST http://localhost:3001/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"policy_pack\": {
      \"source\": \"git\",
      \"url\": \"$POLICY_URL\",
      \"ref\": \"main\"
    },
    \"artifact\": {
      \"type\": \"code\",
      \"language\": \"tsx\",
      \"content\": \"const App = () => <Button style={{ color: '#FF0000' }}>Red</Button>;\",
      \"path\": \"src/components/App.tsx\"
    }
  }" | jq '.status, .violations[0].message'

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Test 4: Valid with tokens
echo "🧪 Test 4: Valid Component with Design Tokens"
echo "Expected: PASS ✅"
echo ""

curl -s -X POST http://localhost:3001/validate \
  -H "Content-Type: application/json" \
  -d "{
    \"policy_pack\": {
      \"source\": \"git\",
      \"url\": \"$POLICY_URL\",
      \"ref\": \"main\"
    },
    \"artifact\": {
      \"type\": \"code\",
      \"language\": \"tsx\",
      \"content\": \"const App = () => <Card style={{ padding: 'var(--spacing-lg)', color: 'var(--color-primary)' }}><Text>Hello IG5</Text></Card>;\",
      \"path\": \"src/components/App.tsx\"
    }
  }" | jq '.status, .summary'

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ IG5 Policy Pack Testing Complete!"
echo ""
echo "📊 View results in admin dashboard:"
echo "   http://localhost:3001/admin"
echo ""
echo "🔗 Policy Pack Repository:"
echo "   https://github.com/godesign27/aegis-policy-pack-IG5"
echo ""

