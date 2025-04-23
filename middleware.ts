// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // Redirect kalau belum login dan akses /admin
  if (path.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect kalau role-nya bukan ADMIN
  if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

// Jalankan middleware hanya di /admin dan /dashboard kalau ada
export const config = {
  matcher: ['/admin/:path*'],
};
