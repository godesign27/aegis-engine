/**
 * Policy pack registry - in-memory cache for fetched policy packs
 */
import { PolicyPack, PolicyPackSource } from '../types';
import { fetchPolicyPack } from './fetch';
import { parsePolicyPack } from './parse';
import { config } from '../config';

/**
 * In-memory cache for policy packs
 * Key: `${url}:${ref}`
 */
class PolicyRegistry {
  private cache: Map<string, PolicyPack> = new Map();
  
  /**
   * Get or fetch a policy pack
   */
  async getPolicyPack(source: PolicyPackSource): Promise<PolicyPack> {
    const cacheKey = this.getCacheKey(source);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.fetchedAt;
      const maxAge = config.cache.ttlSeconds * 1000;
      
      if (age < maxAge) {
        return cached;
      }
      
      // Cache expired
      this.cache.delete(cacheKey);
    }
    
    // Fetch and parse
    const files = await fetchPolicyPack(source);
    const policyPack = parsePolicyPack(source, files);
    
    // Store in cache
    this.cache.set(cacheKey, policyPack);
    
    return policyPack;
  }
  
  /**
   * List all cached policy packs
   */
  listPolicyPacks(): Array<{
    url: string;
    ref: string;
    id: string;
    name: string;
    version: string;
    fetchedAt: number;
  }> {
    return Array.from(this.cache.values()).map((pack) => ({
      url: pack.source.url,
      ref: pack.source.ref,
      id: pack.config.id,
      name: pack.config.name,
      version: pack.config.version,
      fetchedAt: pack.fetchedAt,
    }));
  }
  
  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Generate cache key from source
   */
  private getCacheKey(source: PolicyPackSource): string {
    return `${source.url}:${source.ref}`;
  }
}

// Singleton instance
export const policyRegistry = new PolicyRegistry();

