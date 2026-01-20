require('dotenv').config(); // Load .env variables
const express = require('express');
const mongoose = require('mongoose'); // Import Mongoose
const cors = require('cors');

// Import Models
const User = require('./models/User');
const Message = require('./models/Message');
const bcrypt = require('bcryptjs'); // <--- Import this
const jwt = require('jsonwebtoken'); // <--- Import this

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- 1. CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));


// --- 2. API ENDPOINTS ---

// 1. SEARCH DRIVERS (Connected to DB)
app.get('/api/drivers/search', async (req, res) => {
  try {
    const { destination } = req.query;
    let query = { role: 'driver', isAvailable: true }; // Only show active drivers

    // If user typed a destination, check if it's in the driver's routes
    if (destination) {
      query.routes = { $regex: destination, $options: 'i' }; // Case-insensitive search
    }

    const drivers = await User.find(query).select('-password'); // Don't send passwords back!
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});

// 2. UPDATE DRIVER PROFILE (New Endpoint)
// We need this so drivers can add their Vehicle and Routes from the Dashboard
app.post('/api/driver/update', async (req, res) => {
  try {
    const { id, vehicle, phone, routes, isAvailable } = req.body;
    
    // Find and update
    const user = await User.findByIdAndUpdate(
      id, 
      { vehicle, phone, routes, isAvailable }, 
      { new: true } // Return the updated user
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// 3. ADMIN: Get All Users (For the Dashboard Table)
app.get('/api/admin/users', async (req, res) => {
  try {
    // Fetch all drivers sorted by newest first
    const drivers = await User.find({ role: 'driver' }).sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, users: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 4. ADMIN: Approve a Driver
app.post('/api/admin/approve', async (req, res) => {
  try {
    const { id } = req.body;
    await User.findByIdAndUpdate(id, { isVerified: true });
    res.json({ success: true, message: "Driver Verified!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not verify" });
  }
});

// 5. GET CURRENT USER (Sync Profile)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from header
    if (!token) return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// REGISTER USER (Saved to DB)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    // Create new user
    const newUser = new User({ fullName, email, password, role });
    await newUser.save(); // Takes time, so we use 'await'

    console.log("New User Saved:", newUser.email);
    res.json({ success: true, message: "Account created successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// LOGIN USER (Authentication)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }

    // 2. Compare Passwords
    // (Note: In register, we stored plain text for simplicity, but in production, 
    // you MUST hash passwords. For now, we will assume plain text match for the prototype phase,
    // or if you used bcrypt in register, use bcrypt.compare here.)
    
    // Simple comparison for now (Prototype Mode):
    if (password !== user.password) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    // 3. Create Token (The "VIP Pass")
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// CONTACT FORM (Saved to DB)
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, topic, message } = req.body;
    
    const newMessage = new Message({ firstName, lastName, email, topic, message });
    await newMessage.save();

    console.log("Message Saved from:", email);
    res.json({ success: true, message: "Message received." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Could not save message." });
  }
});

// DRIVER SEARCH (Still mock data for now, until we make a Driver Schema)
// ... Keep your mock drivers array here for search functionality ...
// ... (Paste the mock drivers array from previous step here) ...

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});