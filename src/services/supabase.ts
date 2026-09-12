import { createClient } from '@supabase/supabase-js';
import { HeroContent, Product, Order } from '../types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://xhzphnfzuutduztukiln.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoenBobmZ6dXV0ZHV6dHVraWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4ODA1NzIsImV4cCI6MjEwNDQ1NjU3Mn0.EdDl2tf6HQmMDpTqReBs0tb_9E1JJMTTDmU8oyG9qXk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'maker' | 'customer';
  status: 'approved' | 'pending' | 'rejected';
  school?: string;
  grade_class?: string;
  bio?: string;
  payout_upi?: string;
  created_at?: string;
}

// -------------------------------------------------------------
// Authentication Helpers
// -------------------------------------------------------------
export async function signInWithGoogle(redirectTo?: string) {
  const targetRedirect = redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: targetRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch Supabase profile:', error.message);
      return null;
    }
    if (data) {
      const isMaster = (data.email || '').trim().toLowerCase() === 'ssumollah@gmail.com';
      if (isMaster) {
        data.role = 'admin';
        data.status = 'approved';
        data.school = data.school || 'ArtisansKart Platform Headquarters';
        (async () => {
          try {
            await supabase
              .from('profiles')
              .update({
                role: 'admin',
                status: 'approved',
                school: 'ArtisansKart Platform Headquarters',
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);
          } catch (e) {}
        })();
      }
    }
    return data as UserProfile;
  } catch (err) {
    return null;
  }
}

// Upsert default profile on auth creation (Master Admin ssumollah@gmail.com is directly granted admin; others default to customer)
export async function ensureUserProfile(
  userId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const isMaster = cleanEmail === 'ssumollah@gmail.com';
  const assignedRole = isMaster ? 'admin' : 'customer';
  const assignedStatus = 'approved';

  const newProfile: UserProfile = {
    id: userId,
    email: cleanEmail,
    full_name: fullName || (isMaster ? 'Master Admin (ssumollah)' : cleanEmail.split('@')[0]),
    avatar_url: avatarUrl || '',
    role: assignedRole,
    status: assignedStatus,
    school: isMaster ? 'ArtisansKart Platform Headquarters' : '',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: cleanEmail,
          full_name: newProfile.full_name,
          avatar_url: newProfile.avatar_url,
          role: assignedRole,
          status: assignedStatus,
          school: newProfile.school,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.warn('Profile upsert warning:', error.message);
      return newProfile;
    }
    if (isMaster && data) {
      data.role = 'admin';
      data.status = 'approved';
    }
    return (data || newProfile) as UserProfile;
  } catch (err) {
    return newProfile;
  }
}

// -------------------------------------------------------------
// Master Admin: User & Role Management
// -------------------------------------------------------------
export async function fetchAllProfiles(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const list = data || [];
    return list.map((p) => {
      if ((p.email || '').trim().toLowerCase() === 'ssumollah@gmail.com') {
        return {
          ...p,
          role: 'admin' as const,
          status: 'approved' as const,
          school: p.school || 'ArtisansKart Platform Headquarters',
        };
      }
      return p;
    });
  } catch (err) {
    console.warn('Falling back to local user store:', err);
    return [];
  }
}

export async function updateUserRole(userId: string, role: 'admin' | 'maker' | 'customer') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

export async function updateUserStatus(userId: string, status: 'approved' | 'pending' | 'rejected') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

export async function updateUserRoleAndStatus(
  userId: string,
  role: 'admin' | 'maker' | 'customer',
  status: 'approved' | 'pending' | 'rejected'
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, status, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

// -------------------------------------------------------------
// CMS / Site Content Storage
// -------------------------------------------------------------
export async function fetchHeroCmsContent(): Promise<HeroContent | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_section')
      .single();

    if (error || !data) return null;
    
    const val = data.value;
    return {
      badgeText: val.badge_text || val.badgeText,
      headlineLine1: val.headline_line1 || val.headlineLine1,
      headlineLine2: val.headline_line2 || val.headlineLine2,
      headlineLine3: val.headline_line3 || val.headlineLine3,
      subhead: val.subhead,
      mainImage: val.main_image || val.mainImage,
      leftImage: val.left_image || val.leftImage,
      rightImage: val.right_image || val.rightImage,
      mainTag: val.main_tag || val.mainTag,
      leftTag: val.left_tag || val.leftTag,
      rightTag: val.right_tag || val.rightTag,
    };
  } catch (err) {
    console.warn('Supabase site_settings read failed, using cached state:', err);
    return null;
  }
}

export async function saveHeroCmsContent(content: HeroContent) {
  const formatted = {
    badge_text: content.badgeText,
    headline_line1: content.headlineLine1,
    headline_line2: content.headlineLine2,
    headline_line3: content.headlineLine3,
    subhead: content.subhead,
    main_image: content.mainImage,
    left_image: content.leftImage,
    right_image: content.rightImage,
    main_tag: content.mainTag,
    left_tag: content.leftTag,
    right_tag: content.rightTag,
  };

  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        key: 'hero_section',
        value: formatted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

  if (error) throw error;
}

// -------------------------------------------------------------
// Supabase Storage Image Uploads
// -------------------------------------------------------------
export async function uploadImageToBucket(file: File, bucket = 'cms-assets'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

// -------------------------------------------------------------
// Product Catalog Operations
// -------------------------------------------------------------
export async function fetchSupabaseProducts(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((item) => ({
      id: typeof item.id === 'string' ? Math.abs(hashCode(item.id)) : item.id,
      title: item.title,
      category: item.category_name,
      price: Number(item.price),
      rating: Number(item.rating || 5.0),
      reviews: item.reviews_count || 1,
      maker: item.maker_name,
      cls: 'Class 10',
      school: item.maker_school || 'Fine Arts Studio',
      image: item.image_url,
      stock: item.stock_status || 'In Stock • Made to order',
      description: item.description || '',
      source: 'custom',
    }));
  } catch (err) {
    return null;
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
