/**
 * Core type definitions for Aegis Engine
 */

// ============ Policy Pack Types ============

export interface PolicyPackSource {
  source: 'git';
  url: string;
  ref: string; // branch, tag, or commit SHA
}

export interface PolicyPackConfig {
  id: string;
  name: string;
  version: string;
  entrypoints: {
    components?: string;
    tokens?: string;
    rules?: string;
  };
  rules: {
    enforce_tokens: boolean;
    enforce_allowed_components: boolean;
  };
}

export interface ComponentInventory {
  allowed_components: string[];
}

export interface TokensConfig {
  allowed_prefixes?: string[];
  tokens?: Record<string, any>;
}

export interface PolicyPack {
  source: PolicyPackSource;
  config: PolicyPackConfig;
  components?: ComponentInventory;
  tokens?: TokensConfig;
  fetchedAt: number;
}

// ============ Validation Request Types ============

export interface Artifact {
  type: 'code';
  language: 'tsx' | 'jsx' | 'ts' | 'js';
  content: string;
  path?: string;
}

export interface ValidationTarget {
  name?: string;
  type?: string;
}

export interface ValidationRequest {
  policy_pack: PolicyPackSource;
  target?: ValidationTarget;
  artifact: Artifact;
}

// ============ Validation Result Types ============

export type ViolationSeverity = 'ERROR' | 'WARNING';
export type ValidationStatus = 'PASS' | 'FAIL' | 'WARN';

export interface Violation {
  rule_id: string;
  severity: ViolationSeverity;
  message: string;
  line?: number;
  column?: number;
  context?: string;
}

export interface ValidationResult {
  status: ValidationStatus;
  violations: Violation[];
  warnings: Violation[];
  policy_pack: {
    id: string;
    name: string;
    version: string;
    url: string;
    ref: string;
  };
  summary: {
    total_violations: number;
    total_warnings: number;
    rules_checked: string[];
  };
  artifact?: {
    type: string;
    language: string;
    path?: string;
  };
}

// ============ MCP Types ============

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

