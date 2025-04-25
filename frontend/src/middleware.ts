import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// TODO: Fix the Next JS Middleware
// Routes that need protection based on user type
type UserType = 'ADMIN' | 'CUSTOMER' | 'RESTAURANT' | 'DRIVER';

const PROTECTED_ROUTES: Record<UserType, string[]> = {
  ADMIN: ['/admin'],
  CUSTOMER: ['/customer'],
  RESTAURANT: ['/restaurant'],
  DRIVER: ['/driver']
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/',
  '/about',
  '/contact',
  '/api',
  '/browse',
  '/_next',
  '/favicon.ico',
  '/placeholder.svg',
];

// Check if the path is a protected route
function isProtectedRoute(pathname: string): boolean {
  return Object.values(PROTECTED_ROUTES).flat().some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware on public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // In middleware, we need to use cookies as localStorage is not accessible
  // The auth flow should set cookies in addition to localStorage
  const token = request.cookies.get('authToken')?.value;
  const userType = request.cookies.get('userType')?.value;
  
  // If no token or user type, redirect to sign in
  if (!token || !userType) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  const userTypeUpperCase = userType.toUpperCase();
  if (isProtectedRoute(pathname)) {
    const userTypes = Object.keys(PROTECTED_ROUTES) as UserType[];
    
    for (const type of userTypes) {
      if (PROTECTED_ROUTES[type].some(route => pathname.startsWith(route))) {
        // User is trying to access a route that requires a specific user type
        if (userTypeUpperCase !== type) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    }
  }
  
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files and api routes
    '/((?!_next/static|_next/image|images|favicon.ico).*)',
  ],
}