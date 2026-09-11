import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient(cookieStore?: any) {
  let store = cookieStore;
  if (!store) {
    try {
      const { cookies } = await import('next/headers');
      store = typeof cookies === 'function' ? cookies() : cookies;
    } catch {
      // Fallback if not invoked in a Next.js Server Component or Action
    }
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://xhzphnfzuutduztukiln.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'placeholder-anon-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return store?.get?.(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          store?.set?.({ name, value, ...options });
        } catch (error) {
          // Handled if invoked from a Server Component
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          store?.set?.({ name, value: '', ...options });
        } catch (error) {
          // Handled if invoked from a Server Component
        }
      },
    },
  });
}

/**
 * Creates an admin / service-role Supabase client for trusted server-side executions.
 * Bypasses RLS and passes unconditionally through triggers checking for service_role.
 */
export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://xhzphnfzuutduztukiln.supabase.co';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

