import { NextResponse } from 'next/server';

const buckets = new Map();
const MAX_BUCKETS = 5000;

function getClientKey(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim();

  return (
    firstForwardedIp ||
    request.headers.get('x-real-ip') ||
    'unknown-client'
  );
}

function cleanupExpiredBuckets(now) {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now || buckets.size > MAX_BUCKETS) {
      buckets.delete(key);
    }
  }
}

export function rateLimit(request, { keyPrefix, limit, windowMs }) {
  const now = Date.now();
  const key = `${keyPrefix}:${getClientKey(request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    cleanupExpiredBuckets(now);
    return null;
  }

  current.count += 1;

  if (current.count <= limit) return null;

  const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
  const response = NextResponse.json(
    { success: false, message: 'Too many requests. Please try again shortly.' },
    { status: 429 }
  );

  response.headers.set('Retry-After', String(retryAfterSeconds));

  return response;
}
