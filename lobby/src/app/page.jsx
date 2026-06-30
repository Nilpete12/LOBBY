"use client";
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/Howitwork';
import TaxiStands from '@/components/TaxiStands';

export default function HomePage() {
  return (
    <div className="bg-white">
      <Hero />      
      <TaxiStands />
      <Features />
      <HowItWorks />
    </div>
  );
}
