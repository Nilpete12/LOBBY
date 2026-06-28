import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const runtime = 'nodejs';

const ALLOWED_TYPES = new Set(['profile', 'car', 'license']);

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadToCloudinary(file, folder) {
  const buffer = Buffer.from(await file.arrayBuffer());

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function POST(request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Image upload is not configured' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const clerkId = formData.get('clerkId');
    const type = formData.get('type');

    if (clerkId !== userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json(
        { success: false, message: 'Image file is required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid upload type' },
        { status: 400 }
      );
    }

    const result = await uploadToCloudinary(file, `lobby/drivers/${type}`);
    const imageUrl = result.secure_url;

    const updateByType = {
      profile: { profilePic: imageUrl },
      car: { carPic: imageUrl },
      license: {
        licenseUrl: imageUrl,
        verificationStatus: 'Pending',
        aiNotes: 'Uploaded for admin review',
        isVerified: false,
      },
    };

    await connectDB();
    const driver = await User.findOneAndUpdate(
      { clerkId: userId, role: 'driver' },
      { $set: updateByType[type] },
      { new: true }
    ).select('-password');

    if (!driver) {
      return NextResponse.json(
        { success: false, message: 'Driver profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, driver });
  } catch (error) {
    console.error('Failed to upload driver image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
