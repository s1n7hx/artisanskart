import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase, ensureUserProfile, getEffectiveAppUrl } from '../services/supabase';
import { useApp, MASTER_ADMIN_EMAIL } from '../context/AppContext';
import { UserAccount, UserRole, UserStatus } from '../types';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statusText, setStatusText] = useState('Verifying Google OAuth credentials...');
  const [errorMsg, setErrorMsg] = useState('');
  const { setCurrentUser, setUserRole, setUserStatus, showToast } = useApp();

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const code = searchParams.get('code');
        const next = searchParams.get('next') || searchParams.get('redirectTo') || '';
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 1. If PKCE auth code is present, exchange it for session
        if (code) {
          setStatusText('Exchanging security token with Supabase...');
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.warn('Auth code exchange notice:', exchangeErr.message);
          }
        }

        // 2. Fetch authenticated user directly from Supabase session with retry polling
        setStatusText('Confirming verified identity...');
        let activeUser = null;
        for (let attempt = 0; attempt < 6; attempt++) {
          const userResult = await supabase.auth.getUser();
          if (userResult.data?.user) {
            activeUser = userResult.data.user;
            break;
          }
          const sessionResult = await supabase.auth.getSession();
          if (sessionResult.data?.session?.user) {
            activeUser = sessionResult.data.session.user;
            break;
          }
          if (attempt < 5) {
            await new Promise((resolve) => setTimeout(resolve, 350));
          }
        }

        if (!activeUser) {
          if (error) {
            const cleanErr = errorDescription || error || 'Database error saving new user';
            throw new Error(
              cleanErr.includes('Database error')
                ? `Supabase database error during sign in (${cleanErr}). The trigger function (handle_new_user) encountered a missing type or search_path issue. Please run the migration script in your Supabase SQL Editor.`
                : cleanErr
            );
          }
          throw new Error('Unable to resolve authenticated Google user. Please try signing in again.');
        }

        const email = (
          activeUser.email ||
          activeUser.user_metadata?.email ||
          ''
        ).trim().toLowerCase();

        const isMaster =
          email === MASTER_ADMIN_EMAIL.toLowerCase() ||
          email === 'ssumollah@gmail.com';

        setStatusText(isMaster ? 'Activating Master Admin privileges...' : 'Loading profile...');

        // 3. Upsert profile in Supabase profiles database table
        const profile = await ensureUserProfile(
          activeUser.id,
          isMaster ? 'ssumollah@gmail.com' : email,
          activeUser.user_metadata?.full_name ||
            activeUser.user_metadata?.name ||
            (isMaster ? 'Master Admin' : undefined),
          activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture
        );

        const assignedRole: UserRole = isMaster ? 'master_admin' : (profile.role || 'customer');
        const assignedStatus: UserStatus = isMaster ? 'approved' : (profile.status || 'approved');

        const userAccount: UserAccount = {
          id: activeUser.id,
          email: isMaster ? 'ssumollah@gmail.com' : email,
          name:
            profile.full_name ||
            activeUser.user_metadata?.full_name ||
            activeUser.user_metadata?.name ||
            (isMaster ? 'Master Author' : email.split('@')[0]),
          role: assignedRole,
          status: assignedStatus,
          school:
            profile.school ||
            (isMaster ? 'ArtisansKart Platform Headquarters' : 'Customer Patron'),
          avatarUrl:
            profile.avatar_url ||
            activeUser.user_metadata?.avatar_url ||
            activeUser.user_metadata?.picture ||
            '',
        };

        if (isMounted) {
          setCurrentUser(userAccount);
          setUserRole(assignedRole);
          setUserStatus(assignedStatus);
          try {
            localStorage.setItem('artisanskart_current_user_v1', JSON.stringify(userAccount));
          } catch (e) {}

          const safeNext = (next && next.startsWith('/') && !next.startsWith('//')) ? next : '';

          const currentAppUrl = getEffectiveAppUrl();
          console.log('[Auth Debug] Current application URL:', typeof window !== 'undefined' ? window.location.origin : '');
          console.log('[Auth Debug] Auth callback URL:', typeof window !== 'undefined' ? window.location.href : '');
          console.log('[Auth Debug] Authenticated user:', activeUser.email);
          console.log('[Auth Debug] Detected role:', assignedRole);

          let finalRedirect = '/';
          if (isMaster || assignedRole === 'master_admin' || assignedRole === 'admin') {
            finalRedirect = safeNext || '/admin';
            showToast('Master Author verified! Welcome to the Admin Portal.', 'shield-check');
          } else if (assignedRole === 'maker') {
            finalRedirect = safeNext || '/maker';
            showToast(`Welcome back, Maker ${userAccount.name}!`, 'sparkles');
          } else {
            finalRedirect = safeNext || '/';
            showToast(`Signed in successfully as ${userAccount.name}`, 'check-circle-2');
          }

          console.log('[Auth Debug] Final redirect URL:', `${currentAppUrl}${finalRedirect}`);
          navigate(finalRedirect, { replace: true });
        }
      } catch (err: any) {
        console.error('[Auth Callback Error]', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Authentication failed. Please try again.');
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, setCurrentUser, setUserRole, setUserStatus, showToast]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 bg-[#FAF9F6]">
      <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-[#e7e0d8] shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto">
          {errorMsg ? (
            <AlertCircle className="w-7 h-7 text-red-500" />
          ) : (
            <ShieldCheck className="w-7 h-7" />
          )}
        </div>

        <h2 className="text-xl font-black text-slate-900">
          {errorMsg ? 'Authentication Failed' : 'Completing Sign-In'}
        </h2>

        {errorMsg ? (
          <div className="space-y-4">
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-3 rounded-2xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04a25] transition cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">{statusText}</p>
            <div className="flex justify-center items-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#C85A32]" />
              <span>Please wait...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
