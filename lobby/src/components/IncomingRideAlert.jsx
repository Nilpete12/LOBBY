"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import { MapPin, Navigation, User, CheckCircle, XCircle, Phone, Clock } from "lucide-react";

// Initialize Supabase Client for frontend subscriptions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function IncomingRideAlert() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [incomingRide, setIncomingRide] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- 1. SUPABASE REALTIME SUBSCRIPTION (Replaces Polling) ---
  useEffect(() => {
    // Stop listening if not a driver, or if already on an active ride
    if (!isLoaded || !isSignedIn || user?.publicMetadata?.role !== "driver") return;
    if (activeRide) return;

    // A. Fetch any existing pending ride on initial load
    const fetchInitialPendingRide = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        // Map DB 'id' to '_id' for frontend compatibility
        setIncomingRide({ ...data[0], _id: data[0].id });
      }
    };

    fetchInitialPendingRide();

    // B. Subscribe to LIVE incoming requests
    const channel = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: "status=eq.pending"
        },
        (payload) => {
          // Instantly show the new ride when it hits the database
          setIncomingRide({
            ...payload.new,
            _id: payload.new.id,
            pickupLocation: {
              lat: payload.new.pickup_lat,
              lng: payload.new.pickup_lng,
              address: payload.new.pickup_address
            },
            riderName: payload.new.rider_name,
            riderPhone: payload.new.rider_phone
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRide, isLoaded, isSignedIn, user]);

  // --- 2. Handle Accept ---
  const handleAccept = async () => {
    if (!incomingRide) return;

    setIsAccepting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/bookings/${incomingRide._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "accepted",
          driverId: user?.id
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not accept this ride");
      }

      setActiveRide(data.booking);
      setIncomingRide(null); // Clear the alert modal
    } catch (error) {
      console.error("Failed to accept ride:", error);
      setErrorMessage(error.message || "Could not accept this ride.");
    } finally {
      setIsAccepting(false);
    }
  };

  // --- 3. Handle Complete Ride ---
  const handleCompleteRide = async () => {
    if (!activeRide) return;

    try {
      await fetch(`/api/bookings/${activeRide._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
    } catch (error) {
      console.error("Failed to complete ride:", error);
    } finally {
      setActiveRide(null);
    }
  };

  // --- 4. Handle Decline ---
  const handleDecline = () => {
    setIncomingRide(null);
  };

  // --- 5. Active Ride Realtime Refresh ---
  useEffect(() => {
    if (!activeRide?._id) return undefined;

    let controller;

    const refreshActiveRide = async () => {
      if (typeof document !== "undefined" && document.hidden) return;

      controller?.abort();
      controller = new AbortController();

      try {
        const res = await fetch(`/api/bookings/${activeRide._id}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await res.json();

        if (data.success) {
          setActiveRide(data.booking);
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to refresh active ride:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshActiveRide();
    };

    const intervalId = setInterval(refreshActiveRide, 5000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller?.abort();
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeRide?._id]);

  const getMapsHref = (ride) => {
    // Handle both nested object format and flat format
    const lat = ride?.pickupLocation?.lat || ride?.pickup_lat;
    const lng = ride?.pickupLocation?.lng || ride?.pickup_lng;

    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null;

    return `http://maps.google.com/maps?q=${lat},${lng}`;
  };

  // --- UI: ACTIVE RIDE (Driver Accepted) ---
  if (activeRide) {
    const mapsHref = getMapsHref(activeRide);
    const pickupAddress = activeRide?.pickupLocation?.address || activeRide?.pickup_address;
    const riderName = activeRide?.riderName || activeRide?.rider_name;
    const riderPhone = activeRide?.riderPhone || activeRide?.rider_phone;

    return (
      <div className="fixed bottom-24 inset-x-4 md:inset-x-auto md:right-8 md:bottom-8 md:w-96 bg-white border-2 border-[#0F766E] rounded-3xl p-6 shadow-2xl z-50 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Ride Active</h3>
            <p className="text-xs font-semibold text-emerald-600">Pick up the passenger</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <p className="text-sm font-bold text-slate-900 mb-1">{riderName}</p>
          <p className="text-xs text-slate-500 mb-3 line-clamp-1">{pickupAddress}</p>
          {mapsHref && (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 w-full border border-slate-200 bg-white text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition"
            >
              <Navigation size={16} />
              Open Live Pickup
            </a>
          )}

          {riderPhone ? (
            <a
              href={`tel:${riderPhone}`}
              className="w-full bg-[#0F766E] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0d625b] transition"
            >
              <Phone size={16} />
              Call Rider
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full bg-slate-200 text-slate-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Phone size={16} />
              Rider phone unavailable
            </button>
          )}
        </div>

        <button
          onClick={handleCompleteRide}
          className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition"
        >
          Mark Ride Complete
        </button>
      </div>
    );
  }

  // --- UI: INCOMING RIDE ALERT (Pending) ---
  if (incomingRide) {
    const pickupAddress = incomingRide?.pickupLocation?.address || incomingRide?.pickup_address;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-sm rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

          {/* Header with pulsing indicator */}
          <div className="bg-slate-900 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 animate-pulse"></div>
            <h2 className="text-white font-black text-2xl tracking-tight mb-1">Incoming Request</h2>
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Clock size={14} className="animate-pulse" /> Just now
            </div>
          </div>

          {/* Ride Details */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <User size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passenger</p>
                <p className="text-lg font-bold text-slate-900">{incomingRide.riderName}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8 relative before:absolute before:inset-y-4 before:left-3.5 before:w-0.5 before:bg-slate-200">
              <div className="flex gap-4 relative z-10">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 ring-4 ring-white">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Pickup</p>
                  <p className="text-sm font-semibold text-slate-900">{pickupAddress}</p>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 ring-4 ring-white">
                  <Navigation size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Drop-off</p>
                  <p className="text-sm font-semibold text-slate-900">{incomingRide.destination}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {errorMessage && (
              <p className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-600">
                {errorMessage}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDecline}
                disabled={isAccepting}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <XCircle size={18} />
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-[#0F766E] text-white shadow-lg shadow-teal-100 hover:bg-[#0d625b] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle size={18} />
                {isAccepting ? "Accepting..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render nothing if there are no incoming rides
  return null;
}