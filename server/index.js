require('dotenv').config(); // Load .env variables
const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const cors = require('cors');

// Import Models
const User = require('./models/User');
const Message = require('./models/Message');
const Complaint = require('./models/Complaint'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const Analytics = require('./models/Analytics');
const { upload } = require('./cloudinaryconfig');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true, // Allow all origins for the initial setup
  credentials: true
}));
app.use(express.json());

// --- 1. CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));


// --- 2. API ENDPOINTS ---

app.post('/api/analytics/track', async (req, res) => {
  try {
    const { type, driverId, riderId } = req.body; // <--- Get riderId
    const newEvent = new Analytics({ type, driverId, riderId });
    await newEvent.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 2. NEW: Get Rider History
app.get('/api/rider/history', async (req, res) => {
  try {
    const { riderId } = req.query;
    
    // Find calls made by this rider, populate driver details
    const events = await Analytics.find({ riderId, type: 'call_click' })
      .sort({ timestamp: -1 })
      .populate('driverId', 'fullName phone vehicle profilePic carPic rating') // Get driver info
      .limit(10); // Last 10 calls

    // Filter out duplicates (if I called the same driver twice)
    const uniqueDrivers = [];
    const seenIds = new Set();
    
    events.forEach(event => {
      if (event.driverId && !seenIds.has(event.driverId._id.toString())) {
        seenIds.add(event.driverId._id.toString());
        // Attach the timestamp of the call to the driver object for display
        const driverData = event.driverId.toObject();
        driverData.lastCalled = event.timestamp;
        uniqueDrivers.push(driverData);
      }
    });

    res.json({ success: true, history: uniqueDrivers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching history" });
  }
});



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

// --- 1. POST: Save a new complaint (Public & Private) ---
app.post('/api/complaints', async (req, res) => {
  try {
    const { userId, name, email, role, topic, message } = req.body;
    
    const newComplaint = new Complaint({
      userId, name, email, role, topic, message
    });
    
    await newComplaint.save();
    res.json({ success: true, message: "Complaint logged" });
  } catch (err) {
    console.error("Complaint Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 2. GET: Admin fetches all complaints ---
app.get('/api/admin/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// --- 3. PUT: Admin marks as resolved ---
app.put('/api/admin/complaints/:id', async (req, res) => {
  try {
    await Complaint.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 5. ADMIN: Delete/Reject a User
app.delete('/api/admin/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not delete user" });
  }
});

// TEMP: Fix Rider Roles
app.get('/api/fix-riders', async (req, res) => {
  try {
    // Find everyone who is NOT a driver AND NOT an admin
    const result = await User.updateMany(
      { role: { $nin: ['driver', 'admin'] } }, 
      { $set: { role: 'rider' } }
    );
    res.json({ message: "Fixed riders!", modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. ADMIN: Get All Users (For the Dashboard Table)
app.get('/api/admin/users', async (req, res) => {
  try {
    // 1. Fetch everyone
    const allUsers = await User.find({}).select('-password');
    
    // 2. DEBUG: Print everyone found to the terminal
    console.log("\n--- 🔍 SERVER FOUND THESE USERS ---");
    allUsers.forEach(u => {
      console.log(`👤 Name: ${u.fullName} | Role: "${u.role}"`);
    });
    console.log("-----------------------------------\n");

    // 3. Send to frontend
    res.json({ success: true, users: allUsers });
  } catch (error) {
    console.error("Fetch Error:", error);
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

// --- ANALYTICS ROUTES ---

// A. Track an Event (Called when rider clicks "Call")
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { type, driverId } = req.body;
    const newEvent = new Analytics({ type, driverId });
    await newEvent.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// B. Get Dashboard Stats (Called by Admin Page)
// B. Get Dashboard Stats (Called by Admin Page)
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log("\n--- 🔍 DEBUG: ADMIN STATS REQUESTED ---");

    // 1. Fetch RAW data to see what exists
    const allUsers = await User.find({});
    console.log(`📊 TOTAL USERS IN DB: ${allUsers.length}`);
    
    // Log roles to see if they are 'driver', 'Driver', or undefined
    const roles = allUsers.map(u => `${u.fullName} (${u.role})`);
    console.log("   👉 User Roles:", roles);

    // 2. Run the specific counts
    const [totalRiders, drivers, totalCalls] = await Promise.all([
      User.countDocuments({ role: 'rider' }),
      User.find({ role: 'driver' }),
      Analytics.countDocuments({ type: 'call_click' })
    ]);

    console.log(`   👉 Riders Count (role='rider'): ${totalRiders}`);
    console.log(`   👉 Drivers Found (role='driver'): ${drivers.length}`);
    console.log(`   👉 Total Calls: ${totalCalls}`);

    const activeDrivers = drivers.filter(d => d.isAvailable).length;
    const pendingDrivers = drivers.filter(d => !d.isVerified).length;

    console.log(`   👉 Active Drivers (isAvailable=true): ${activeDrivers}`);
    console.log(`   👉 Pending Drivers (isVerified=false): ${pendingDrivers}`);
    console.log("------------------------------------------\n");

    res.json({
      success: true,
      stats: {
        totalUsers: totalRiders, // Note: You might want (riders + drivers) here
        totalDrivers: drivers.length,
        activeDrivers,
        pendingDrivers,
        totalCalls
      }
    });
  } catch (error) {
    console.error("❌ Stats Error:", error);
    res.status(500).json({ success: false, message: "Stats failed" });
  }
});

// 6. UPLOAD IMAGE ENDPOINT
// This route accepts a file, uploads it, and updates the user's profile in DB
app.post('/api/driver/upload', upload.single('image'), async (req, res) => {
  try {
    const { userId, type } = req.body; // type = 'profile' or 'car'
    const imageUrl = req.file.path; // Cloudinary gives us this URL automatically

    // Update the specific field dynamically
    const updateField = type === 'profile' ? { profilePic: imageUrl } : { carPic: imageUrl };

    const user = await User.findByIdAndUpdate(
      userId, 
      updateField, 
      { new: true }
    ).select('-password');

    res.json({ success: true, user, imageUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});