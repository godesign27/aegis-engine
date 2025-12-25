/**
 * MCP (Model Context Protocol) tools implementation
 */
import { policyRegistry } from '../policy/registry';
import { validateUICode } from '../validators/uiCodeValidator';
import { PolicyPackSource, Artifact, MCPTool } from '../types';

/**
 * MCP Tool definitions
 */
export const mcpTools: MCPTool[] = [
  {
    name: 'list_policy_packs',
    description: 'List all cached policy packs',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_policy_pack',
    description: 'Get details of a specific policy pack',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Git repository URL of the policy pack',
        },
        ref: {
          type: 'string',
          description: 'Git reference (branch, tag, or commit SHA)',
        },
      },
      required: ['url', 'ref'],
    },
  },
  {
    name: 'validate_artifact',
    description: 'Validate a code artifact against a policy pack',
    inputSchema: {
      type: 'object',
      properties: {
        policy_pack: {
          type: 'object',
          description: 'Policy pack source configuration',
          properties: {
            source: { type: 'string', enum: ['git'] },
            url: { type: 'string' },
            ref: { type: 'string' },
          },
          required: ['source', 'url', 'ref'],
        },
        artifact: {
          type: 'object',
          description: 'Code artifact to validate',
          properties: {
            type: { type: 'string', enum: ['code'] },
            language: { type: 'string', enum: ['tsx', 'jsx', 'ts', 'js'] },
            content: { type: 'string' },
            path: { type: 'string' },
          },
          required: ['type', 'language', 'content'],
        },
      },
      required: ['policy_pack', 'artifact'],
    },
  },
];

/**
 * Execute an MCP tool
 */
export async function executeTool(toolName: string, params: any): Promise<any> {
  switch (toolName) {
    case 'list_policy_packs':
      return listPolicyPacks();
    
    case 'get_policy_pack':
      return getPolicyPack(params);
    
    case 'validate_artifact':
      return validateArtifact(params);
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * list_policy_packs tool implementation
 */
function listPolicyPacks() {
  const packs = policyRegistry.listPolicyPacks();
  return {
    policy_packs: packs,
    count: packs.length,
  };
}

/**
 * get_policy_pack tool implementation
 */
async function getPolicyPack(params: { url: string; ref: string }) {
  const source: PolicyPackSource = {
    source: 'git',
    url: params.url,
    ref: params.ref,
  };
  
  const policyPack = await policyRegistry.getPolicyPack(source);
  
  return {
    id: policyPack.config.id,
    name: policyPack.config.name,
    version: policyPack.config.version,
    url: policyPack.source.url,
    ref: policyPack.source.ref,
    rules: policyPack.config.rules,
    allowed_components: policyPack.components?.allowed_components || [],
    token_config: policyPack.tokens || {},
    fetched_at: new Date(policyPack.fetchedAt).toISOString(),
  };
}

/**
 * validate_artifact tool implementation
 */
async function validateArtifact(params: {
  policy_pack: PolicyPackSource;
  artifact: Artifact;
}) {
  const policyPack = await policyRegistry.getPolicyPack(params.policy_pack);
  const result = validateUICode(params.artifact, policyPack);
  return result;
}

