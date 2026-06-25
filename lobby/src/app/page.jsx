"use client";
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Destinations from '@/components/Destinationsbr';
import HowItWorks from '@/components/Howitwork';

export default function HomePage() {
  return (
    <div className="bg-white">
      <Hero />      
      <Features />
      <Destinations />
      <HowItWorks />
    </div>
  );
}
