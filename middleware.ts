import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }
  const refreshToken = request.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
