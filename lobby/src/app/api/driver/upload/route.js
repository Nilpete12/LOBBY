import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatUser } from '@/lib/supabaseFormat';
import { writeWithColumnFallback } from '@/lib/supabaseColumnFallback';

const OPTIONAL_USER_UPLOAD_COLUMNS = new Set([
  'car_pic',
  'license_url',
  'profile_pic',
  'verification_status',
]);

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
    await supabase
      .from('verification_requests')
      .update({ status: 'superseded' })
      .eq('clerk_id', driver.clerk_id)
      .in('status', ['pending', 'Pending']);

    await writeWithColumnFallback(requestRow, OPTIONAL_VERIFICATION_REQUEST_COLUMNS, (row) =>
      supabase.from('verification_requests').insert(row).select().single()
    );
  } catch (error) {
    console.error('Failed to create verification request:', error);
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    const clerkId = formData.get('clerkId');
    const type = formData.get('type'); // 'car', 'license', or 'profile'

    if (!file || !clerkId) {
      return NextResponse.json({ success: false, message: 'Missing file or user ID' }, { status: 400 });
    }

    if (!ALLOWED_UPLOAD_TYPES.has(type)) {
      return NextResponse.json({ success: false, message: 'Invalid upload type' }, { status: 400 });
    }

    // 1. Convert file to buffer for Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique file name (e.g., driver_123_car_16843920.jpg)
    const fileExt = file.name.split('.').pop();
    const fileName = `${clerkId}_${type}_${Date.now()}.${fileExt}`;

    // 2. Upload to Supabase Storage bucket named 'driver-documents'
    const { error: uploadError } = await supabase
      .storage
      .from('driver-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 3. Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase
      .storage
      .from('driver-documents')
      .getPublicUrl(fileName);

    // 4. Update the appropriate column in the users table
    const updatePayload = {};
    if (type === 'car') updatePayload.car_pic = publicUrl;
    if (type === 'license') updatePayload.license_url = publicUrl; // Assuming you add this column
    if (type === 'profile') updatePayload.profile_pic = publicUrl; // Assuming you add this column

    // For licenses, you might want to automatically set them to pending
    if (type === 'license') updatePayload.verification_status = 'Pending';

    const updatedUser = await writeWithColumnFallback(updatePayload, OPTIONAL_USER_UPLOAD_COLUMNS, (row) =>
      supabase
        .from('users')
        .update(row)
        .eq('clerk_id', clerkId)
        .select()
        .single()
    );

    if (type === 'license') {
      await createVerificationRequest(updatedUser, publicUrl);
    }

    return NextResponse.json({ success: true, driver: formatUser(updatedUser) });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
