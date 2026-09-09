import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const MASTER_ADMIN_EMAIL = 'ssumollah@gmail.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  // Gracefully handle missing environment variables in preview/test environments
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[ArtisansKart Middleware] Missing Supabase environment variables. Bypassing edge session check.');
    return response;
  }

  // Initialize Supabase client for SSR edge runtime
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Fetch the current session safely
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAdminRoute = pathname.startsWith('/admin');
  const isMakerRoute = pathname.startsWith('/maker');

  // Protect Admin and Maker routes
  if (isAdminRoute || isMakerRoute) {
    // 1. If not authenticated, redirect to login page with return url
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userEmail = session.user.email?.toLowerCase() || '';

    // Master Admin override: Always granted instant access
    if (userEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
      return response;
    }

    // 2. Fetch user role and status from the profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      console.warn(`[ArtisansKart Middleware] Profile query failed for user ${session.user.id}:`, error?.message);
      // If profile record is not found yet, redirect to pending-approval
      const pendingUrl = new URL('/pending-approval', request.url);
      return NextResponse.redirect(pendingUrl);
    }

    const role = profile.role || 'customer';
    const status = profile.status || 'pending';

    // 3. Admin Route RBAC Check
    if (isAdminRoute) {
      if (role !== 'admin' || status !== 'approved') {
        const pendingUrl = new URL('/pending-approval', request.url);
        pendingUrl.searchParams.set('required', 'admin');
        return NextResponse.redirect(pendingUrl);
      }
    }

    // 4. Maker Route RBAC Check
    if (isMakerRoute) {
      const isAllowedRole = role === 'maker' || role === 'admin';
      if (!isAllowedRole || status !== 'approved') {
        const pendingUrl = new URL('/pending-approval', request.url);
        pendingUrl.searchParams.set('required', 'maker');
        return NextResponse.redirect(pendingUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/maker/:path*',
    '/pending-approval',
  ],
};
