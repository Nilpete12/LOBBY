import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

export const runtime = 'nodejs';

const OPTIONAL_USER_UPLOAD_COLUMNS = new Set(['verification_status']);

const OPTIONAL_VERIFICATION_REQUEST_COLUMNS = new Set([
  'driver_id',
  'driver_name',
  'email',
  'phone',
  'vehicle',
  'license_url',
  'review_notes',
]);

const ALLOWED_UPLOAD_TYPES = new Set(['car', 'license', 'profile']);
const DRIVER_DOCUMENTS_BUCKET = 'driver-documents';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

function uploadJson(body, init = {}) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

function cleanString(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function safeStorageSegment(value) {
  return cleanString(value, 120).replace(/[^a-zA-Z0-9_-]/g, '_') || 'driver';
}

function isMissingBucketError(error = {}) {
  const text = [error.message, error.error, error.name].filter(Boolean).join(' ').toLowerCase();
  return error.statusCode === 404 || error.status === 404 || text.includes('bucket not found') || text.includes('not found');
}

function getUploadErrorMessage(error = {}) {
  const text = [error.message, error.details, error.hint, error.error].filter(Boolean).join(' ');
  const lowerText = text.toLowerCase();

  if (isMissingBucketError(error)) {
    return 'Storage is not ready yet. Please try again in a moment.';
  }

  if (lowerText.includes('row-level security') || lowerText.includes('permission')) {
    return 'Storage permission blocked the upload. Check the Supabase service role key.';
  }

  if (lowerText.includes('column') && lowerText.includes('does not exist')) {
    return 'The driver upload database columns are missing. Please update the Supabase users table.';
  }

  if (lowerText.includes('payload') || lowerText.includes('too large') || error.status === 413) {
    return 'Image is too large. Please use a smaller photo and try again.';
  }

  return 'Upload failed. Please try again.';
}

async function ensureDriverDocumentsBucket() {
  const { data: bucket, error } = await supabaseAdmin.storage.getBucket(DRIVER_DOCUMENTS_BUCKET);

  if (!error) {
    if (bucket?.public === false) {
      const { error: updateError } = await supabaseAdmin.storage.updateBucket(DRIVER_DOCUMENTS_BUCKET, {
        public: true,
        allowedMimeTypes: Object.keys(IMAGE_EXTENSIONS),
        fileSizeLimit: MAX_UPLOAD_BYTES,
      });

      if (updateError) throw updateError;
    }

    return;
  }

  if (!isMissingBucketError(error)) throw error;

  const { error: createError } = await supabaseAdmin.storage.createBucket(DRIVER_DOCUMENTS_BUCKET, {
    public: true,
    allowedMimeTypes: Object.keys(IMAGE_EXTENSIONS),
    fileSizeLimit: MAX_UPLOAD_BYTES,
  });

  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    throw createError;
  }
}

async function getClerkRole(userId, sessionClaims) {
  const claimRole = cleanString(
    sessionClaims?.metadata?.role ||
      sessionClaims?.publicMetadata?.role ||
      sessionClaims?.public_metadata?.role,
    40
  ).toLowerCase();

  if (claimRole) return claimRole;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return cleanString(user?.publicMetadata?.role, 40).toLowerCase();
  } catch (error) {
    console.error('Failed to read Clerk role for upload:', error);
    return '';
  }
}

async function createVerificationRequest(driver, publicUrl) {
  if (!driver?.clerk_id || !publicUrl) return;

  const requestRow = {
    driver_id: driver.id,
    clerk_id: driver.clerk_id,
    driver_name: driver.full_name || 'Driver',
    email: driver.email || '',
    phone: driver.phone || '',
    vehicle: driver.vehicle || '',
    license_url: publicUrl,
    status: 'pending',
    review_notes: '',
  };

  try {
    await supabaseAdmin
      .from('verification_requests')
      .update({ status: 'superseded' })
      .eq('clerk_id', driver.clerk_id)
      .in('status', ['pending', 'Pending']);

    await writeWithColumnFallback(requestRow, OPTIONAL_VERIFICATION_REQUEST_COLUMNS, (row) =>
      supabaseAdmin.from('verification_requests').insert(row).select().single()
    );
  } catch (error) {
    console.error('Failed to create verification request:', error);
  }
}

