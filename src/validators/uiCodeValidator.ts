/**
 * UI code validator - orchestrates all validators
 */
import { Artifact, PolicyPack, ValidationResult, Violation } from '../types';
import { validateComponents } from './componentValidator';
import { validateTokens } from './tokenValidator';

/**
 * Validate a UI code artifact against a policy pack
 */
export function validateUICode(
  artifact: Artifact,
  policyPack: PolicyPack
): ValidationResult {
  const allViolations: Violation[] = [];
  const rulesChecked: string[] = [];
  
  const { content } = artifact;
  const { config, components, tokens } = policyPack;
  
  // Run component validator
  if (config.rules.enforce_allowed_components) {
    rulesChecked.push('components.allowlist');
    const componentViolations = validateComponents(
      content,
      components,
      config.rules.enforce_allowed_components
    );
    allViolations.push(...componentViolations);
  }
  
  // Run token validator
  if (config.rules.enforce_tokens) {
    rulesChecked.push('tokens.enforcement');
    const tokenViolations = validateTokens(
      content,
      tokens,
      config.rules.enforce_tokens
    );
    allViolations.push(...tokenViolations);
  }
  
  // Separate errors and warnings
  const violations = allViolations.filter((v) => v.severity === 'ERROR');
  const warnings = allViolations.filter((v) => v.severity === 'WARNING');
  
  // Determine overall status
  let status: 'PASS' | 'FAIL' | 'WARN' = 'PASS';
  if (violations.length > 0) {
    status = 'FAIL';
  } else if (warnings.length > 0) {
    status = 'WARN';
  }
  
  return {
    status,
    violations,
    warnings,
    policy_pack: {
      id: config.id,
      name: config.name,
      version: config.version,
      url: policyPack.source.url,
      ref: policyPack.source.ref,
    },
    summary: {
      total_violations: violations.length,
      total_warnings: warnings.length,
      rules_checked: rulesChecked,
    },
    artifact: {
      type: artifact.type,
      language: artifact.language,
      path: artifact.path,
    },
  };
}

