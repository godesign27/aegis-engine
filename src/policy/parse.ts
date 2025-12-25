/**
 * Policy pack parsing - convert fetched files into PolicyPack structure
 */
import * as yaml from 'js-yaml';
import {
  PolicyPack,
  PolicyPackSource,
  PolicyPackConfig,
  ComponentInventory,
  TokensConfig,
} from '../types';
import { FetchedFiles } from './fetch';

/**
 * Parse fetched policy pack files into a structured PolicyPack object
 */
export function parsePolicyPack(
  source: PolicyPackSource,
  files: FetchedFiles
): PolicyPack {
  // Parse aegis.yaml (required)
  const config = parseAegisConfig(files['aegis.yaml']);
  
  // Parse optional files
  let components: ComponentInventory | undefined;
  let tokens: TokensConfig | undefined;
  
  if (config.entrypoints.components && files[config.entrypoints.components]) {
    try {
      components = JSON.parse(files[config.entrypoints.components]) as ComponentInventory;
    } catch (error) {
      console.warn('Failed to parse components file:', error);
    }
  }
  
  if (config.entrypoints.tokens && files[config.entrypoints.tokens]) {
    try {
      tokens = JSON.parse(files[config.entrypoints.tokens]) as TokensConfig;
    } catch (error) {
      console.warn('Failed to parse tokens file:', error);
    }
  }
  
  return {
    source,
    config,
    components,
    tokens,
    fetchedAt: Date.now(),
  };
}

/**
 * Parse and validate aegis.yaml configuration
 */
function parseAegisConfig(yamlContent: string): PolicyPackConfig {
  let parsed: any;
  
  try {
    parsed = yaml.load(yamlContent);
  } catch (error) {
    throw new Error(`Invalid YAML in aegis.yaml: ${(error as Error).message}`);
  }
  
  // Validate required fields
  if (!parsed.id || typeof parsed.id !== 'string') {
    throw new Error('aegis.yaml must contain a string "id" field');
  }
  
  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('aegis.yaml must contain a string "name" field');
  }
  
  if (!parsed.version || typeof parsed.version !== 'string') {
    throw new Error('aegis.yaml must contain a string "version" field');
  }
  
  // Set defaults for optional fields
  const config: PolicyPackConfig = {
    id: parsed.id,
    name: parsed.name,
    version: parsed.version,
    entrypoints: {
      components: parsed.entrypoints?.components || 'components/inventory.json',
      tokens: parsed.entrypoints?.tokens || 'tokens/tokens.json',
      rules: parsed.entrypoints?.rules || 'rules/governance.md',
    },
    rules: {
      enforce_tokens: parsed.rules?.enforce_tokens ?? true,
      enforce_allowed_components: parsed.rules?.enforce_allowed_components ?? true,
    },
  };
  
  return config;
}

