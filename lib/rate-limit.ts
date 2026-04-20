/**
 * Rate limiter en memoria (token bucket fijo) pensado para proteger endpoints
 * sensibles de abuso. Funciona sin Redis — suficiente para una instancia.
 *
 * Para multi-instancia (Vercel multi-region) migrar a Upstash Redis con la
 * misma interfaz `limit(key) -> { ok, remaining, resetAt }`.
 *
 * Uso:
 *   const rl = getRateLimiter("ai-chat", { max: 20, windowMs: 60_000 });
 *   const { ok, resetAt, remaining } = rl.limit(userId);
 *   if (!ok) return new Response("Too many requests", { status: 429, headers: { "Retry-After": ... } });
 */

export type RateLimitConfig = { max: number; windowMs: number };
export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number; // epoch ms
  retryAfterSec: number;
};

type Bucket = { count: number; resetAt: number };

class MemoryRateLimiter {
  private buckets = new Map<string, Bucket>();
  constructor(private config: RateLimitConfig) {}

  limit(key: string): RateLimitResult {
    const now = Date.now();
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const resetAt = now + this.config.windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      this.sweepIfNeeded(now);
      return { ok: true, remaining: this.config.max - 1, resetAt, retryAfterSec: 0 };
    }
    if (existing.count >= this.config.max) {
      return {
        ok: false,
        remaining: 0,
        resetAt: existing.resetAt,
        retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }
    existing.count += 1;
    return {
      ok: true,
      remaining: this.config.max - existing.count,
      resetAt: existing.resetAt,
      retryAfterSec: 0,
    };
  }

  /** Limpieza perezosa para no crecer indefinidamente. */
  private lastSweep = 0;
  private sweepIfNeeded(now: number) {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [k, b] of this.buckets) {
      if (b.resetAt <= now) this.buckets.delete(k);
    }
  }

  /** Solo para tests. */
  reset() { this.buckets.clear(); }
}

const REGISTRY = new Map<string, MemoryRateLimiter>();

export function getRateLimiter(name: string, config: RateLimitConfig): MemoryRateLimiter {
  const existing = REGISTRY.get(name);
  if (existing) return existing;
  const rl = new MemoryRateLimiter(config);
  REGISTRY.set(name, rl);
  return rl;
}

/** Presets usados por los endpoints. */
export const RATE_LIMITS = {
  aiChat: { max: 20, windowMs: 60_000 },          // 20 req/min por usuario
  aiModerate: { max: 30, windowMs: 60_000 },
  upload: { max: 15, windowMs: 60_000 },           // 15 uploads/min por usuario
  push: { max: 10, windowMs: 60_000 },
  posterPdf: { max: 10, windowMs: 60_000 },
} as const;

/** Extrae identificador estable para rate limiting (userId preferido, IP fallback). */
export function getClientKey(req: Request, userId?: string): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

/** Helper para endpoints: aplica límite y devuelve Response 429 si aplica. */
export function applyRateLimit(
  req: Request,
  name: keyof typeof RATE_LIMITS,
  userId?: string,
): Response | null {
  const rl = getRateLimiter(name, RATE_LIMITS[name]);
  const key = getClientKey(req, userId);
  const result = rl.limit(key);
  if (result.ok) return null;
  return new Response(
    JSON.stringify({ error: "Demasiadas peticiones, intenta en unos segundos." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSec),
        "X-RateLimit-Reset": String(result.resetAt),
      },
    }
  );
}
