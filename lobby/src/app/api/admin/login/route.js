import { NextResponse } from 'next/server';
import {
  createAdminSessionResponse,
  isAdminConfigReady,
  validateAdminCredentials,
} from '@/lib/adminAuth';

export async function POST(request) {
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
