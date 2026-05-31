// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
//   ],
// };

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}