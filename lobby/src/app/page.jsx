"use client";
import Hero from '@/components/Hero';
import SearchSection from '@/components/Search';
import Features from '@/components/Features';
import Destinations from '@/components/Destinationsbr';
import HowItWorks from '@/components/Howitwork';

export default function HomePage() {
  return (
    <div className="bg-white">
      <Hero />      
      <SearchSection />      
      <Features />
      <Destinations />
      <HowItWorks />
    </div>
  );
}
