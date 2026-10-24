import { createClient } from '@supabase/supabase-js';
import { HeroContent, Product, Order, UserRole, UserStatus } from '../types';
import { PRODUCTS } from '../data';

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
// Upsert default profile on auth creation
// Rules:
// 1. Master Admin ssumollah@gmail.com -> automatically receives 'master_admin' & 'approved'.
// 2. Pre-authorized emails stored in Supabase are granted their intended role ('maker' or 'admin').
// 3. Existing profile role is NEVER silently downgraded if already maker/admin/master_admin.
// 4. Normal users default to customer.
export async function ensureUserProfile(
  userId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const isMaster = cleanEmail === 'ssumollah@gmail.com';

  // 1. First try syncing through server backend with Service Role Key (bypasses RLS)
  try {
    const res = await fetch('/api/auth/sync-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email: cleanEmail, fullName, avatarUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        return {
          id: data.profile.id,
          email: data.profile.email,
          full_name: data.profile.full_name || fullName || (isMaster ? 'Master Author' : cleanEmail.split('@')[0]),
          avatar_url: data.profile.avatar_url || avatarUrl || '',
          role: isMaster ? 'master_admin' : (data.profile.role || 'customer'),
          status: 'approved',
          school: data.profile.school || (isMaster ? 'ArtisansKart Platform Headquarters' : ''),
          created_at: data.profile.created_at || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/auth/sync-profile notice:', err);
  }

  // 2. Direct Supabase fallback
  let existingProfile: UserProfile | null = null;
  try {
    const { data: existingData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (existingData) {
      existingProfile = existingData as UserProfile;
    }
  } catch (e) {}

  let assignedRole: UserRole = isMaster
    ? 'master_admin'
    : (existingProfile?.role && existingProfile.role !== 'customer' ? existingProfile.role : 'customer');

  const newProfile: UserProfile = {
    id: userId,
    email: cleanEmail,
    full_name: fullName || existingProfile?.full_name || (isMaster ? 'Master Author' : cleanEmail.split('@')[0]),
    avatar_url: avatarUrl || existingProfile?.avatar_url || '',
    role: assignedRole,
    status: 'approved',
    school: existingProfile?.school || (isMaster ? 'ArtisansKart Platform Headquarters' : ''),
    created_at: existingProfile?.created_at || new Date().toISOString(),
  };

  try {
    const dbRole = assignedRole === 'master_admin' ? 'admin' : assignedRole;
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: cleanEmail,
        full_name: newProfile.full_name,
        avatar_url: newProfile.avatar_url,
        role: dbRole,
        school: newProfile.school,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  } catch (err) {}

  return newProfile;
}

// -------------------------------------------------------------
// Master Author / Admin: User & Role Management
// -------------------------------------------------------------
export async function fetchAllProfiles(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const json = await res.json();
      if (json.users && Array.isArray(json.users)) {
        return json.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name || u.name || (u.email ? u.email.split('@')[0] : 'User'),
          avatar_url: u.avatar_url || '',
          role: (u.email || '').trim().toLowerCase() === 'ssumollah@gmail.com' ? 'master_admin' : (u.role || 'customer'),
          status: u.status || 'approved',
          school: u.school || '',
          isAuthorizedPreLogin: u.isAuthorizedPreLogin,
          created_at: u.created_at || u.updated_at || new Date().toISOString(),
        })) as UserProfile[];
      }
    }
  } catch (e) {
    console.warn('API fetchAllProfiles notice:', e);
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const list = data || [];
    return list.map((p) => {
      const isMaster = (p.email || '').trim().toLowerCase() === 'ssumollah@gmail.com';
      return {
        ...p,
        role: isMaster ? ('master_admin' as const) : (p.role || 'customer'),
        status: 'approved' as const,
        school: p.school || (isMaster ? 'ArtisansKart Platform Headquarters' : ''),
      };
    });
  } catch (err) {
    console.warn('Direct profiles fetch error:', err);
    return [];
  }
}

