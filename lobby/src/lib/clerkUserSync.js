import { clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

const ALLOWED_ROLES = new Set(['rider', 'driver']);
const OPTIONAL_USER_COLUMNS = new Set([
  'email',
  'image_url',
  'account_status',
  'verification_status',
  'subscription_status',
]);

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function getPrimaryEmail(user = {}) {
  const emailAddresses = user.emailAddresses || user.email_addresses || [];
  const primaryEmailAddressId = user.primaryEmailAddressId || user.primary_email_address_id;
  const primaryEmail = emailAddresses.find((email) => email.id === primaryEmailAddressId);

  return (
    primaryEmail?.emailAddress ||
    primaryEmail?.email_address ||
    emailAddresses[0]?.emailAddress ||
    emailAddresses[0]?.email_address ||
    ''
  );
}

function getPublicMetadata(user = {}) {
  return user.publicMetadata || user.public_metadata || {};
}

function getFullName(user = {}) {
  return (
    cleanString(user.fullName || user.full_name, 160) ||
    cleanString(`${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`, 160)
  );
}

export function clerkUserToRow(user = {}, overrides = {}) {
  const metadataRole = cleanString(getPublicMetadata(user).role, 20);
  const overrideRole = cleanString(overrides.role, 20);
  const role = ALLOWED_ROLES.has(overrideRole)
    ? overrideRole
    : ALLOWED_ROLES.has(metadataRole)
      ? metadataRole
      : '';

  const fullName =
    getFullName(user) ||
    cleanString(user.username, 160) ||
    cleanString(getPrimaryEmail(user), 160) ||
    'Lobby user';

  return {
    clerk_id: user.id,
    full_name: fullName,
    email: cleanString(getPrimaryEmail(user), 254),
    image_url: cleanString(user.imageUrl || user.image_url, 1000),
    ...(role ? { role } : {}),
  };
}

export async function syncClerkUserToSupabase(user, overrides = {}) {
  if (!user?.id) throw new Error('Missing Clerk user id');

  const baseRow = clerkUserToRow(user, overrides);
  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', user.id)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing) {
    const updateRow = {
      ...baseRow,
      email: baseRow.email || existing.email || '',
      image_url: baseRow.image_url || existing.image_url || '',
      role: baseRow.role || existing.role || 'rider',
    };

    const data = await writeWithColumnFallback(updateRow, OPTIONAL_USER_COLUMNS, (row) =>
      supabase
        .from('users')
        .update(row)
        .eq('clerk_id', user.id)
        .select()
        .single()
    );

    return { user: data, created: false };
  }

  const role = baseRow.role || 'rider';
  const insertRow = {
    ...baseRow,
    role,
    is_verified: false,
    is_available: false,
    account_status: 'active',
    verification_status: role === 'driver' ? 'Pending' : 'Approved',
    subscription_status: role === 'driver' ? 'unpaid' : null,
  };

  const data = await writeWithColumnFallback(insertRow, OPTIONAL_USER_COLUMNS, (row) =>
    supabase
      .from('users')
      .insert(row)
      .select()
      .single()
  );

  return { user: data, created: true };
}

export async function syncAllClerkUsersToSupabase() {
  const client = await clerkClient();
  const limit = 100;
  let offset = 0;
  let created = 0;
  let updated = 0;
  let total = 0;

  while (offset < 1000) {
    const page = await client.users.getUserList({ limit, offset });
    const users = Array.isArray(page) ? page : page.data || [];

    if (!users.length) break;

    for (const user of users) {
      const result = await syncClerkUserToSupabase(user);
      if (result.created) created += 1;
      else updated += 1;
      total += 1;
    }

    const totalCount = Number(page.totalCount);
    offset += users.length;

    if (!Number.isFinite(totalCount) || offset >= totalCount || users.length < limit) break;
  }

  return { total, created, updated };
}

export async function updateClerkUserRole(clerkId, role) {
  if (!clerkId || !ALLOWED_ROLES.has(role)) return;

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkId, {
    publicMetadata: {
      role,
      onboardingComplete: true,
    },
  });
}

export async function deleteClerkUserAccount(clerkId) {
  if (!clerkId) return false;

  const client = await clerkClient();
  try {
    await client.users.deleteUser(clerkId);
  } catch (error) {
    if (error?.status === 404 || error?.statusCode === 404) return false;
    throw error;
  }

  return true;
}
