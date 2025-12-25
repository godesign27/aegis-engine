/**
 * Validation handler for REST API
 */
import { Request, Response } from 'express';
import { ValidationRequest, ValidationResult } from '../types';
import { policyRegistry } from '../policy/registry';
import { validateUICode } from '../validators/uiCodeValidator';
import { validationTracker } from '../telemetry/tracker';

/**
 * POST /validate handler
 */
export async function handleValidation(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationRequest = validateRequest(req.body);
    
    // Get or fetch policy pack
    const policyPack = await policyRegistry.getPolicyPack(validationRequest.policy_pack);
    
    // Validate the artifact
    const result: ValidationResult = validateUICode(
      validationRequest.artifact,
      policyPack
    );
    
    // Record validation summary for tracking
    validationTracker.recordValidation({
      timestamp: new Date().toISOString(),
      status: result.status,
      policy_pack: {
        id: result.policy_pack.id,
        name: result.policy_pack.name,
        url: result.policy_pack.url,
        ref: result.policy_pack.ref,
      },
      artifact_path: validationRequest.artifact.path,
      violation_count: result.summary.total_violations,
      warning_count: result.summary.total_warnings,
      rules_checked: result.summary.rules_checked,
    });
    
    // Return result
    res.status(200).json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({
      error: 'Validation failed',
      message: (error as Error).message,
    });
  }
}

/**
 * Validate the incoming request body
 */
function validateRequest(body: any): ValidationRequest {
  // Validate policy_pack
  if (!body.policy_pack) {
    throw new Error('Missing required field: policy_pack');
  }
  
  if (body.policy_pack.source !== 'git') {
    throw new Error('Only "git" source is supported for policy_pack');
  }
  
  if (!body.policy_pack.url || typeof body.policy_pack.url !== 'string') {
    throw new Error('policy_pack.url must be a string');
  }
  
  if (!body.policy_pack.ref || typeof body.policy_pack.ref !== 'string') {
    throw new Error('policy_pack.ref must be a string');
  }
  
  // Validate artifact
  if (!body.artifact) {
    throw new Error('Missing required field: artifact');
  }
  
  if (body.artifact.type !== 'code') {
    throw new Error('Only "code" artifact type is supported');
  }
  
  const validLanguages = ['tsx', 'jsx', 'ts', 'js'];
  if (!validLanguages.includes(body.artifact.language)) {
    throw new Error(`artifact.language must be one of: ${validLanguages.join(', ')}`);
  }
  
  if (!body.artifact.content || typeof body.artifact.content !== 'string') {
    throw new Error('artifact.content must be a non-empty string');
  }
  
  return body as ValidationRequest;
}

