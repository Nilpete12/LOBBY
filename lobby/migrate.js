// Run this with: node migrate.js
// You will need: npm install mongodb @supabase/supabase-js dotenv
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

console.log("Connecting to:", process.env.MONGODB_URI ? "Found URI" : "MISSING URI");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const mongoClient = new MongoClient(process.env.MONGODB_URI); // Ensure this is in your .env.local

async function migrate() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db('your-database-name'); // Replace with your DB name

    // 1. Migrate Users
    const users = await db.collection('users').find({}).toArray();
    for (const u of users) {
      await supabase.from('users').upsert({
        clerk_id: u.clerkId,
        full_name: u.fullName,
        role: u.role || 'rider',
        is_verified: u.isVerified || false,
        is_available: u.isAvailable || false
      });
    }
    console.log('Users migrated!');

    // 2. Migrate Bookings
    const bookings = await db.collection('bookings').find({}).toArray();
    for (const b of bookings) {
      await supabase.from('bookings').insert({
        rider_id: b.riderId,
        driver_id: b.driverId,
        rider_name: b.riderName,
        pickup_lat: b.pickupLocation?.lat,
        pickup_lng: b.pickupLocation?.lng,
        pickup_address: b.pickupLocation?.address,
        destination: b.destination,
        status: b.status
      });
    }
    console.log('Bookings migrated!');

  } catch (err) {
    console.error(err);
  } finally {
    await mongoClient.close();
  }
}

migrate();