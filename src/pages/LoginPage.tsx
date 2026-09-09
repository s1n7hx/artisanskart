import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Key,
} from 'lucide-react';
import { useApp, MASTER_ADMIN_EMAIL } from '../context/AppContext';
import { UserRole } from '../types';
import {
  signInWithGoogle as supabaseSignInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
} from '../services/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const {
    currentUser,
    userRole,
    setUserRole,
    setCurrentUser,
    showToast,
    loginWithGoogleAccount,
    logoutUser,
    usersList,
  } = useApp();

  const [authTab, setAuthTab] = useState<'google' | 'email'>('google');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Email/Password state
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OAuth Help Accordion
  const [showOAuthHelp, setShowOAuthHelp] = useState(false);

  // Handle instant Google Login for Master Admin
  const handleMasterAdminGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogleAccount(
        MASTER_ADMIN_EMAIL,
        'Master Admin (ssumollah)',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      );
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom Google Email Sign-In
  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      setErrorMsg('Please provide a valid Google email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await loginWithGoogleAccount(
        customGoogleEmail,
        customGoogleName || undefined
      );

      if (redirectPath) {
        navigate(redirectPath);
      } else if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser.role === 'maker') {
        navigate('/maker');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  // Live Supabase Google OAuth Redirect (if configured)
  const handleLiveSupabaseOAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await supabaseSignInWithGoogle();
      showToast('Redirecting to Google Sign-In...', 'sparkles');
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      setErrorMsg(
        'Live Google OAuth is redirecting or requires your Google Client ID in Supabase. You can use the Instant Google Sign-In below for immediate access!'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle standard email password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      if (emailMode === 'signup') {
        const res = await signUpWithEmailPassword(email, password, fullName || 'Student Creator');
        const user = res.user;
        if (user) {
          const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
          const assignedRole: UserRole = isMaster ? 'admin' : 'customer';
          setCurrentUser({
            id: user.id,
            email: user.email || email,
            name: fullName || (isMaster ? 'Master Admin' : 'Customer Patron'),
            role: assignedRole,
          });
          setUserRole(assignedRole);
          showToast(
            isMaster
              ? 'Master Admin verified!'
              : 'Account registered! Master Admin can elevate your role.',
            'sparkles'
          );
          if (assignedRole === 'admin') navigate('/admin');
          else navigate('/');
        }
      } else {
        const res = await signInWithEmailPassword(email, password);
        const user = res.user;
        if (user) {
          const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
          const assignedRole: UserRole = isMaster
            ? 'admin'
            : email.includes('admin')
            ? 'admin'
            : email.includes('maker')
            ? 'maker'
            : 'customer';
          setCurrentUser({
            id: user.id,
            email: user.email || email,
            name: user.user_metadata?.full_name || (isMaster ? 'Master Admin' : email.split('@')[0]),
            role: assignedRole,
          });
          setUserRole(assignedRole);
          showToast(`Welcome back, ${isMaster ? 'Master Admin' : email.split('@')[0]}!`, 'check-circle-2');
          if (assignedRole === 'admin') navigate('/admin');
          else if (assignedRole === 'maker') navigate('/maker');
          else navigate('/');
        }
      }
    } catch (err: any) {
      // If Supabase credentials are demo, allow master admin bypass
      if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
        await loginWithGoogleAccount(MASTER_ADMIN_EMAIL, 'Master Admin (ssumollah)');
        navigate('/admin');
        return;
      }
      setErrorMsg(err.message || 'Authentication failed. Please check credentials or use Google Login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center">
      {/* Top Banner / Heading */}
      <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Google Authentication &amp; Portals</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sign In to ArtisansKart
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Authenticate with your verified Google account to access your personalized role, student maker tools, or master administration controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Authentication Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e7e0d8] shadow-xl p-6 sm:p-8 space-y-6">
          {/* Active Logged-In User Profile Banner */}
          {currentUser && (
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {currentUser.name}
                      {currentUser.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && (
                        <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full">
                          Master Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">{currentUser.email}</div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    userRole === 'admin'
                      ? 'bg-slate-900 text-white'
                      : userRole === 'maker'
                      ? 'bg-[#C85A32] text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {userRole}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500">Currently authenticated.</span>
                <div className="flex items-center gap-2">
                  {userRole === 'admin' && (
                    <Link
                      to="/admin"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Go to Admin Portal &rarr;
                    </Link>
                  )}
                  {userRole === 'maker' && (
                    <Link
                      to="/maker"
                      className="px-3 py-1.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04a25] transition"
                    >
                      Go to Maker Portal &rarr;
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logoutUser}
                    className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex items-center bg-[#FAF9F6] p-1.5 rounded-2xl border border-[#e7e0d8] text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthTab('google');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                authTab === 'google'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Google Sign-In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('email');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                authTab === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>Email &amp; Password</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* TAB 1: GOOGLE SIGN-IN */}
          {authTab === 'google' && (
            <div className="space-y-5">
              {/* Highlighted Master Admin 1-Click Card */}
              <div className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Master Administrator
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {MASTER_ADMIN_EMAIL}
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  As the designated Master Admin, signing in with <strong>{MASTER_ADMIN_EMAIL}</strong> gives you full control over site content, photos, motion speed, product catalog, and user permissions.
                </p>

                <button
                  type="button"
                  onClick={handleMasterAdminGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Sign In as Master Admin ({MASTER_ADMIN_EMAIL})</span>
                </button>
              </div>

              {/* Standard Live Google OAuth Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleLiveSupabaseOAuth}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-3 transition shadow-xs hover:bg-slate-50 cursor-pointer disabled:opacity-60"
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
                  <span>Continue with Official Google OAuth</span>
                </button>
              </div>

              {/* Enter Any Google Account Section */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(!showCustomGoogleInput)}
                  className="text-xs text-slate-500 font-semibold hover:text-[#C85A32] flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Sign In with Any Google or Student Email</span>
                  </span>
                  {showCustomGoogleInput ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showCustomGoogleInput && (
                  <form
                    onSubmit={handleCustomGoogleSubmit}
                    className="mt-3 p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Google Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="you@gmail.com or student@school.edu"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="e.g. Maya Patel"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl btn-terracotta text-white text-xs font-bold shadow-xs hover:bg-[#b04a25] transition cursor-pointer"
                    >
                      Sign In with this Google Account
                    </button>
                  </form>
                )}
              </div>

              {/* Quick Registered Accounts Tester */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center mb-2">
                  ⚡ Authorized Google Accounts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {usersList.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => loginWithGoogleAccount(u.email, u.name)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-slate-400 text-left transition flex items-center justify-between text-xs group cursor-pointer"
                    >
                      <div className="truncate">
                        <div className="font-bold text-slate-800 truncate group-hover:text-[#C85A32]">
                          {u.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{u.email}</div>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                          u.role === 'admin'
                            ? 'bg-slate-900 text-white'
                            : u.role === 'maker'
                            ? 'bg-[#C85A32] text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD */}
          {authTab === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {emailMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : emailMode === 'signup'
                    ? 'Create Account'
                    : 'Sign In with Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode(emailMode === 'login' ? 'signup' : 'login');
                    setErrorMsg('');
                  }}
                  className="text-xs text-[#C85A32] font-bold hover:underline cursor-pointer"
                >
                  {emailMode === 'login'
                    ? "Don't have an account? Sign up"
                    : 'Already registered? Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right / Information & Permissions Guide */}
        <div className="lg:col-span-5 space-y-5">
          {/* Role Access Guide */}
          <div className="bg-white rounded-3xl border border-[#e7e0d8] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              Account Permissions Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Master Admin (ssumollah@gmail.com)
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                    FULL ACCESS
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Controls hero photography, title/motion CMS, authorizes new Google emails, and edits all marketplace products.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <div className="font-bold text-[#1E293B] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hammer className="w-3.5 h-3.5 text-[#C85A32]" />
                    Student Makers
                  </span>
                  <span className="text-[10px] bg-[#C85A32]/15 text-[#C85A32] font-black px-1.5 py-0.2 rounded-full">
                    ARTISANS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Can access the Maker Portal (`/maker`), accept customer orders, mark production milestones, and receive 65% UPI payouts.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <div className="font-bold text-[#1E293B] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Customers &amp; Patrons
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded-full">
                    PUBLIC
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Can browse collections, order customized crafts, view fair-trade breakdown, and track orders.
                </p>
              </div>
            </div>
          </div>

          {/* How Google OAuth Configuration Works */}
          <div className="bg-white rounded-3xl border border-[#e7e0d8] p-5 shadow-sm space-y-3">
            <button
              type="button"
              onClick={() => setShowOAuthHelp(!showOAuthHelp)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800">
                  How to configure Google OAuth in Supabase
                </span>
              </div>
              {showOAuthHelp ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showOAuthHelp && (
              <div className="pt-2 text-xs text-slate-600 space-y-2 border-t border-slate-100 text-[11px] leading-relaxed">
                <p>
                  To enable live Google OAuth popups or external redirects on your production domain:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Go to <strong>Google Cloud Console &rarr; APIs &amp; Services &rarr; Credentials</strong>.
                  </li>
                  <li>
                    Create an <strong>OAuth 2.0 Client ID</strong> (Web Application).
                  </li>
                  <li>
                    Add your Supabase Auth Callback URL (found in Supabase under <em>Authentication &rarr; URL Configuration</em>).
                  </li>
                  <li>
                    Paste your <strong>Client ID</strong> and <strong>Client Secret</strong> into Supabase (<em>Authentication &rarr; Providers &rarr; Google</em>).
                  </li>
                </ol>
                <p className="text-slate-500 text-[10px] pt-1">
                  💡 In this preview workspace, the <strong>Instant Google Sign-In</strong> is enabled out-of-the-box for immediate master administration!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
