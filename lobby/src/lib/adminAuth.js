import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_auth';
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function safeCompare(value, expected) {
  if (typeof value !== 'string' || typeof expected !== 'string') return false;

  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function signSessionPayload(payload) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
}

function createAdminSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
      nonce: randomBytes(18).toString('base64url'),
    })
  ).toString('base64url');

  return `${payload}.${signSessionPayload(payload)}`;
}

function verifyAdminSessionToken(token) {
  if (typeof token !== 'string') return false;

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  if (!safeCompare(signature, signSessionPayload(payload))) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isFinite(session.exp) && session.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminConfigReady() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET
  );
}

export function validateAdminCredentials(email, password) {
  return (
    safeCompare(email?.trim().toLowerCase(), process.env.ADMIN_EMAIL?.trim().toLowerCase()) &&
    safeCompare(password, process.env.ADMIN_PASSWORD)
  );
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(cookieValue);
}

export function adminUnauthorized() {
  return NextResponse.json(
    { success: false, message: 'Admin authentication required' },
    { status: 401 }
  );
}

export function createAdminSessionResponse() {
  const response = NextResponse.json({ success: true, authenticated: true });

  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return response;
}

export function clearAdminSessionResponse() {
  const response = NextResponse.json({ success: true, authenticated: false });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
