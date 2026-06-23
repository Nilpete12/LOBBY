import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)', 
  '/drive/dashboard(.*)', 
  '/account(.*)'
]);

// 1. Add 'async' here
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // 2. Change to 'await auth.protect()'
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/image|_next/static|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)'
  ],
};