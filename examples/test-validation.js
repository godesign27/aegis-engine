/**
 * Example test script to validate the Aegis Engine locally
 * This demonstrates how to use the validation API
 */

// Sample code with violations
const sampleCodeWithViolations = `
import React from 'react';

export const MyComponent = () => {
  return (
    <div>
      <UnauthorizedButton 
        style={{ backgroundColor: '#FF0000', color: '#FFFFFF' }}
      >
        Click Me
      </UnauthorizedButton>
      <CustomCard>
        <Text style={{ fontSize: '16px', color: '#333333' }}>
          Hello World
        </Text>
      </CustomCard>
    </div>
  );
};
`.trim();

// Sample code that passes
const sampleCodePassing = `
import React from 'react';

export const MyComponent = () => {
  return (
    <Container>
      <Button className="primary">
        Click Me
      </Button>
      <Card>
        <Text>Hello World</Text>
      </Card>
    </Container>
  );
};
`.trim();

/**
 * Example validation request
 * 
 * To use this:
 * 1. Start the server: npm run dev
 * 2. Create a policy pack repository (see EXAMPLE_POLICY_PACK.md)
 * 3. Update the URL below with your repo
 * 4. Run this with: node dist/examples/test-validation.js
 */
const exampleRequest = {
  policy_pack: {
    source: 'git',
    url: 'https://github.com/YOUR_USERNAME/YOUR_POLICY_PACK_REPO',
    ref: 'main',
  },
  artifact: {
    type: 'code',
    language: 'tsx',
    content: sampleCodeWithViolations,
    path: 'src/components/MyComponent.tsx',
  },
};

console.log('Example validation request:');
console.log(JSON.stringify(exampleRequest, null, 2));

console.log('\n===========================================');
console.log('To test this, run:');
console.log('===========================================\n');
console.log('curl -X POST http://localhost:3000/validate \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'', JSON.stringify(exampleRequest, null, 2), '\'');

