import { createClient } from '@supabase/supabase-js';
import { HeroContent, Product, Order, UserRole, UserStatus } from '../types';

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
  role: UserRole;
  status: UserStatus;
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
        data.role = 'master_admin';
        data.status = 'approved';
        data.school = data.school || 'ArtisansKart Platform Headquarters';
        (async () => {
          try {
            await supabase
              .from('profiles')
              .update({
                role: 'master_admin',
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

// Upsert default profile on auth creation
// Rules:
// 1. Master Admin ssumollah@gmail.com -> automatically receives 'master_admin' (or 'admin' if enum not yet migrated) & 'approved'.
// 2. Existing profile role is NEVER silently overwritten with 'customer' if already maker/admin/master_admin.
// 3. Pre-authorized emails stored by the Master Author are honored when the user logs in for the first time.
export async function ensureUserProfile(
  userId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const isMaster = cleanEmail === 'ssumollah@gmail.com';

  // Check if profile already exists in Supabase
  let existingProfile: UserProfile | null = null;
  try {
    const { data: existingData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingData) {
      existingProfile = existingData as UserProfile;
    } else {
      // Also try finding by email in case of pre-seeded/authorized profile
      const { data: byEmail } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();
      if (byEmail) {
        existingProfile = byEmail as UserProfile;
      }
    }
  } catch (e) {}

  // Check if there was a pre-authorized role in local store
  let preAuthorizedRole: UserRole | undefined;
  let preAuthorizedStatus: UserStatus | undefined;
  let preAuthorizedSchool: string | undefined;
  try {
    const storedUsers = localStorage.getItem('artisanskart_all_users_v1');
    if (storedUsers) {
      const list = JSON.parse(storedUsers);
      const match = list.find((u: any) => (u.email || '').trim().toLowerCase() === cleanEmail);
      if (match) {
        preAuthorizedRole = match.role;
        preAuthorizedStatus = match.status;
        preAuthorizedSchool = match.school;
      }
    }
  } catch (e) {}

  // Determine final role:
  // - Master always gets master_admin
  // - If user already had a maker or admin role, PRESERVE IT
  // - If user was pre-authorized by Master Admin in portal, ASSIGN IT
  // - Otherwise, default to customer
  let assignedRole: UserRole = 'customer';
  let assignedStatus: UserStatus = 'approved';
  let assignedSchool = '';

  if (isMaster) {
    assignedRole = 'master_admin';
    assignedStatus = 'approved';
    assignedSchool = 'ArtisansKart Platform Headquarters';
  } else if (existingProfile && existingProfile.role && existingProfile.role !== 'customer') {
    // Preserve existing role! Never overwrite with customer
    assignedRole = existingProfile.role;
    assignedStatus = existingProfile.status || 'approved';
    assignedSchool = existingProfile.school || '';
  } else if (preAuthorizedRole && preAuthorizedRole !== 'customer') {
    assignedRole = preAuthorizedRole;
    assignedStatus = preAuthorizedStatus || 'approved';
    assignedSchool = preAuthorizedSchool || '';
  }

  const newProfile: UserProfile = {
    id: userId,
    email: cleanEmail,
    full_name: fullName || existingProfile?.full_name || (isMaster ? 'Master Author' : cleanEmail.split('@')[0]),
    avatar_url: avatarUrl || existingProfile?.avatar_url || '',
    role: assignedRole,
    status: assignedStatus,
    school: assignedSchool || existingProfile?.school || (isMaster ? 'ArtisansKart Platform Headquarters' : ''),
    created_at: existingProfile?.created_at || new Date().toISOString(),
  };

  try {
    const payload: any = {
      id: userId,
      email: cleanEmail,
      full_name: newProfile.full_name,
      avatar_url: newProfile.avatar_url,
      role: assignedRole === 'master_admin' ? (isMaster ? 'master_admin' : 'admin') : assignedRole,
      status: assignedStatus,
      school: newProfile.school,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    // If 'status' column doesn't exist yet, retry without 'status'
    if (error && error.message?.includes('status')) {
      delete payload.status;
      const retryResult = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    // If 'master_admin' is not yet accepted by the enum in database, fallback to 'admin'
    if (error && error.message?.includes('enum user_role')) {
      payload.role = isMaster ? 'admin' : assignedRole === 'maker' ? 'maker' : 'customer';
      const retryResult = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.warn('Profile upsert notice:', error.message);
      return newProfile;
    }
    if (isMaster && data) {
      data.role = 'master_admin';
      data.status = 'approved';
    }
    return (data || newProfile) as UserProfile;
  } catch (err) {
    return newProfile;
  }
}

// -------------------------------------------------------------
// Master Author / Admin: User & Role Management
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
          role: 'master_admin' as const,
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

export async function updateUserRole(userId: string, role: UserRole) {
  // Defensive update: handle DB enum constraint and status column resilience
  const payload: any = { role, updated_at: new Date().toISOString() };
  let { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId);

  // If role is master_admin and enum doesn't support it yet, fallback to admin in database
  if (error && error.message?.includes('enum user_role') && role === 'master_admin') {
    const retryResult = await supabase
      .from('profiles')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('id', userId);
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.warn('Supabase profile role update notice:', error.message);
  }
  return data;
}

export async function updateUserStatus(userId: string, status: 'approved' | 'pending' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.warn('Supabase status update notice (status column may be pending migration):', error.message);
    }
    return data;
  } catch (err: any) {
    console.warn('updateUserStatus caught:', err.message);
    return null;
  }
}

export async function updateUserRoleAndStatus(
  userId: string,
  role: UserRole,
  status: 'approved' | 'pending' | 'rejected'
) {
  try {
    const payload: any = {
      role: role === 'master_admin' ? 'admin' : role, // DB enum safety
      status,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    // If status column doesn't exist yet, retry updating just role
    if (error && error.message?.includes('status')) {
      const retryResult = await supabase
        .from('profiles')
        .update({ role: payload.role, updated_at: new Date().toISOString() })
        .eq('id', userId);
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.warn('Supabase role/status update notice:', error.message);
    }
    return data;
  } catch (err: any) {
    console.warn('updateUserRoleAndStatus caught:', err.message);
    return null;
  }
}

// Maker Applications Management
export interface MakerApplicationItem {
  id: string;
  user_id: string;
  school: string;
  grade_class: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  applicant_name?: string;
  applicant_email?: string;
}

export async function fetchAllMakerApplications(): Promise<MakerApplicationItem[]> {
  try {
    const { data, error } = await supabase
      .from('maker_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table may not exist yet if migration has not been run
      return [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function reviewMakerApplication(
  appId: string,
  targetUserId: string,
  newStatus: 'approved' | 'rejected'
) {
  try {
    // 1. Update maker application record
    const { error: appErr } = await supabase
      .from('maker_applications')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', appId);

    if (appErr) {
      console.warn('Notice updating maker_applications:', appErr.message);
    }

    // 2. If approved, upgrade user's profile to 'maker' and 'approved'
    if (newStatus === 'approved') {
      await updateUserRoleAndStatus(targetUserId, 'maker', 'approved');
    }
  } catch (err: any) {
    console.warn('reviewMakerApplication caught:', err.message);
  }
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

/**
 * Universal image processor for device uploads:
 * 1. Tries Supabase Storage bucket first.
 * 2. If storage bucket is not configured or throws an error, compresses the file
 *    using HTML5 Canvas into a lightweight, high-fidelity base64 Data URL so
 *    the picture persists seamlessly across browser reloads and sessions.
 */
export async function processAndUploadImage(file: File, bucket = 'cms-assets'): Promise<string> {
  try {
    const publicUrl = await uploadImageToBucket(file, bucket);
    if (publicUrl && publicUrl.startsWith('http')) {
      return publicUrl;
    }
  } catch (err) {
    // Graceful fallback to client-side compressed base64
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        return reject(new Error('Empty file content'));
      }

      const img = new Image();
      img.onerror = () => resolve(result); // Fallback to raw data url
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(result);
        }

        ctx.drawImage(img, 0, 0, width, height);
        // High quality JPEG compression (keeps size ~80-160KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.84);
        resolve(compressedDataUrl);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// Platform Settings (Customizable Earning Percent)
// -------------------------------------------------------------
export async function fetchPlatformSettings(): Promise<{ makerEarningPercent?: number } | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'platform_settings')
      .single();

    if (error || !data) return null;
    return data.value;
  } catch (err) {
    return null;
  }
}

export async function savePlatformSettings(settings: { makerEarningPercent: number }): Promise<void> {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: 'platform_settings',
          value: settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn('Notice saving platform_settings to Supabase:', error.message);
    }
  } catch (err: any) {
    console.warn('savePlatformSettings error:', err.message);
  }
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
