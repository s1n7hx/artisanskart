import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Hammer,
  User,
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } from '../services/supabase';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    userRole,
    setUserRole,
    setCurrentUser,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'select_role'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithGoogle();
      showToast('Redirecting to Google Sign-In...', 'sparkles');
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      // If Google OAuth provider isn't configured in Supabase yet, offer friendly fallback
      setErrorMsg(
        err.message ||
          'Google Provider not yet configured in your Supabase dashboard (Authentication -> Providers -> Google). You can use instant login below!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      if (mode === 'signup') {
        const res = await signUpWithEmailPassword(email, password, name || 'Student Creator');
        const user = res.user;
        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email || email,
            name: name || 'Student Creator',
            role: 'customer',
          });
          showToast('Account created! Master Admin can now promote you to Maker.', 'sparkles');
          setIsAuthModalOpen(false);
        }
      } else {
        const res = await signInWithEmailPassword(email, password);
        const user = res.user;
        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email || email,
            name: user.user_metadata?.full_name || email.split('@')[0],
            role: email.includes('admin') ? 'admin' : 'customer',
          });
          showToast(`Welcome back, ${email.split('@')[0]}!`, 'check-circle-2');
          setIsAuthModalOpen(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSwitch = (role: 'admin' | 'maker' | 'customer') => {
    const roleProfiles = {
      admin: {
        id: 'usr_admin_1',
        email: 'admin@artisanskart.in',
        name: 'Master Admin (You)',
        role: 'admin' as const,
        school: 'Platform Headquarters',
      },
      maker: {
        id: 'usr_maker_sakib',
        email: 'sakib.maker@delhischool.edu',
        name: 'Sakib Ansari',
        role: 'maker' as const,
        school: 'DPS RK Puram (Class 10)',
      },
      customer: {
        id: 'usr_cust_priya',
        email: 'priya.customer@gmail.com',
        name: 'Priya Sharma',
        role: 'customer' as const,
        school: 'Patron / Buyer',
      },
    };

    const selected = roleProfiles[role];
    setCurrentUser(selected);
    setUserRole(role);
    showToast(`Switched active profile to ${selected.name} (${role.toUpperCase()})`, 'sparkles');
    setIsAuthModalOpen(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setUserRole('customer');
    showToast('Signed out successfully.', 'log-out');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentUser ? 'User Profile & Role' : mode === 'signup' ? 'Create an Account' : 'Welcome to ArtisansKart'}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {currentUser
              ? `Signed in as ${currentUser.email}`
              : 'Sign in to access student maker tools, track orders, or manage the site.'}
          </p>
        </div>

        {/* If user is already signed in, show profile & role management */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Active User:</span>
                <span className="text-xs font-extrabold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Email:</span>
                <span className="text-xs font-mono text-slate-700">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-500">Permission Level:</span>
                <span
                  className={`text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider ${
                    userRole === 'admin'
                      ? 'bg-slate-900 text-white'
                      : userRole === 'maker'
                      ? 'bg-[#C85A32] text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {userRole === 'admin' ? '🛡️ Master Admin' : userRole === 'maker' ? '🔨 Student Maker' : '👤 Customer'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 block text-center">
                Switch Role / Preview As
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('admin')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    userRole === 'admin' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('maker')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    userRole === 'maker' ? 'border-[#C85A32] bg-[#C85A32] text-white' : 'border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <Hammer className="w-4 h-4" />
                  <span>Maker</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('customer')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    userRole === 'customer' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-bold text-sm flex items-center justify-center gap-3 transition shadow-xs hover:bg-slate-50 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or Email Sign In
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sakib Ansari"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#C85A32] text-white font-bold text-sm hover:bg-[#b04a25] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErrorMsg('');
                }}
                className="text-xs text-[#C85A32] font-bold hover:underline"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
              </button>
            </div>

            {/* Quick Demo Role Tester */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center mb-2">
                ⚡ Instant One-Click Login
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('admin')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition"
                >
                  Master Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleSwitch('maker')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#C85A32] text-white text-[11px] font-bold hover:bg-[#b04a25] transition"
                >
                  Student Maker
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
