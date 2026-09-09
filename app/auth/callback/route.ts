import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const MASTER_ADMIN_EMAIL = 'ssumollah@gmail.com';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirectTo') || '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookiesToSet.push({ name, value, options });
        },
        remove(name: string, options: CookieOptions) {
          cookiesToSet.push({ name, value: '', options });
        },
      },
    });

    // Exchange the auth code for session tokens
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Error exchanging code for session:', exchangeError.message);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin));
    }

    if (session?.user) {
      const user = session.user;
      const userEmail = user.email?.toLowerCase() || '';
      const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL.toLowerCase();

      // Check if user profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role, status')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Requirement 1: When a new user logs in, automatically create a row in the profiles table with default role = 'customer' and status = 'approved'
        const initialRole = isMasterAdmin ? 'admin' : 'customer';
        const initialStatus = 'approved';

        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          email: userEmail,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          role: initialRole,
          status: initialStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('[Auth Callback] Failed to insert initial profile:', insertError.message);
        }
      } else if (isMasterAdmin && (existingProfile.role !== 'admin' || existingProfile.status !== 'approved')) {
        // Ensure Master Admin always has active admin role & approved status
        await supabase
          .from('profiles')
          .update({ role: 'admin', status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    }

    const redirectResponse = NextResponse.redirect(new URL(next, requestUrl.origin));

    // Apply any cookies modified during session exchange
    for (const { name, value, options } of cookiesToSet) {
      redirectResponse.cookies.set({ name, value, ...options });
    }

    return redirectResponse;
  }

  // Fallback if no auth code is provided
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
