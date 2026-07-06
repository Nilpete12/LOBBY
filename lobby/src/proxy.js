import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define the routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/drive(.*)',
  '/account(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // 1. Await the async auth function to get session information
    const session = await auth();
    
    // 2. If no user is logged in, force a redirect to sign-in
    if (!session.userId) {
      return session.redirectToSignIn();
    }
  }
});

export const config = {
  // Protects all routes except static assets and internal system files
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};