export async function authorizeNewEmail(payload: {
  email: string;
  name?: string;
  role: UserRole;
  school?: string;
  authorized_by?: string;
}) {
  const res = await fetch('/api/admin/authorize-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to authorize email.');
  }
  return data;
}

export async function deauthorizeEmail(email: string, id?: string) {
  const res = await fetch('/api/admin/deauthorize-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to deauthorize email.');
  }
  return data;
}

export async function updateUserRole(userId: string, role: UserRole, email?: string, school?: string) {
  const res = await fetch('/api/admin/update-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId: userId, userId, email, role, school }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update user role');
  }
  return data;
}

export async function updateUserStatus(userId: string, status: 'approved' | 'pending' | 'rejected', email?: string) {
  const res = await fetch('/api/admin/update-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId: userId, userId, email, status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update status');
  }
  return data;
}

export async function updateUserRoleAndStatus(
  userId: string,
  role: UserRole,
  status: 'approved' | 'pending' | 'rejected',
  email?: string,
  school?: string
) {
  const res = await fetch('/api/admin/update-role', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId: userId, userId, email, role, status, school }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update role and status');
  }
  return data;
}

// Maker Applications Management
export interface MakerApplicationItem {
  id: string;
  user_id: string;
  applicant_name?: string;
  applicant_email: string;
  phone?: string;
  studio_name?: string;
  school?: string;
  craft_type?: string;
  category?: string;
  message?: string;
  description?: string;
  photos?: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
}

export async function submitMakerApplication(payload: {
  user_id?: string;
  applicant_id?: string;
  full_name?: string;
  applicant_name?: string;
  email?: string;
  applicant_email?: string;
  phone?: string;
  applicant_phone?: string;
  studio_name?: string;
  school?: string;
  craft_type?: string;
  category?: string;
  portfolio_url?: string;
  grade_class?: string;
  message?: string;
  description?: string;
  photos?: string[];
}) {
  const normalizedPayload = {
    user_id: payload.user_id || payload.applicant_id,
    full_name: payload.full_name || payload.applicant_name,
    email: payload.email || payload.applicant_email,
    phone: payload.phone || payload.applicant_phone || '',
    studio_name: payload.studio_name || payload.school || 'Independent Studio',
    craft_type: payload.craft_type || payload.category || 'Handicrafts',
    message: payload.message || payload.description || '',
    photos: payload.photos || [],
  };

  const res = await fetch('/api/maker-applications/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizedPayload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit maker application.');
  }

  return data.application;
}

