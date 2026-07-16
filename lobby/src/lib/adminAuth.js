import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_auth';
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function safeCompare(value, expected) {
  if (typeof value !== 'string' || typeof expected !== 'string') return false;
  
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  
  // FIX: Node's timingSafeEqual throws a RangeError if buffer lengths mismatch!
  // Checking length first prevents valid requests from failing due to size differences.
  if (valueBuffer.length !== expectedBuffer.length) return false;
  
  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function signSessionPayload(payload) {   
  // Fallback signature key to prevent crypto from crashing if the env isn't registering yet
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback_temporary_local_secret_string_32_chars';
  return createHmac('sha256', secret).update(payload).digest('base64url'); 
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
  const response = NextResponse.json(
    { success: false, message: 'Admin authentication required' },
    { status: 401 }
  );

  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export function createAdminSessionResponse() {   
  try {
    const response = NextResponse.json({ success: true, authenticated: true });   
    const token = createAdminSessionToken();

    response.cookies.set(ADMIN_COOKIE_NAME, token, {     
      httpOnly: true,     
      secure: process.env.NODE_ENV === 'production',     
      sameSite: 'lax',     
      path: '/',     
      maxAge: ADMIN_SESSION_TTL_SECONDS,   
    });   
    
    response.headers.set('Cache-Control', 'no-store, max-age=0');   
    return response; 
  } catch (error) {
    console.error('CRITICAL ERROR inside createAdminSessionResponse:', error);
    return NextResponse.json(
      { success: false, message: 'Internal session generation crash', error: error.message },
      { status: 500 }
    );
  }
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

  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
