"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { MapPin, Phone, Loader2, Navigation, CheckCircle, Car } from "lucide-react";

export default function InstantBook({ destination = "Kohima Town Center" }) {
  const { user } = useUser();
  const [status, setStatus] = useState("idle"); // idle | locating | booking | waiting | accepted
  const [bookingId, setBookingId] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);

  // 1. The Main Booking Action
  const handleInstantBook = () => {
    setStatus("locating");

    // Ask browser for secure location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          submitBooking(latitude, longitude);
        },
        (error) => {
          console.error("Location error:", error);
          alert("Please enable location services to book a ride.");
          setStatus("idle");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setStatus("idle");
    }
  };

  // 2. Send Data to MongoDB
  const submitBooking = async (lat, lng) => {
    setStatus("booking");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation: { lat, lng, address: "Current Location" },
          destination: destination,
          riderName: user?.firstName || "Rider",
          riderPhone: "+919876543210", // In production, pull this from user metadata
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBookingId(data.booking._id);
        setStatus("waiting");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      setStatus("idle");
    }
  };

  // 3. Poll for Driver Acceptance (Runs every 3 seconds while "waiting")
  useEffect(() => {
    let interval;
    if (status === "waiting" && bookingId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/bookings/${bookingId}`);
          const data = await res.json();
          
          if (data.success && data.booking.status === "accepted") {
            // Driver accepted!
            setDriverInfo({
              id: data.booking.driverId,
              phone: "+919876543211" // Dummy driver phone for now
            });
            setStatus("accepted");
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, bookingId]);

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/60 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07)] max-w-sm mx-auto w-full">
      
      {/* UI STATE: IDLE */}
      {status === "idle" && (
        <div className="text-center">
          <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0F766E]">
            <Car size={28} />
          </div>
          <h3 className="text-xl font-[Proxima_Nova_Semibold] text-slate-900 mb-2">Need a ride?</h3>
          <p className="text-sm text-slate-500 mb-6">
            Instantly broadcast your location to nearby drivers.
          </p>
          <button
            onClick={handleInstantBook}
            className="w-full bg-[#0F766E] text-white py-3.5 rounded-2xl font-bold hover:bg-[#0d625b] transition shadow-lg shadow-[#0F766E]/20 flex items-center justify-center gap-2"
          >
            <Navigation size={18} />
            Instant Book
          </button>
        </div>
      )}

      {/* UI STATE: LOCATING & BOOKING */}
      {(status === "locating" || status === "booking") && (
        <div className="text-center py-6">
          <Loader2 size={36} className="text-[#0F766E] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {status === "locating" ? "Finding you..." : "Sending request..."}
          </h3>
          <p className="text-sm text-slate-500">Securely acquiring GPS coordinates</p>
        </div>
      )}

      {/* UI STATE: WAITING FOR DRIVER */}
      {status === "waiting" && (
        <div className="text-center py-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-emerald-50 rounded-full w-full h-full flex items-center justify-center text-emerald-600">
              <MapPin size={28} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Connecting...</h3>
          <p className="text-sm text-slate-500">Broadcasting to local drivers</p>
        </div>
      )}

      {/* UI STATE: ACCEPTED (Show Call Button) */}
      {status === "accepted" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">Ride Confirmed!</h3>
          <p className="text-sm text-slate-500 mb-6">A driver is on their way to your location.</p>
          
          <a
            href={`tel:${driverInfo?.phone}`}
            className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
          >
            <Phone size={18} />
            Call Driver
          </a>
        </div>
      )}
    </div>
  );
}