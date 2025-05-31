interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class EnhancedRateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  checkLimit(req: Request): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.config.keyGenerator ? this.config.keyGenerator(req) : this.getDefaultKey(req);
    const now = Date.now();
    
    let entry = this.limits.get(key);
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      this.limits.set(key, entry);
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  private getDefaultKey(req: Request): string {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `ip:${ip}`;
  }
}

// Different rate limits for different user roles
export const createRoleBasedLimiter = (userRole: string) => {
  const configs = {
    'client': { windowMs: 5 * 60 * 1000, maxRequests: 20 },
    'pro': { windowMs: 5 * 60 * 1000, maxRequests: 100 },
    'enterprise': { windowMs: 5 * 60 * 1000, maxRequests: 500 },
    'admin': { windowMs: 5 * 60 * 1000, maxRequests: 1000 }
  };

  const config = configs[userRole as keyof typeof configs] || configs['client'];
  return new EnhancedRateLimiter(config);
}; 