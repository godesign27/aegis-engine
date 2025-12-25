/**
 * Telemetry and recent validations tracking
 */

export interface ValidationSummary {
  timestamp: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  policy_pack: {
    id: string;
    name: string;
    url: string;
    ref: string;
  };
  artifact_path?: string;
  violation_count: number;
  warning_count: number;
  rules_checked: string[];
}

/**
 * Simple ring buffer for tracking recent validations
 */
class ValidationTracker {
  private recentValidations: ValidationSummary[] = [];
  private maxSize = 10;
  private validationCount = 0;
  private lastValidationAt: string | null = null;

  /**
   * Record a validation result
   */
  recordValidation(summary: ValidationSummary): void {
    this.validationCount++;
    this.lastValidationAt = summary.timestamp;
    
    // Add to front of array
    this.recentValidations.unshift(summary);
    
    // Keep only last N validations
    if (this.recentValidations.length > this.maxSize) {
      this.recentValidations = this.recentValidations.slice(0, this.maxSize);
    }
  }

  /**
   * Get recent validations (most recent first)
   */
  getRecentValidations(): ValidationSummary[] {
    return [...this.recentValidations];
  }

  /**
   * Get validation counters
   */
  getCounters(): { validations_run: number; last_validation_at: string | null } {
    return {
      validations_run: this.validationCount,
      last_validation_at: this.lastValidationAt,
    };
  }

  /**
   * Clear all tracking data
   */
  clear(): void {
    this.recentValidations = [];
    this.validationCount = 0;
    this.lastValidationAt = null;
  }
}

// Singleton instance
export const validationTracker = new ValidationTracker();

