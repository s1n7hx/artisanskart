import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function createClient(cookieStore?: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get?.(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore?.set?.({ name, value, ...options });
        } catch (error) {
          // Handled if invoked from a Server Component
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore?.set?.({ name, value: '', ...options });
        } catch (error) {
          // Handled if invoked from a Server Component
        }
      },
    },
  });
}
