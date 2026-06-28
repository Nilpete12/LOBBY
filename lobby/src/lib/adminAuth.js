import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_auth';

function safeCompare(value, expected) {
  if (typeof value !== 'string' || typeof expected !== 'string') return false;

  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(valueBuffer, expectedBuffer);
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

  return safeCompare(cookieValue, process.env.ADMIN_SESSION_SECRET);
}

export function adminUnauthorized() {
  return NextResponse.json(
    { success: false, message: 'Admin authentication required' },
    { status: 401 }
  );
}

export function createAdminSessionResponse() {
  const response = NextResponse.json({ success: true, authenticated: true });

  response.cookies.set(ADMIN_COOKIE_NAME, process.env.ADMIN_SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
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
