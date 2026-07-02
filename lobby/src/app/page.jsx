import { currentUser } from '@clerk/nextjs/server';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/Howitwork';
import TaxiStands from '@/components/TaxiStands';
import DriverHero from '@/components/DriverHero';
import DriverStatsSnapshot from '@/components/DriverStatsSnapshot';

export default async function HomePage() {
  const user = await currentUser();
  const userRole = user?.publicMetadata?.role;

  // 2. THE DRIVER VIEW
  if (userRole === "driver") {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* A custom Hero with an Online/Offline toggle instead of a search bar */}
        <DriverHero userName={user.firstName} />
        
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
