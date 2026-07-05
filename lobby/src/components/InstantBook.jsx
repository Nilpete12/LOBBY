"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Loader2, Navigation, CheckCircle, Car } from "lucide-react";

export default function InstantBook({ destination = "Kohima Town Center" }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("idle"); // idle | locating | booking | waiting | accepted
  const [bookingId, setBookingId] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const profilePhone = user?.primaryPhoneNumber?.phoneNumber || "";

  // 1. The Main Booking Action
  const handleInstantBook = () => {
    if (status !== "idle") return;

    setErrorMessage("");

    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const bookingPhone = (phoneNumber || profilePhone).trim();

    if (bookingPhone.replace(/\D/g, "").length < 7) {
      setErrorMessage("Add a phone number so the driver can call you after accepting.");
      return;
    }

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
          setErrorMessage("Please enable location access so nearby drivers can find your pickup point.");
          setStatus("idle");
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 }
      );
    } else {
      setErrorMessage("This browser does not support location booking. Please call a driver directly.");
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
          riderPhone: (phoneNumber || profilePhone).trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Booking failed");
      }

      setBookingId(data.booking._id);
      setStatus("waiting");
    } catch (error) {
      console.error("Booking failed:", error);
      setErrorMessage(error.message || "Booking failed. Please try again.");
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
              name: data.booking.driver?.fullName || "Driver",
              phone: data.booking.driver?.phone || "",
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

  useEffect(() => {
    if (!bookingId || !["waiting", "accepted"].includes(status) || !("geolocation" in navigator)) {
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await fetch(`/api/bookings/${bookingId}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
        } catch (error) {
          console.error("Live location update failed:", error);
        }
      },
      (error) => {
        console.error("Live location watch failed:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [bookingId, status]);

  const isBusy = status !== "idle";

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
          <input
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="mb-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
            placeholder={profilePhone || "Your phone number"}
            aria-label="Phone number for driver callback"
          />
          {errorMessage && (
            <p className="mb-3 text-sm font-semibold text-red-500">{errorMessage}</p>
          )}
          <button
            onClick={handleInstantBook}
            disabled={isBusy}
            className="w-full bg-[#0F766E] text-white py-3.5 rounded-2xl font-bold hover:bg-[#0d625b] transition shadow-lg shadow-[#0F766E]/20 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99]"
          >
            <Navigation size={18} />
            {isSignedIn ? "Instant Book" : "Sign in to book"}
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
          <p className="text-sm text-slate-500">Broadcasting your live pickup location</p>
        </div>
      )}

      {/* UI STATE: ACCEPTED (Show Call Button) */}
      {status === "accepted" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">Ride Confirmed!</h3>
          <p className="text-sm text-slate-500 mb-6">
            {driverInfo?.name || "A driver"} is on the way to your location.
          </p>

          {driverInfo?.phone ? (
            <a
              href={`tel:${driverInfo.phone}`}
              className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Call Driver
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full bg-slate-200 text-slate-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              Driver phone unavailable
            </button>
          )}
        </div>
      )}
    </div>
  );
}
