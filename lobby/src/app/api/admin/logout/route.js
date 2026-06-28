import { clearAdminSessionResponse } from '@/lib/adminAuth';

export async function POST() {
  return clearAdminSessionResponse();
}
