import { NextResponse } from 'next/server';
import {
  createAdminSessionResponse,
  isAdminConfigReady,
  validateAdminCredentials,
} from '@/lib/adminAuth';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  // 1. FIX: Added 'await' because our updated rate limiter makes database requests!
  const limited = await rateLimit(request, {
    keyPrefix: 'admin-login',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (limited) return limited;

  if (!isAdminConfigReady()) {
    return NextResponse.json(
      { success: false, message: 'Admin login is not configured' },
      { status: 500 }
    );
  }

  let credentials;
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const isValid = validateAdminCredentials(credentials.email, credentials.password);

  if (!isValid) {
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }

  return createAdminSessionResponse();
}