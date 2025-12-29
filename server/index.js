// File: lobby/server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- MOCK DATABASE (Matches your UI Image Plan) ---
let drivers = [
  {
    id: 1,
    name: "Bah John",
    vehicle: "Maruti 800",
    rating: 4.8,
    isAvailable: true, // The Green Dot
    routes: ["Shillong", "Guwahati", "Airport"], // The Route Tags
    phone: "9863000000"
  },
  {
    id: 2,
    name: "Kong Mary",
    vehicle: "Innova",
    rating: 4.9,
    isAvailable: false, // The Red Dot
    routes: ["Shillong", "Dawki", "Cherrapunji"],
    phone: "9863000001"
  }
];

// --- API ENDPOINTS ---

// 1. GET: Search Drivers (Rider Side)
// Matches your note: "Search Logic: System matches travel_routes + availability_status"
app.get('/api/drivers/search', (req, res) => {
  const { destination } = req.query;

  // If no search, return all (or empty, your choice)
  if (!destination) {
    return res.json(drivers);
  }

  const results = drivers.filter(driver => 
    // Logic: Must be Available AND match the route tag
    driver.isAvailable === true && 
    driver.routes.some(route => route.toLowerCase().includes(destination.toLowerCase()))
  );

  res.json(results);
});

// 2. POST: Toggle Availability (Driver Side)
// Logic: Updates the 'Green/Red' status
app.post('/api/driver/:id/toggle', (req, res) => {
  const driverId = parseInt(req.params.id);
  const driver = drivers.find(d => d.id === driverId);

  if (driver) {
    driver.isAvailable = !driver.isAvailable;
    res.json({ 
      success: true, 
      isAvailable: driver.isAvailable,
      message: `Status changed to ${driver.isAvailable ? "Available" : "Unavailable"}`
    });
  } else {
    res.status(404).json({ message: "Driver not found" });
  }
});

app.listen(PORT, () => {
  console.log(`LOBBY Brain is active on port: ${PORT}`);
});