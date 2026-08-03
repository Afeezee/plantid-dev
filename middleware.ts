import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Mirrors the old Base44 "AuthenticationBoundary" — everything under the
// app shell requires a session; /admin additionally requires the admin role
// (checked again inside the route/layout, since middleware role checks are
// a UX shortcut, not the security boundary).
const isProtectedRoute = createRouteMatcher([
  "/upload(.*)",
  "/history(.*)",
  "/assistant(.*)",
  "/drone-mode(.*)",
  "/feedback(.*)",
  "/settings(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
