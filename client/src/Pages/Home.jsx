import React from 'react';
import Hero from '../Components/Hero';
import SearchSection from '../Components/Search';
import Features from '../Components/Features';
import Destinations from '../Components/Destinationsbr';
import HowItWorks from '../Components/Howitwork';

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
