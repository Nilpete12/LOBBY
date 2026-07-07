import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const authenticated = await isAdminAuthenticated();

  const response = NextResponse.json({
    success: true,
    authenticated,
  });

  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
