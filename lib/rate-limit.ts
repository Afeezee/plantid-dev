import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimitEvents } from "@/lib/db/schema";

// Sliding-window rate limit backed by Postgres. Every LLM-costing call
// inserts a row; incoming calls first count rows in the last `windowMs`
// and refuse if the count is already at the limit. Cheap enough at our
// per-user volume that a dedicated Redis isn't worth the moving part yet.

export type RateLimitBucket = "analyze" | "chat";

export const RATE_LIMITS: Record<RateLimitBucket, { limit: number; windowMs: number }> = {
  // Analyze is the expensive call (vision). Chat is chattier but cheaper.
  analyze: { limit: 30, windowMs: 60 * 60 * 1000 }, // 30 / hour
  chat: { limit: 120, windowMs: 60 * 60 * 1000 }, // 120 / hour
};

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: Date }
  | { ok: false; retryAfterSeconds: number; resetAt: Date };

export async function checkRateLimit(
  userId: string,
  bucket: RateLimitBucket,
): Promise<RateLimitResult> {
  const { limit, windowMs } = RATE_LIMITS[bucket];
  const since = new Date(Date.now() - windowMs);

  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      oldest: sql<Date | null>`min(${rateLimitEvents.createdAt})`,
    })
    .from(rateLimitEvents)
    .where(
      and(
        eq(rateLimitEvents.userId, userId),
        eq(rateLimitEvents.bucket, bucket),
        gt(rateLimitEvents.createdAt, since),
      ),
    );

  const count = row?.count ?? 0;
  const oldest = row?.oldest ? new Date(row.oldest) : new Date();
  const resetAt = new Date(oldest.getTime() + windowMs);

  if (count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
    return { ok: false, retryAfterSeconds, resetAt };
  }

  await db.insert(rateLimitEvents).values({ userId, bucket });
  return { ok: true, remaining: limit - count - 1, resetAt };
}

// Convenience for API routes: returns a NextResponse-shaped 429 payload
// the route can spread directly, or null if the call is allowed.
export function rateLimitResponse(result: RateLimitResult) {
  if (result.ok) return null;
  return {
    status: 429,
    headers: {
      "Retry-After": String(result.retryAfterSeconds),
      "X-RateLimit-Reset": result.resetAt.toISOString(),
    },
    body: {
      error: "Rate limit exceeded",
      retryAfterSeconds: result.retryAfterSeconds,
    },
  };
}
