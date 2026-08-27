import 'server-only';

/**
 * Fixed-window rate limiter held in process memory.
 *
 * Good enough for one instance in development. In production each serverless
 * instance would keep its own counter and every deployment would reset them,
 * so a real deployment wants a shared store (Redis via the Vercel Marketplace)
 * behind the same interface.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/**
 * Entries are only ever created, so without this the map grows for every
 * distinct caller the process ever sees — a slow leak that a burst of unique
 * IPs turns into a fast one.
 */
function evictExpired(now: number): void {
  for (const [key, window] of windows) {
    if (now > window.resetAt) {
      windows.delete(key);
    }
  }
}

let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

export type RateLimitResult = {
  allowed: boolean;
  /** Requests still available in the current window. */
  remaining: number;
  /** When the window resets, as epoch milliseconds. */
  resetAt: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();

  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    evictExpired(now);
    lastSweep = now;
  }

  const current = windows.get(key);

  if (!current || now > current.resetAt) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });

    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count++;

  return {
    allowed: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  };
}

/**
 * Best-effort caller identity for rate limiting.
 *
 * `x-forwarded-for` is set by the proxy but can be forged by anyone talking to
 * the origin directly, and it holds a list when there is more than one hop —
 * the client's own address is the first entry. Prefer a real user id whenever
 * the request is authenticated; this is the fallback.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();

  return first || request.headers.get('x-real-ip') || 'unknown';
}
