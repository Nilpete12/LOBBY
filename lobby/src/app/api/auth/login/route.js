// File: src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User'; // Adjust this path if your models are elsewhere
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Parse the body the Next.js way
    const { email, password } = await request.json();

    // 3. Find User
    const user = await User.findOne({ email }).select('+password'); // Ensure password is selected for comparison

    console.log("--- LOGIN DEBUGGING ---");
    console.log("1. Email Searched:", email);
    console.log("2. Did we find the user?", user ? "YES!" : "NO USER FOUND IN DB");

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    console.log("3. DB Password Exists?", user.password ? "YES" : "NO (It is undefined!)");

    // 4. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("3. DB Password Exists?", user.password ? "YES" : "NO (It is undefined!)");
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    // 5. Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // 6. Send Response
    // We remove the password from the user object before sending it to the frontend
    const userWithoutPassword = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    return NextResponse.json({ success: true, token, user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: "Server connection failed" }, { status: 500 });
  }
}