export async function fetchAllMakerApplications(): Promise<MakerApplicationItem[]> {
  try {
    const res = await fetch('/api/maker-applications');
    if (res.ok) {
      const data = await res.json();
      if (data.applications && Array.isArray(data.applications)) {
        return data.applications;
      }
    }
  } catch (e) {
    console.warn('API fetchAllMakerApplications notice:', e);
  }

  try {
    const { data, error } = await supabase
      .from('maker_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  } catch (err) {
    console.warn('Supabase maker_applications fetch notice:', err);
  }
  return [];
}

export async function reviewMakerApplication(
  appId: string,
  targetUserId: string,
  newStatus: 'approved' | 'rejected'
) {
  const res = await fetch('/api/maker-applications/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: appId, user_id: targetUserId, status: newStatus }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update application review status');
  }
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
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `products/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanName}`;

  // Try configured bucket first
  let targetBucket = bucket;
  let { error: uploadError } = await supabase.storage
    .from(targetBucket)
    .upload(filePath, file, { upsert: true, contentType: file.type || 'image/jpeg' });

  // If target bucket failed and wasn't cms-assets, fallback attempt to cms-assets
  if (uploadError && targetBucket !== 'cms-assets') {
    targetBucket = 'cms-assets';
    const fallbackRes = await supabase.storage
      .from('cms-assets')
      .upload(filePath, file, { upsert: true, contentType: file.type || 'image/jpeg' });
    uploadError = fallbackRes.error;
  }

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
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
  // 1. Try server API endpoint (uses service role key)
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.success && Array.isArray(serverData.products)) {
        return serverData.products;
      }
    }
  } catch (e) {}

  // 2. Client-side SDK fallback
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice fetching products from Supabase:', error.message);
      return [];
    }

    const mappedRemote = (data && !error) ? data.map((item) => {
      const gallery = Array.isArray(item.gallery_urls) && item.gallery_urls.length > 0
        ? item.gallery_urls.filter(Boolean)
        : (Array.isArray(item.gallery_images) && item.gallery_images.length > 0
          ? item.gallery_images.filter(Boolean)
          : (item.image_url ? [item.image_url] : []));
      const primary = item.image_url || gallery[0] || '';
      const allImages = Array.from(new Set([primary, ...gallery].filter(Boolean)));

      const numericId = typeof item.id === 'number' ? item.id : Math.abs(hashCode(item.id));

      return {
        id: numericId,
        uuid: item.id,
        title: item.title,
        category: item.category_name || item.category || 'Handicrafts',
        price: Number(item.price || 0),
        rating: Number(item.rating || 5.0),
        reviews: item.reviews_count || 1,
        maker: item.maker_name || 'Artisan Creator',
        cls: 'Class 10',
        school: item.maker_school || 'Fine Arts Studio',
        image: primary,
        images: allImages,
        stock: item.stock_status || 'In Stock • Made on Demand',
        description: item.description || '',
        slug: item.slug,
        makerId: item.maker_id,
        source: 'custom' as const,
      };
    }) : [];

    return mappedRemote;
  } catch (err) {
    return [];
  }
}

export async function upsertProductInSupabase(product: Product, makerId?: string) {
  const payload = {
    ...product,
    makerId: makerId || product.makerId,
  };

  // 1. Try server API endpoint with service role bypass
  try {
    const res = await fetch('/api/products/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success && data.product) {
      return [data.product];
    }

    if (data.error) {
      console.warn('❌ [Server Product Save Error]:', data.error, data.details, data.hint);
    }
  } catch (err: any) {
    console.warn('Notice calling server save product endpoint:', err.message);
  }

  // 2. Client-side SDK fallback with normalized columns
  try {
    const gallery = product.images && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);
    const primary = product.image || gallery[0] || '';
    const cleanSlug = product.slug || titleToSlug(product.title);

    const clientPayload: any = {
      title: product.title,
      slug: cleanSlug,
      description: product.description || '',
      price: Math.max(0, Number(product.price) || 0),
      category_name: product.category || 'Handicrafts',
      image_url: primary,
      gallery_urls: gallery,
      maker_name: product.maker || 'Artisan Creator',
      maker_school: product.school || 'Fine Arts Studio',
      stock_status: product.stock || 'In Stock • Made on Demand',
      rating: Number(product.rating || 5.0),
      reviews_count: Number(product.reviews || 1),
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    if (product.uuid) {
      clientPayload.id = product.uuid;
    }

    if (makerId && makerId.length === 36) {
      clientPayload.maker_id = makerId;
    }

    const { data: clientData, error } = await supabase
      .from('products')
      .upsert(clientPayload)
      .select();

    if (error) {
      console.error(`❌ [Client Supabase Product Upsert Error]: ${error.message} | Details: ${error.details} | Hint: ${error.hint}`);
      return null;
    }
    return clientData;
  } catch (err: any) {
    console.error('❌ upsertProductInSupabase client error:', err.message);
    return null;
  }
}

export async function deleteProductFromSupabase(id: number | string) {
  // 1. Try server API endpoint
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return true;
    }
  } catch (e) {}

  // 2. Client-side fallback
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Notice deleting product from Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('deleteProductFromSupabase error:', err.message);
    return false;
  }
}

function titleToSlug(title: string): string {
  return (title || 'craft').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `craft-${Date.now()}`;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export async function clearOrdersApi(mode: 'test' | 'all', email: string, confirmationText?: string) {
  const res = await fetch('/api/admin/clear-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, email, confirmationText }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to clear orders');
  }
  return data;
}

