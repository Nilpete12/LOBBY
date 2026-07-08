import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
    const { userId } = await auth();
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
    if (!existingDriver || existingDriver.role !== 'driver') {
      return uploadJson({ success: false, message: 'Driver profile not found.' }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `drivers/${safeStorageSegment(clerkId)}/${type}-${Date.now()}-${randomUUID()}.${fileExt}`;

    // 2. Upload to Supabase Storage bucket named 'driver-documents'
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('driver-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 3. Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('driver-documents')
      .getPublicUrl(fileName);

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
    return uploadJson({ success: false, message: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
