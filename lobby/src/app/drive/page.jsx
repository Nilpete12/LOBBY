"use client";
import DriverBenefits from "@/components/Drbenefits";
import DriverHero from "@/components/Drhero";
import Drsteps from "@/components/Drsteps";


export default function DriverPage() {
  return (
    <div className="bg-white">
      <div className="min-h-screen bg-slate-50 pb-20">
      
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
