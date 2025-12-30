import DriverBenefits from "../Components/Drbenefits";
import DriverHero from "../Components/Drhero";
import Drsteps from "../Components/Drsteps";


export default function DriverPage() {
  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <DriverHero />
      
      {/* 2. Why Join? */}
      <DriverBenefits />
      
      {/* 3. How to Join */}
      <Drsteps />
    </div>
  );
}