// Simple in-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const attemptsMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = attemptsMap.get(key);

  if (!record || now > record.resetAt) {
    attemptsMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}
