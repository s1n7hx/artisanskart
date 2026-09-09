'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Clock, ShieldAlert, ArrowLeft, Mail, LogOut, CheckCircle2 } from 'lucide-react';

export const MASTER_ADMIN_EMAIL = 'ssumollah@gmail.com';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>('maker');
  const [status, setStatus] = useState<string>('pending');
  const [isLoading, setIsLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        setUserEmail(session.user.email || null);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setRole(profile.role || 'maker');
          setStatus(profile.status || 'pending');

          // If approved, redirect them to their respective destination
          if (profile.status === 'approved') {
            if (profile.role === 'admin') router.push('/admin');
            else if (profile.role === 'maker') router.push('/maker');
            else router.push('/');
          }
        }
      } catch (err) {
        console.error('Error checking user approval:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Clock className="w-4 h-4 animate-spin text-[#C85A32]" />
          <span>Verifying approval status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto flex flex-col justify-center items-center text-center">
      <div className="bg-white rounded-3xl border border-[#e7e0d8] shadow-xl p-8 sm:p-10 w-full space-y-6">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          {status === 'rejected' ? (
            <ShieldAlert className="w-8 h-8 text-red-500" />
          ) : (
            <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900">
            {status === 'rejected' ? 'Application Not Approved' : 'Account Awaiting Approval'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {status === 'rejected'
              ? 'Access Request Declined'
              : 'Elevated Access Pending Master Admin Approval'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {status === 'rejected'
              ? `Your application for elevated permissions was not approved. You can still browse and purchase from the storefront as a Customer.`
              : `Your account (${userEmail || 'user'}) is registered for the ${role.toUpperCase()} role, but access requires authorization by the Master Admin before entering the protected dashboard.`}
          </p>
        </div>

        {/* Account Details Box */}
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-left text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Logged In As:</span>
            <span className="font-extrabold text-slate-800">{userEmail || 'Guest User'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Requested Role:</span>
            <span className="font-black uppercase text-[#C85A32]">{role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Approval Status:</span>
            <span
              className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px] ${
                status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Information Callout */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs text-left space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-400">
            <Mail className="w-4 h-4" />
            <span>Master Admin Review Notice</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            The platform Master Admin (<strong>{MASTER_ADMIN_EMAIL}</strong>) verifies student makers and co-administrators directly from the <strong>Admin &rarr; Users & Permissions</strong> control panel. Once approved, your access unlocks automatically.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign In with Another Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
