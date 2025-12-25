/**
 * Configuration management for Aegis Engine
 */
import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Cache settings
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  },
  
  // Future: Git authentication
  git: {
    token: process.env.GIT_TOKEN,
  },
};

