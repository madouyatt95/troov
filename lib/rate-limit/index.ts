import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client (will use in-memory fallback if not configured)
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

// In-memory rate limiting fallback for development
const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
    otp: { windowMs: 3600000, maxRequests: 3 }, // 3 per hour
    declaration: { windowMs: 3600000, maxRequests: 5 }, // 5 per hour
    search: { windowMs: 60000, maxRequests: 3 }, // 3 per minute
    global: { windowMs: 60000, maxRequests: 60 }, // 60 per minute
};

// Upstash rate limiters
const upstashLimiters: Record<string, Ratelimit> = {};

if (redis) {
    upstashLimiters.otp = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        prefix: 'rl:otp',
    });

    upstashLimiters.declaration = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 h'),
        prefix: 'rl:decl',
    });

    upstashLimiters.search = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 m'),
        prefix: 'rl:search',
    });

    upstashLimiters.global = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        prefix: 'rl:global',
    });
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp
}

export async function checkRateLimit(
    type: keyof typeof RATE_LIMITS,
    identifier: string
): Promise<RateLimitResult> {
    // Use Upstash if configured
    if (redis && upstashLimiters[type]) {
        const result = await upstashLimiters[type].limit(identifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    }

    // Fallback to in-memory rate limiting
    const config = RATE_LIMITS[type];
    const key = `${type}:${identifier}`;
    const now = Date.now();

    const entry = memoryStore.get(key);

    if (!entry || now > entry.resetAt) {
        // New window
        memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: now + config.windowMs,
        };
    }

    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: entry.resetAt,
        };
    }

    entry.count++;
    return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: entry.resetAt,
    };
}

// Clean up expired entries periodically (for in-memory store)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memoryStore.entries()) {
            if (now > entry.resetAt) {
                memoryStore.delete(key);
            }
        }
    }, 60000); // Clean up every minute
}
