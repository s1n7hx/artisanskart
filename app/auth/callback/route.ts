import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const MASTER_ADMIN_EMAIL_DEFAULT = 'ssumollah@gmail.com';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirectTo') || '/';

  if (code) {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      '';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      '';

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

    // 1. Exchange the auth code for a verified Supabase session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Auth Callback] Error exchanging code for session:', exchangeError.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    // 2. Fetch the verified user directly from Supabase Auth server (never client-supplied)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (user && !userError) {
      // Verified email from auth.users populated ONLY by Supabase post-Google verification
      const verifiedEmail = user.email?.trim().toLowerCase() || '';

      // 3. Query the server database allowlist (e.g. site_settings or admin_allowlist)
      let isAllowlistedAdmin = false;

      // Check site_settings table for 'master_admin_email' row
      try {
        const { data: settingRow } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'master_admin_email')
          .maybeSingle();

        if (settingRow && settingRow.value) {
          const settingVal = settingRow.value;
          const allowedEmail =
            typeof settingVal === 'string'
              ? settingVal.trim().toLowerCase()
              : (settingVal.email || '').trim().toLowerCase();

          if (allowedEmail && verifiedEmail === allowedEmail) {
            isAllowlistedAdmin = true;
          }
        }
      } catch (err) {
        console.warn('[Auth Callback] Could not query site_settings allowlist:', err);
      }

      // Check dedicated admin_allowlist table if present
      if (!isAllowlistedAdmin) {
        try {
          const { data: allowlistRows } = await supabase
            .from('admin_allowlist')
            .select('email')
            .eq('email', verifiedEmail)
            .limit(1);

          if (allowlistRows && allowlistRows.length > 0) {
            isAllowlistedAdmin = true;
          }
        } catch {
          // Table may not exist yet if migration pending
        }
      }

      // Secure hardcoded fallback safeguard
      if (!isAllowlistedAdmin && verifiedEmail === MASTER_ADMIN_EMAIL_DEFAULT.toLowerCase()) {
        isAllowlistedAdmin = true;
      }

      // 4. Determine authoritative role: 'admin' only if email matches allowlist, else 'customer' by default
      const authoritativeRole: 'admin' | 'customer' = isAllowlistedAdmin ? 'admin' : 'customer';

      // 5. Query existing profile from public.profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const now = new Date().toISOString();
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        verifiedEmail.split('@')[0];
      const avatarUrl =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        '';

      if (!existingProfile) {
        // New user: default to 'customer', or 'admin' if verified allowlisted email
        const baseInsert: Record<string, any> = {
          id: user.id,
          email: verifiedEmail,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: authoritativeRole,
          created_at: now,
          updated_at: now,
        };

        // Try inserting with status if column exists
        let { error: insertError } = await supabase
          .from('profiles')
          .insert({ ...baseInsert, status: 'approved' });

        if (insertError && insertError.message?.includes('status')) {
          // Retry without status column if DB migration hasn't added status yet
          const { error: retryError } = await supabase
            .from('profiles')
            .insert(baseInsert);
          insertError = retryError;
        }

        if (insertError) {
          console.error('[Auth Callback] Failed to insert profile:', insertError.message);
        }
      } else {
        // Existing user:
        // If user is allowlisted admin and not yet 'admin', elevate to 'admin'
        if (isAllowlistedAdmin && existingProfile.role !== 'admin') {
          await supabase
            .from('profiles')
            .update({ role: 'admin', updated_at: now })
            .eq('id', user.id);
        }
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
