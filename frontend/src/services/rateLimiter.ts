import { GEMINI_MODELS, GeminiModel } from '../constants/geminiModels';

export interface RateLimitInfo {
  rpm: number; // Requests per minute
  tpm: number; // Tokens per minute
  rpd: number; // Requests per day
}

interface RequestRecord {
  timestamp: number;
  tokens: number;
}

class RateLimiter {
  private requestHistory: Map<string, RequestRecord[]> = new Map();
  private dailyRequests: Map<string, number> = new Map();
  private dailyResetTime: Map<string, number> = new Map();
  private models: GeminiModel[] = GEMINI_MODELS;

  /**
   * Parse rate limit string (e.g., "2 / 5" or "420.13K / 250K") to number
   */
  private parseRateLimit(value: string): number {
    if (value === 'Ilimitado' || value === 'Unlimited' || value === '0 / Ilimitado') {
      return Infinity;
    }

    // Get the second number (the limit) from format "current / limit"
    const parts = value.split('/').map(s => s.trim());
    if (parts.length === 2) {
      const limitStr = parts[1];
      return this.parseNumber(limitStr);
    }

    // If no "/", try to parse the whole string
    return this.parseNumber(value);
  }

  /**
   * Parse number with K, M suffixes
   */
  private parseNumber(str: string): number {
    const trimmed = str.trim().replace(/,/g, '');
    const upper = trimmed.toUpperCase();

    if (upper.includes('K')) {
      const num = parseFloat(upper.replace('K', ''));
      return num * 1000;
    }
    if (upper.includes('M')) {
      const num = parseFloat(upper.replace('M', ''));
      return num * 1000000;
    }

    return parseFloat(trimmed) || 0;
  }

  /**
   * Update models list (for dynamic loading from API)
   */
  updateModels(models: GeminiModel[]): void {
    this.models = models;
  }

  /**
   * Get current models list
   */
  getModels(): GeminiModel[] {
    return this.models;
  }

  /**
   * Get rate limits for a specific model
   */
  getModelRateLimits(modelId: string): RateLimitInfo {
    const model = this.models.find(m => m.id === modelId);
    if (!model) {
      // Default limits if model not found
      return { rpm: 60, tpm: 1000000, rpd: Infinity };
    }

    return {
      rpm: this.parseRateLimit(model.rpm),
      tpm: this.parseRateLimit(model.tpm),
      rpd: this.parseRateLimit(model.rpd)
    };
  }

  /**
   * Check if a request can be made based on rate limits
   */
  canMakeRequest(modelId: string, estimatedTokens: number = 0): { allowed: boolean; waitTime?: number; reason?: string } {
    const limits = this.getModelRateLimits(modelId);
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    // Get or initialize request history for this model
    if (!this.requestHistory.has(modelId)) {
      this.requestHistory.set(modelId, []);
    }
    if (!this.dailyResetTime.has(modelId)) {
      this.dailyResetTime.set(modelId, now);
    }

    const history = this.requestHistory.get(modelId)!;
    const resetTime = this.dailyResetTime.get(modelId)!;

    // Check if we need to reset daily counter
    if (now - resetTime > 86400000) {
      this.dailyRequests.set(modelId, 0);
      this.dailyResetTime.set(modelId, now);
    }

    // Get daily request count
    if (!this.dailyRequests.has(modelId)) {
      this.dailyRequests.set(modelId, 0);
    }
    const dailyCount = this.dailyRequests.get(modelId)!;

    // Filter recent requests (last minute)
    const recentRequests = history.filter(r => r.timestamp > oneMinuteAgo);
    const recentTokens = recentRequests.reduce((sum, r) => sum + r.tokens, 0);

    // Check RPM limit
    if (limits.rpm !== Infinity && recentRequests.length >= limits.rpm) {
      const oldestRequest = recentRequests[0];
      const waitTime = oldestRequest.timestamp + 60000 - now + 1000; // Add 1s buffer
      return { allowed: false, waitTime, reason: `RPM limit exceeded (${limits.rpm} requests/min)` };
    }

    // Check TPM limit
    if (limits.tpm !== Infinity && recentTokens + estimatedTokens > limits.tpm) {
      // Find when we can make the request
      const tokensToWait = recentTokens + estimatedTokens - limits.tpm;
      // Rough estimate: assume average tokens per request to calculate wait time
      const avgTokensPerRequest = recentRequests.length > 0 ? recentTokens / recentRequests.length : estimatedTokens;
      const requestsToWait = Math.ceil(tokensToWait / (avgTokensPerRequest || estimatedTokens));
      const waitTime = requestsToWait * (60000 / limits.rpm) + 1000;
      return { allowed: false, waitTime, reason: `TPM limit exceeded (${limits.tpm} tokens/min)` };
    }

    // Check RPD limit
    if (limits.rpd !== Infinity && dailyCount >= limits.rpd) {
      const waitTime = resetTime + 86400000 - now;
      return { allowed: false, waitTime, reason: `RPD limit exceeded (${limits.rpd} requests/day)` };
    }

    return { allowed: true };
  }

  /**
   * Record a request after it's made
   */
  recordRequest(modelId: string, tokens: number = 0): void {
    const now = Date.now();
    
    if (!this.requestHistory.has(modelId)) {
      this.requestHistory.set(modelId, []);
    }

    const history = this.requestHistory.get(modelId)!;
    history.push({ timestamp: now, tokens });

    // Keep only last minute of history
    const oneMinuteAgo = now - 60000;
    const filtered = history.filter(r => r.timestamp > oneMinuteAgo);
    this.requestHistory.set(modelId, filtered);

    // Update daily count
    const currentDaily = this.dailyRequests.get(modelId) || 0;
    this.dailyRequests.set(modelId, currentDaily + 1);
  }

  /**
   * Wait until a request can be made
   */
  async waitForRateLimit(modelId: string, estimatedTokens: number = 0): Promise<void> {
    const maxWaitTime = 60000; // Max 1 minute wait
    const checkInterval = 1000; // Check every second
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const check = this.canMakeRequest(modelId, estimatedTokens);
      if (check.allowed) {
        return;
      }

      if (check.waitTime && check.waitTime > 0 && check.waitTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, Math.min(check.waitTime, checkInterval)));
      } else {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    throw new Error(`Rate limit wait timeout for model ${modelId}`);
  }

  /**
   * Clear history for a model (useful for testing or reset)
   */
  clearHistory(modelId?: string): void {
    if (modelId) {
      this.requestHistory.delete(modelId);
      this.dailyRequests.delete(modelId);
      this.dailyResetTime.delete(modelId);
    } else {
      this.requestHistory.clear();
      this.dailyRequests.clear();
      this.dailyResetTime.clear();
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

