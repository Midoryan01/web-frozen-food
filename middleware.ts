// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Jika tidak ada token (belum login) dan mencoba akses halaman yang dilindungi
  // Arahkan ke halaman login
  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/cashier'))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Jika ada token, cek otorisasi berdasarkan role
  if (token) {
    // Hanya ADMIN yang bisa akses /dashboard
    if (pathname.startsWith('/dashboard') && token.role !== 'ADMIN') {
      // Anda bisa arahkan ke halaman utama atau halaman "unauthorized"
      return NextResponse.redirect(new URL('/', req.url)); 
    }

    // Hanya KASIR (dan ADMIN) yang bisa akses /cashier
    if (pathname.startsWith('/cashier') && !['ADMIN', 'KASIR'].includes(token.role as string)) {
       return NextResponse.redirect(new URL('/', req.url));
    }

    // Jika sudah login dan mencoba akses /login lagi, arahkan sesuai role
    if (pathname.startsWith('/login')) {
      if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/dashboard', req.url));
      if (token.role === 'KASIR') return NextResponse.redirect(new URL('/cashier', req.url));
    }
  }

  return NextResponse.next();
}

// Terapkan middleware pada halaman yang perlu dilindungi dan halaman login
export const config = {
  matcher: ['/dashboard/:path*', '/cashier/:path*', '/login'],
};