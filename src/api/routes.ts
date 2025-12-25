/**
 * REST API routes
 */
import { Router } from 'express';
import { handleValidation } from './validate';
import { handleStatus } from './status';
import { handleAdminUI } from './admin';

const router = Router();

// Track server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * POST /validate - Validate code artifact against policy pack
 */
router.post('/validate', handleValidation);

/**
 * GET /health - Health check endpoint
 */
router.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime_seconds: uptimeSeconds,
  });
});

/**
 * GET /status - Service status with policy packs and validation counters
 */
router.get('/status', handleStatus);

/**
 * GET /admin - Admin dashboard UI
 */
router.get('/admin', handleAdminUI);

export default router;

