import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function getClientKey(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstForwardedIp = forwardedFor?.split(',')[0]?.trim();
  return firstForwardedIp || request.headers.get('x-real-ip') || 'unknown-client';
}

export async function rateLimit(request, { keyPrefix, limit, windowMs }) {
  const now = new Date();
  const key = `${keyPrefix}:${getClientKey(request)}`;
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // 1. Transactional Upsert with explicit count tracking
    const { data, error } = await supabaseAdmin.rpc('increment_rate_limit', {
      row_key: key,
      max_limit: limit,
      window_expiry: resetAt.toISOString()
    });

    // Fallback: If you haven't deployed the RPC yet, standard query management
    if (error || data === null) {
      const { data: currentRecord } = await supabaseAdmin
        .from('rate_limits')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (!currentRecord || new Date(currentRecord.reset_at) <= now) {
        await supabaseAdmin.from('rate_limits').upsert({ key, count: 1, reset_at: resetAt.toISOString() });
        return null;
      }

      if (currentRecord.count >= limit) {
        const retryAfterSeconds = Math.ceil((new Date(currentRecord.reset_at).getTime() - now.getTime()) / 1000);
        return buildLimitResponse(retryAfterSeconds);
      }

      await supabaseAdmin.from('rate_limits').update({ count: currentRecord.count + 1 }).eq('key', key);
      return null;
    }

    if (data === false) {
      // Limit exceeded! Read record to send correct header expiration
      const { data: expiredRecord } = await supabaseAdmin.from('rate_limits').select('reset_at').eq('key', key).maybeSingle();
      const retryAfterSeconds = expiredRecord ? Math.ceil((new Date(expiredRecord.reset_at).getTime() - now.getTime()) / 1000) : 60;
      return buildLimitResponse(retryAfterSeconds);
    }

    return null;
  } catch (err) {
    console.error('[Rate Limit Error] Database connection issue, defaulting to fail-open:', err);
    return null; // Fail-open gracefully so your users aren't blocked if database pings hiccup
  }
}

function buildLimitResponse(retryAfterSeconds) {
  const response = NextResponse.json(
    { success: false, message: 'Too many requests. Please try again shortly.' },
    { status: 429 }
  );
  response.headers.set('Retry-After', String(retryAfterSeconds));
  return response;
}