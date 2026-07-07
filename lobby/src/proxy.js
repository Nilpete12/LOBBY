import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Only protect rider and driver routes
const isProtectedRoute = createRouteMatcher([
  '/drive(.*)',
  '/account(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the user hits a protected route, enforce login
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }
  }
  // 3. Admin routes will naturally bypass this and process normally
});

export const config = {
  // Standard, foolproof Next.js matcher
  matcher: [
    "/((?!.*\\..*|_next).*)", 
    "/", 
    "/(api|trpc)(.*)"
  ],
};