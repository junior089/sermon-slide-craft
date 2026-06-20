// Janela fixa em memória, por processo. Com várias instâncias, cada uma aplica
// o próprio limite; para um único servidor isso basta.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Sem esta limpeza, chaves de IPs que não voltam ficariam no mapa para sempre.
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
    }
    return { allowed: true, retryAfterMs: 0, remaining: Math.max(0, limit - 1) };
  }

  if (bucket.count < limit) {
    bucket.count += 1;
    return { allowed: true, retryAfterMs: 0, remaining: Math.max(0, limit - bucket.count) };
  }

  return { allowed: false, retryAfterMs: bucket.resetAt - now, remaining: 0 };
}
