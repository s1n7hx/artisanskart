import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const MASTER_ADMIN_EMAIL_FALLBACK = 'ssumollah@gmail.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[ArtisansKart Middleware] Missing Supabase environment variables.');
    return response;
  }

  // Initialize Supabase client for SSR edge runtime with verified cookies
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
    },
  });

  const isAdminRoute = pathname.startsWith('/admin');
  const isMakerRoute = pathname.startsWith('/maker');

  // Protect Admin and Maker routes
  if (isAdminRoute || isMakerRoute) {
    // 1. Re-verify session on every request via auth.getUser() (not cached getSession)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // If not authenticated with a valid Supabase session, redirect to /login
    if (authError || !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Fetch authoritative role from public.profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      // If profile does not exist yet or query fails, deny access and redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = profile.role;

    // 3. Admin Route RBAC Check: Only profiles.role = 'admin' is allowed
    if (isAdminRoute) {
      if (role !== 'admin') {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        redirectUrl.searchParams.set('error', 'Admin role required to access this workspace.');
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 4. Maker Route RBAC Check: Only profiles.role = 'maker' or 'admin' is allowed
    if (isMakerRoute) {
      const isAllowed = role === 'maker' || role === 'admin';
      if (!isAllowed) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        redirectUrl.searchParams.set('error', 'Maker role required to access this workspace.');
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/maker/:path*',
  ],
};
