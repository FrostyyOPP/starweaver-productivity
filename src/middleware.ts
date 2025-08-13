import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/daily-entry',
  '/manage',
  '/export'
];

// Routes that are public
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

      // If it's a protected route, check for authentication
    if (isProtectedRoute) {
      // For now, allow access to protected routes during development
      // TODO: Implement proper token verification when auth is ready
      return NextResponse.next();
    }

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For any other routes, allow access (you can modify this behavior)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
