import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { syncClerkUserToSupabase } from '@/lib/clerkUserSync';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function onboardingJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

const OPTIONAL_CONTACT_COLUMNS = new Set(['phone', 'email_verified_at', 'phone_verified_at', 'contact_verified_at']);

function isVerifiedContact(contact = {}) {
  return contact?.verification?.status === 'verified' || contact?.verified === true;
}

function verifiedEmailAddress(user = {}) {
  const emailAddresses = user.emailAddresses || [];
  const primaryEmail = emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
  const verifiedEmail = [primaryEmail, ...emailAddresses].filter(Boolean).find(isVerifiedContact);
  return verifiedEmail?.emailAddress || '';
}

function verifiedPhoneNumber(user = {}) {
  const phoneNumbers = user.phoneNumbers || [];
  const primaryPhone = phoneNumbers.find((phone) => phone.id === user.primaryPhoneNumberId);
  const verifiedPhone = [primaryPhone, ...phoneNumbers].filter(Boolean).find(isVerifiedContact);
  return verifiedPhone?.phoneNumber || '';
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return onboardingJson({ success: false, error: 'Please sign in again before choosing an account type.' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!['rider', 'driver'].includes(role)) {
      return onboardingJson({ success: false, error: 'Choose rider or driver to continue.' }, { status: 400 });
    }

    const client = await clerkClient();

    const clerkUser = await client.users.getUser(userId);
    const verifiedEmail = verifiedEmailAddress(clerkUser);
    const verifiedPhone = verifiedPhoneNumber(clerkUser);

    if (role === 'rider' && (!verifiedEmail || !verifiedPhone)) {
      return onboardingJson(
        {
          success: false,
          error: 'Please verify both your email address and phone number before continuing as a rider.',
          missing: {
            email: !verifiedEmail,
            phone: !verifiedPhone,
          },
        },
        { status: 400 }
      );
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        onboardingComplete: true,
        ...(role === 'rider' ? { contactVerificationComplete: true } : {}),
      },
    });

    const { user } = await syncClerkUserToSupabase(clerkUser, { role });

    // Keep this explicit update as a final guard in case metadata propagation lags.
    const finalUpdate = { role };
    if (role === 'rider') {
      const verifiedAt = new Date().toISOString();
      finalUpdate.email = verifiedEmail;
      finalUpdate.phone = verifiedPhone;
      finalUpdate.email_verified_at = user.email_verified_at || verifiedAt;
      finalUpdate.phone_verified_at = user.phone_verified_at || verifiedAt;
      finalUpdate.contact_verified_at = user.contact_verified_at || verifiedAt;
    }

    await writeWithColumnFallback(finalUpdate, OPTIONAL_CONTACT_COLUMNS, (row) =>
      supabase
        .from('users')
        .update(row)
        .eq('clerk_id', userId)
    );

    return onboardingJson({
      success: true,
      message: `Successfully registered ${user.full_name || 'user'} as a ${role}`,
    });
  } catch (error) {
    console.error("Onboarding Catch Error:", error);
    return onboardingJson(
      { success: false, error: 'Failed to complete onboarding. Please try again.' },
      { status: 500 }
    );
  }
}
