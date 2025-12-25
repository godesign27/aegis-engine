/**
 * Status endpoint handler
 */
import { Request, Response } from 'express';
import { policyRegistry } from '../policy/registry';
import { validationTracker } from '../telemetry/tracker';

/**
 * GET /status handler
 */
export function handleStatus(req: Request, res: Response): void {
  try {
    // Get cached policy packs
    const cachedPacks = policyRegistry.listPolicyPacks();
    
    // Get validation counters
    const counters = validationTracker.getCounters();
    
    // Get recent validations
    const recentValidations = validationTracker.getRecentValidations();
    
    res.status(200).json({
      cached_policy_packs: cachedPacks,
      counters,
      recent_validations: recentValidations,
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      error: 'Failed to get status',
      message: (error as Error).message,
    });
  }
}

