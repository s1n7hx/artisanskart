'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

export const MASTER_ADMIN_EMAIL = 'ssumollah@gmail.com';

export interface ApplicationRecord {
  id: string;
  user_id: string;
  school: string;
  grade_class: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  applicant_email?: string;
  applicant_name?: string;
}

/**
 * Fetch all pending maker applications with applicant profile info.
 * Enforces server-side administrator check.
 */
export async function getPendingApplications(): Promise<ApplicationRecord[]> {
  const supabase = await createClient();

  // Server-side authentication check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Please sign in as administrator.');
  }

  const userEmail = user.email?.toLowerCase() || '';
  const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL.toLowerCase();

  // Query profile role from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  const isAdmin = isMasterAdmin || (profile?.role === 'admin' && profile?.status === 'approved');
  if (!isAdmin) {
    throw new Error('Forbidden: Only platform administrators can view maker applications.');
  }

  // Fetch pending applications
  const { data, error } = await supabase
    .from('maker_applications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maker applications:', error.message);
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch profile details for the applicant user IDs
  const userIds = Array.from(new Set(data.map((app) => app.user_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', userIds);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  return data.map((app) => {
    const applicant = profileMap.get(app.user_id);
    return {
      ...app,
      applicant_email: applicant?.email || 'Unknown email',
      applicant_name: applicant?.full_name || 'Student Applicant',
    };
  });
}

/**
 * Approve a maker application and promote the applicant to 'maker'.
 * Strict server-side verification that caller is an admin.
 */
export async function approveApplication(applicationId: string, applicantUserId: string) {
  const supabase = await createClient();

  // 1. Verify caller session server-side
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Session expired or invalid.');
  }

  // 2. Verify caller is an administrator in public.profiles
  const isMasterAdmin = user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  const isAdmin = isMasterAdmin || (callerProfile?.role === 'admin' && callerProfile?.status === 'approved');
  if (!isAdmin) {
    throw new Error('Forbidden: Only administrators can approve applications.');
  }

  const now = new Date().toISOString();
  // Use service-role client if configured, otherwise use admin-authenticated server client
  const clientToUse = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

  // A. Update application status
  const { error: appUpdateError } = await clientToUse
    .from('maker_applications')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: now,
    })
    .eq('id', applicationId);

  if (appUpdateError) {
    throw new Error(`Failed to update application status: ${appUpdateError.message}`);
  }

  // B. Update applicant profile to 'maker' (and approved status)
  const { error: roleUpdateError } = await clientToUse
    .from('profiles')
    .update({
      role: 'maker',
      status: 'approved',
      updated_at: now,
    })
    .eq('id', applicantUserId);

  if (roleUpdateError) {
    throw new Error(`Failed to update applicant role to maker: ${roleUpdateError.message}`);
  }

  return { success: true, message: 'Application approved. Applicant has been promoted to Maker.' };
}

/**
 * Reject a maker application without altering applicant role.
 * Strict server-side verification that caller is an admin.
 */
export async function rejectApplication(applicationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Session expired or invalid.');
  }

  const isMasterAdmin = user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  const isAdmin = isMasterAdmin || (callerProfile?.role === 'admin' && callerProfile?.status === 'approved');
  if (!isAdmin) {
    throw new Error('Forbidden: Only administrators can reject applications.');
  }

  const clientToUse = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

  const { error: appUpdateError } = await clientToUse
    .from('maker_applications')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  if (appUpdateError) {
    throw new Error(`Failed to reject application: ${appUpdateError.message}`);
  }

  return { success: true, message: 'Application marked as rejected.' };
}
