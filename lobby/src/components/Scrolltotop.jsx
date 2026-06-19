import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Instant scroll to top (0, 0) whenever the path changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything visually
}