"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const RIDER_ROUTES = ['/search', '/account', '/favourites', '/support'];
const DRIVER_ROUTES = ['/drive/dashboard', '/drive/earnings', '/drive/TripHistory', '/support'];
const PUBLIC_ROUTES = ['/search', '/drive', '/support'];

export default function NavigationWarmup() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const role = user?.publicMetadata?.role;

  useEffect(() => {
    if (!isLoaded) return undefined;

    const routes = isSignedIn
      ? role === 'driver'
        ? DRIVER_ROUTES
        : RIDER_ROUTES
      : PUBLIC_ROUTES;

    const warmup = () => {
      routes.forEach((route) => router.prefetch(route));
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmup, { timeout: 1800 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(warmup, 800);
    return () => window.clearTimeout(timer);
  }, [isLoaded, isSignedIn, role, router]);

  return null;
}