export async function POST(req) {
  try {
    const { userId, sessionClaims } = await auth();
    const formData = await req.formData();
    const file = formData.get('image');
    const clerkId = cleanString(formData.get('clerkId'), 120);
    const type = cleanString(formData.get('type'), 20); // 'car', 'license', or 'profile'

    if (!file || !clerkId) {
      return uploadJson({ success: false, message: 'Missing file or user ID' }, { status: 400 });
    }

    if (!userId || userId !== clerkId) {
      return uploadJson({ success: false, message: 'Please sign in again before uploading.' }, { status: 401 });
    }

    if (!ALLOWED_UPLOAD_TYPES.has(type)) {
      return uploadJson({ success: false, message: 'Invalid upload type' }, { status: 400 });
    }

    if (typeof file.arrayBuffer !== 'function' || !file.size) {
      return uploadJson({ success: false, message: 'Choose an image before uploading.' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return uploadJson({ success: false, message: 'Image is too large. Please upload an image under 8 MB.' }, { status: 413 });
    }

    const fileType = cleanString(file.type, 80).toLowerCase();
    const fileExt = IMAGE_EXTENSIONS[fileType];
    if (!fileExt) {
      return uploadJson({ success: false, message: 'Please upload a JPG, PNG, WebP, HEIC, or HEIF image.' }, { status: 400 });
    }

    const { data: existingDriver, error: driverError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .maybeSingle();

    if (driverError) throw driverError;
    if (!existingDriver) {
      return uploadJson({ success: false, message: 'Driver profile not found. Please complete driver onboarding first.' }, { status: 404 });
    }

    const supabaseRole = cleanString(existingDriver.role, 40).toLowerCase();
    const clerkRole = supabaseRole === 'driver' ? 'driver' : await getClerkRole(userId, sessionClaims);
    if (supabaseRole !== 'driver' && clerkRole !== 'driver') {
      return uploadJson({ success: false, message: 'Only driver accounts can upload vehicle documents.' }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `drivers/${safeStorageSegment(clerkId)}/${type}-${Date.now()}-${randomUUID()}.${fileExt}`;

    await ensureDriverDocumentsBucket();

    // 2. Upload to Supabase Storage bucket named 'driver-documents'
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(DRIVER_DOCUMENTS_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 3. Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(DRIVER_DOCUMENTS_BUCKET)
      .getPublicUrl(fileName);

    if (!publicUrl) throw new Error('Supabase did not return a public URL for the uploaded image');

    // 4. Update the appropriate column in the users table
    const updatePayload = {};
    if (type === 'car') updatePayload.car_pic = publicUrl;
    if (type === 'license') updatePayload.license_url = publicUrl;
    if (type === 'profile') updatePayload.profile_pic = publicUrl;

    // For licenses, you might want to automatically set them to pending
    if (type === 'license') updatePayload.verification_status = 'Pending';

    const updatedUser = await writeWithColumnFallback(updatePayload, OPTIONAL_USER_UPLOAD_COLUMNS, (row) =>
      supabaseAdmin
        .from('users')
        .update(row)
        .eq('clerk_id', clerkId)
        .select()
        .single()
    );

    if (type === 'license') {
      await createVerificationRequest(updatedUser, publicUrl);
    }

    return uploadJson({ success: true, driver: formatUser(updatedUser) });

  } catch (error) {
    console.error("Upload Error:", error);
    return uploadJson({ success: false, message: getUploadErrorMessage(error) }, { status: 500 });
  }
}
