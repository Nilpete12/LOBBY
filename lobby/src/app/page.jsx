import { currentUser } from '@clerk/nextjs/server';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import connectDB from '@/lib/supabase'; // NEW: Import DB
import User from '@/models/User'; // NEW: Import User Model
import HowItWorks from '@/components/Howitwork';
import TaxiStands from '@/components/TaxiStands';
import DriverHero from '@/components/DriverHero';
import DriverStatsSnapshot from '@/components/DriverStatsSnapshot';
import IncomingRideAlert from '@/components/IncomingRideAlert';

export default async function HomePage() {
  const user = await currentUser();
  const userRole = user?.publicMetadata?.role;

  // 2. THE DRIVER VIEW
  if (userRole === "driver") {
    await connectDB();
    const driverDoc = await User.findOne({ clerkId: user.id })
      .select('isVerified isAvailable accountStatus')
      .lean();

    // 2. Extract their current status
    const isVerified = driverDoc?.isVerified || false;
    const isOnline = driverDoc?.isAvailable || false;

    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <IncomingRideAlert />
        {/* A custom Hero with an Online/Offline toggle instead of a search bar */}
        <DriverHero 
          userName={user?.firstName || "Driver"} 
          clerkId={user.id}           // Pass Clerk ID so we can update DB
          initialIsOnline={isOnline}  // Pass current DB status
          isVerified={isVerified} 
          />
        
        {/* Quick stats for the day */}
        <DriverStatsSnapshot />

        {/* Repurpose the stands as "Demand Zones" for drivers */}
        <div className="pt-10">
          <TaxiStands isDriverView={true} />
        </div>
      </main>
    );
  }

  return (
    <div className="bg-white">
      <Hero />      
      <TaxiStands isDriverView={false} />
      <Features />
      <HowItWorks />
    </div>
  );
}
