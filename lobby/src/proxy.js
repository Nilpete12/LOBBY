import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/drive/dashboard(.*)',
  '/drive/earnings(.*)',
  '/drive/profile(.*)',
  '/drive/TripHistory(.*)',
  '/account(.*)',
  '/favourites(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/image|_next/static|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)'
  ],
};
