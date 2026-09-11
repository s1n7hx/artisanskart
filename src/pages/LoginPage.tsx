import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle as supabaseSignInWithGoogle } from '../services/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || searchParams.get('redirectTo') || '';

  const {
    currentUser,
    userRole,
    logoutUser,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const origin = window.location.origin;
      const callbackUrl = redirectPath
        ? `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`
        : `${origin}/auth/callback`;

      await supabaseSignInWithGoogle(callbackUrl);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(err.message || 'Failed to initialize Google Sign In');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await logoutUser();
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] bg-[#FAF9F6] text-slate-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#e7e0d8] shadow-xl">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fair-Trade Student Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to ArtisansKart
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Verify your identity securely with your official Google account to access your orders, maker workspace, or administrative controls.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Authentication notice:</strong> {errorMsg}
            </div>
          </div>
        )}

        {/* State: Already Authenticated */}
        {currentUser ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex items-center gap-3">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-full border border-slate-300 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#C85A32] text-white font-bold flex items-center justify-center text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{currentUser.name}</h3>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Active Role:</span>
                <span className="font-black uppercase px-2.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800">
                  {userRole}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="w-full py-3 px-4 rounded-2xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <span>Go to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {userRole === 'maker' && (
                <Link
                  to="/maker"
                  className="w-full py-3 px-4 rounded-2xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <span>Go to Maker Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                to="/"
                className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Browse Storefront</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* State: Not Logged In - Real Google OAuth is ONLY path */
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition cursor-pointer hover:border-slate-400 disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>OAuth Security:</strong> Real Google OAuth authentication is enforced. Administrative privileges are only unlocked if the verified Google account matches the database allowlist.
              </div>
            </div>
          </div>
        )}

        {/* Security Commitments */}
        <div className="pt-4 border-t border-[#e7e0d8] space-y-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted OAuth token exchange</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Server-enforced role allowlist authorization</span>
          </div>
        </div>
      </div>
    </div>
  );
};
