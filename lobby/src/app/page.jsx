import { currentUser } from '@clerk/nextjs/server'; 
import { supabase } from '@/lib/supabase'; // 1. Import Supabase client
import Hero from '@/components/Hero';
import Features from '@/components/Features';
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
    const { data: driverDoc } = await supabase
      .from('users')
      .select('is_verified,is_available,account_status')
      .eq('clerk_id', user.id)
      .eq('role', 'driver')
      .maybeSingle();

    // 2. Extract their current status
    const isVerified = driverDoc?.is_verified || false;
    const isOnline = driverDoc?.is_available || false;

    return (
      <main className="min-h-screen bg-[#0B0B0B] text-white">
        <IncomingRideAlert />
        <DriverHero 
          userName={user?.firstName || "Driver"} 
          clerkId={user.id}           
          initialIsOnline={isOnline}  
          isVerified={isVerified} 
        />
        
        <DriverStatsSnapshot />

        <div className="pt-10">
          <TaxiStands isDriverView={true} />
        </div>
      </main>
    );
  }

  // 3. RIDER / GUEST VIEW
  return (
    <div className="bg-[#0B0B0B] text-white">
      <Hero />      
      <Features />
      <HowItWorks />
    </div>
  );
}
