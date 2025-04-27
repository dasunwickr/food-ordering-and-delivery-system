import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// User types for role-based access control
type UserType = 'admin' | 'customer' | 'restaurant' | 'driver';

// Map of routes to the user types that can access them
const PROTECTED_ROUTES: Record<string, UserType> = {
  '/admin': 'admin',
  '/customer': 'customer',
  '/restaurant': 'restaurant',
  '/driver': 'driver',
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/',
  '/about',
  '/contact',
  '/api',
  '/browse',
  '/_next',
  '/favicon.ico',
  '/placeholder.svg',
  '/unauthorized', // Added unauthorized page to public routes
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token and user type from cookies - do this early to check session status
  const token = request.cookies.get('authToken')?.value;
  const userType = request.cookies.get('userType')?.value?.toLowerCase() as UserType;
  const userId = request.cookies.get('userId')?.value;
  
  // If user has a valid session, redirect to their dashboard when accessing public routes
  // like sign-in, sign-up, or root path
  if (token && userType && userId) {
    if (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up') {
      const dashboardUrl = `/${userType}`;
      console.log(`Valid session detected: Redirecting user to ${dashboardUrl}`);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }
  
  // Skip middleware on public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // If no token, user type, or user ID, redirect to sign in
  if (!token || !userType || !userId) {
    console.log(`Authentication required: Redirecting from ${pathname} to sign-in`);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  // Check route access permissions
  const routePrefix = `/${pathname.split('/')[1]}`;
  const requiredUserType = PROTECTED_ROUTES[routePrefix];
  
  // If this is a protected route and user type doesn't match required type
  if (requiredUserType && userType !== requiredUserType) {
    console.log(`Access denied: ${userType} trying to access ${routePrefix} which requires ${requiredUserType}`);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // Add auth headers to the request for backend services
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', userId);
  requestHeaders.set('x-user-type', userType);
  
  // Continue with added auth headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files and api routes
    '/((?!_next/static|_next/image|images|favicon.ico).*)',
  ],
}