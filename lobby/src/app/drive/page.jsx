"use client";
import DriverBenefits from "@/components/Drbenefits";
import DriverHero from "@/components/Drhero";
import Drsteps from "@/components/Drsteps";
import IncomingRideAlert from "@/components/IncomingRideAlert";


export default function DriverPage() {
  return (
    <div className="bg-white">
      <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Drop the alert component right at the top of the dashboard. 
        It is completely invisible until a ride request hits the database! 
      */}
      <IncomingRideAlert />
      {/* 1. Hero Section */}
      <DriverHero />
      
      {/* 2. Why Join? */}
      <DriverBenefits />
      
      {/* 3. How to Join */}
      <Drsteps />
    </div>
    </div>
  );
}