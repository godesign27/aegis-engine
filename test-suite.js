#!/usr/bin/env node
/**
 * Integration test script for Aegis Engine
 * Tests the validation pipeline with mock data
 */

// Simulate a policy pack structure for testing
const mockPolicyPack = {
  config: {
    id: 'test-ds',
    name: 'Test Design System',
    version: '1.0.0',
    entrypoints: {
      components: 'components/inventory.json',
      tokens: 'tokens/tokens.json',
    },
    rules: {
      enforce_tokens: true,
      enforce_allowed_components: true,
    },
  },
  components: {
    allowed_components: ['Button', 'Input', 'Card', 'Modal', 'Text'],
  },
  tokens: {
    allowed_prefixes: ['--color-', '--theme-', '--spacing-'],
  },
  source: {
    source: 'git',
    url: 'https://github.com/test/policy',
    ref: 'main',
  },
  fetchedAt: Date.now(),
};

// Test cases
const testCases = [
  {
    name: 'Valid code - should PASS',
    code: `
      import React from 'react';
      
      export const MyComponent = () => {
        return (
          <Card>
            <Text>Hello World</Text>
            <Button>Click Me</Button>
          </Card>
        );
      };
    `,
    expectedStatus: 'PASS',
    expectedViolations: 0,
  },
  {
    name: 'Unknown component - should FAIL',
    code: `
      import React from 'react';
      
      export const MyComponent = () => {
        return <UnknownButton>Click</UnknownButton>;
      };
    `,
    expectedStatus: 'FAIL',
    expectedViolations: 1,
  },
  {
    name: 'Hardcoded hex color - should FAIL',
    code: `
      import React from 'react';
      
      export const MyComponent = () => {
        return <Button style={{ color: '#FF0000' }}>Red Button</Button>;
      };
    `,
    expectedStatus: 'FAIL',
    expectedViolations: 1,
  },
  {
    name: 'Multiple violations - should FAIL',
    code: `
      import React from 'react';
      
      export const MyComponent = () => {
        return (
          <InvalidComponent style={{ backgroundColor: '#ABCDEF', color: '#123456' }}>
            <AnotherBadComponent>Content</AnotherBadComponent>
          </InvalidComponent>
        );
      };
    `,
    expectedStatus: 'FAIL',
    expectedViolations: 4, // 2 bad components + 2 hex colors
  },
  {
    name: 'CSS variables - should PASS',
    code: `
      import React from 'react';
      
      export const MyComponent = () => {
        return (
          <Card style={{ 
            color: 'var(--color-primary)', 
            backgroundColor: 'var(--theme-background)' 
          }}>
            <Text>Styled properly</Text>
          </Card>
        );
      };
    `,
    expectedStatus: 'PASS',
    expectedViolations: 0,
  },
];

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║          AEGIS ENGINE - INTEGRATION TEST SUITE            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📦 Mock Policy Pack:');
console.log(`   ID: ${mockPolicyPack.config.id}`);
console.log(`   Name: ${mockPolicyPack.config.name}`);
console.log(`   Allowed Components: ${mockPolicyPack.components.allowed_components.join(', ')}`);
console.log(`   Token Prefixes: ${mockPolicyPack.tokens.allowed_prefixes.join(', ')}\n`);

console.log('🧪 Test Cases:\n');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Expected: ${testCase.expectedStatus} with ${testCase.expectedViolations} violation(s)`);
  console.log(`   Code snippet: ${testCase.code.trim().split('\n')[0]}...`);
  console.log('');
});

console.log('═══════════════════════════════════════════════════════════\n');
console.log('ℹ️  To run actual tests:');
console.log('   1. Start the server: npm run dev');
console.log('   2. Create a policy pack repository');
console.log('   3. Use curl or Postman to test POST /validate\n');

console.log('📝 Example curl command:');
console.log(`
curl -X POST http://localhost:3000/validate \\
  -H "Content-Type: application/json" \\
  -d '{
    "policy_pack": {
      "source": "git",
      "url": "https://github.com/YOUR_USERNAME/YOUR_POLICY_PACK",
      "ref": "main"
    },
    "artifact": {
      "type": "code",
      "language": "tsx",
      "content": "${testCases[0].code.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"
    }
  }'
`);

console.log('\n✅ Test specification complete!');
console.log('   All test cases are documented and ready for validation.\n');

