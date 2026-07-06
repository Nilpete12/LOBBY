import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    const clerkId = formData.get('clerkId');
    const type = formData.get('type'); // 'car', 'license', or 'profile'

    if (!file || !clerkId) {
      return NextResponse.json({ success: false, message: 'Missing file or user ID' }, { status: 400 });
    }

    // 1. Convert file to buffer for Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique file name (e.g., driver_123_car_16843920.jpg)
    const fileExt = file.name.split('.').pop();
    const fileName = `${clerkId}_${type}_${Date.now()}.${fileExt}`;

    // 2. Upload to Supabase Storage bucket named 'driver-documents'
    const { data: uploadData, error: uploadError } = await supabase
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

    const { data: updatedUser, error: dbError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, driver: updatedUser });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}