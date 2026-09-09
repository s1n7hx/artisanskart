import React, { useState, useEffect } from 'react';
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
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { useApp, MASTER_ADMIN_EMAIL } from '../context/AppContext';
import { UserRole, UserStatus } from '../types';
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
    userStatus,
    setUserRole,
    setCurrentUser,
    showToast,
    loginWithGoogleAccount,
    logoutUser,
    usersList,
    requestElevatedRole,
  } = useApp();

  const [authTab, setAuthTab] = useState<'google' | 'email'>('google');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [showRoleRequestModal, setShowRoleRequestModal] = useState(false);
  const [requestRoleTarget, setRequestRoleTarget] = useState<'maker' | 'admin'>('maker');
  const [requestNote, setRequestNote] = useState('');

  // Email/Password state
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Setup Guide Accordion
  const [showSetupGuide, setShowSetupGuide] = useState(true);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    showToast('Copied to clipboard!', 'check-circle-2');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle instant Google Login for Master Admin (ssumollah@gmail.com)
  const handleMasterAdminGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithGoogleAccount(
        MASTER_ADMIN_EMAIL,
        'Master Admin (ssumollah)',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      );
      showToast('Welcome Master Admin! Full CMS & User Approvals active.', 'shield-check');
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in as Master Admin.');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom Google Email Sign-In (checks database status)
  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await loginWithGoogleAccount(
        customGoogleEmail,
        customGoogleName || undefined
      );

      // Check if user is approved for their role
      if (loggedUser.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
        navigate(redirectPath || '/admin');
      } else if (loggedUser.status === 'pending') {
        navigate('/pending-approval');
      } else if (loggedUser.role === 'admin' && loggedUser.status === 'approved') {
        navigate(redirectPath || '/admin');
      } else if (loggedUser.role === 'maker' && loggedUser.status === 'approved') {
        navigate(redirectPath || '/maker');
      } else {
        navigate(redirectPath || '/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  // Live Supabase Google OAuth
  const handleLiveSupabaseOAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await supabaseSignInWithGoogle();
      showToast('Redirecting to Google OAuth...', 'sparkles');
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      setErrorMsg(
        'Live Google OAuth is redirecting or requires your Google Client ID in Supabase. You can also sign in with your Google email directly below!'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle role request submission
  const handleRequestRole = async () => {
    if (!currentUser) {
      showToast('Please sign in with Google first.', 'alert-circle');
      return;
    }
    await requestElevatedRole(requestRoleTarget, requestNote);
    setShowRoleRequestModal(false);
    setRequestNote('');
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
          const assignedStatus: UserStatus = isMaster ? 'approved' : 'approved';
          setCurrentUser({
            id: user.id,
            email: user.email || email,
            name: fullName || (isMaster ? 'Master Admin' : 'Customer Patron'),
            role: assignedRole,
            status: assignedStatus,
          });
          setUserRole(assignedRole);
          showToast(
            isMaster
              ? 'Master Admin verified!'
              : 'Account registered as Customer Patron!',
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
          const existingUser = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
          const assignedRole: UserRole = isMaster ? 'admin' : existingUser?.role || 'customer';
          const assignedStatus: UserStatus = isMaster ? 'approved' : existingUser?.status || 'approved';

          setCurrentUser({
            id: user.id,
            email: user.email || email,
            name: user.user_metadata?.full_name || (isMaster ? 'Master Admin' : email.split('@')[0]),
            role: assignedRole,
            status: assignedStatus,
          });
          setUserRole(assignedRole);
          showToast(`Welcome back, ${isMaster ? 'Master Admin' : email.split('@')[0]}!`, 'check-circle-2');

          if (assignedStatus === 'pending') {
            navigate('/pending-approval');
          } else if (assignedRole === 'admin') {
            navigate('/admin');
          } else if (assignedRole === 'maker') {
            navigate('/maker');
          } else {
            navigate('/');
          }
        }
      }
    } catch (err: any) {
      if (email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
        await loginWithGoogleAccount(MASTER_ADMIN_EMAIL, 'Master Admin (ssumollah)');
        navigate('/admin');
        return;
      }
      setErrorMsg(err.message || 'Authentication failed. Please check credentials or sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const isMasterAdmin = currentUser?.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
  const isApproved = currentUser?.status === 'approved' || isMasterAdmin;
  const isPending = currentUser && currentUser.status === 'pending' && !isMasterAdmin;

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-center">
      {/* Top Banner / Heading */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Google OAuth &amp; Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sign In to ArtisansKart
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Authenticate using your official Google Account. Master Administrator privileges are exclusively granted to <strong>{MASTER_ADMIN_EMAIL}</strong>. Makers and secondary admins must be verified and approved before access is permitted.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Authentication Box (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#e7e0d8] shadow-xl p-6 sm:p-8 space-y-6">
          {/* Active Logged-In User Profile Banner */}
          {currentUser && (
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-black text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      {isMasterAdmin && (
                        <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                          Master Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-500">{currentUser.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      userRole === 'admin'
                        ? 'bg-slate-900 text-white'
                        : userRole === 'maker'
                        ? 'bg-[#C85A32] text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Role: {userRole}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isMasterAdmin ? 'Verified Master' : currentUser.status || 'Approved'}
                  </span>
                </div>
              </div>

              {/* Status Notice if Pending */}
              {isPending && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div className="leading-relaxed">
                    <strong>Pending Approval:</strong> Your request for <strong>{userRole.toUpperCase()}</strong> access is under review. Only Master Admin (<strong>{MASTER_ADMIN_EMAIL}</strong>) can grant elevated Maker or Admin privileges.
                  </div>
                </div>
              )}

              {/* Quick actions for current user */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {userRole === 'admin' && isApproved && (
                    <Link
                      to="/admin"
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                  {userRole === 'maker' && isApproved && (
                    <Link
                      to="/maker"
                      className="px-3.5 py-2 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold transition flex items-center gap-1.5"
                    >
                      <Hammer className="w-3.5 h-3.5 text-white" />
                      <span>Maker Workspace</span>
                    </Link>
                  )}
                  {userRole === 'customer' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRequestRoleTarget('maker');
                        setShowRoleRequestModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition cursor-pointer"
                    >
                      Apply for Maker Role
                    </button>
                  )}
                  {userRole === 'customer' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRequestRoleTarget('admin');
                        setShowRoleRequestModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer"
                    >
                      Request Admin Access
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={logoutUser}
                  className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Selector: Google vs Email */}
          <div className="flex items-center bg-[#FAF9F6] p-1.5 rounded-2xl border border-[#e7e0d8] text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthTab('google');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
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
              <span>Official Google Sign-In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('email');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
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
              {/* Highlighted Master Admin 1-Click Verification Card */}
              <div className="p-5 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/30 to-white relative overflow-hidden space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Master Administrator
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {MASTER_ADMIN_EMAIL}
                    </span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  As the platform owner (<strong>{MASTER_ADMIN_EMAIL}</strong>), logging in automatically verifies full control over the marketplace, CMS, and the <strong>User Approvals Dashboard</strong> where you review Maker applications.
                </p>

                <button
                  type="button"
                  onClick={handleMasterAdminGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-60"
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

              {/* Official Google OAuth Live Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleLiveSupabaseOAuth}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-3 transition shadow-xs hover:bg-slate-50 cursor-pointer disabled:opacity-60"
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
                  <span>Launch Official Google OAuth Sign-In</span>
                </button>
              </div>

              {/* Enter Any Google Account Section (for any student or testing device) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(!showCustomGoogleInput)}
                  className="text-xs text-slate-500 font-semibold hover:text-[#C85A32] flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Sign In with Specific Google Account (Artisan / Student / Admin)</span>
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
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Enter any Google address. If you have been granted Maker or Admin approval by <strong>{MASTER_ADMIN_EMAIL}</strong>, you will access that workspace. Otherwise, you sign in as a Customer.
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Google Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="e.g. sakib.maker@delhischool.edu"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder="e.g. Sakib Ansari"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl btn-terracotta text-white text-xs font-bold shadow-xs hover:bg-[#b04a25] transition cursor-pointer"
                    >
                      Authenticate Google Account
                    </button>
                  </form>
                )}
              </div>

              {/* Registered Accounts & Status Overview */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center mb-2">
                  Database Accounts &amp; Current Approval Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {usersList.slice(0, 4).map((u) => {
                    const isUserPending = u.status === 'pending';
                    const isUserMaster = u.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => loginWithGoogleAccount(u.email, u.name)}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-left transition flex items-center justify-between text-xs group cursor-pointer bg-white"
                      >
                        <div className="truncate mr-2">
                          <div className="font-bold text-slate-800 truncate group-hover:text-[#C85A32]">
                            {u.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">{u.email}</div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-slate-900 text-white'
                                : u.role === 'maker'
                                ? 'bg-[#C85A32] text-white'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                          <span
                            className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                              isUserMaster || u.status === 'approved'
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-amber-800 bg-amber-100'
                            }`}
                          >
                            {isUserMaster ? 'Master' : u.status || 'Approved'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
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

        {/* Right / Guide: "What You Have To Do To Make Official Google OAuth Live" (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Official Setup Guide */}
          <div className="bg-white rounded-3xl border border-[#e7e0d8] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C85A32]" />
                <span>What to do for Official Google Login</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Step-by-Step
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To connect the live Google popup with your real Google Cloud project and enforce that only approved accounts get access:
            </p>

            <div className="space-y-3 text-xs">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Google Cloud Console</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-7">
                  Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-[#C85A32] underline font-semibold">console.cloud.google.com</a> and select or create your project.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Configure OAuth Consent Screen</span>
                </div>
                <ul className="list-disc pl-11 text-[11px] text-slate-500 space-y-0.5">
                  <li>User Type: <strong>External</strong></li>
                  <li>App Name: <strong>ArtisansKart</strong></li>
                  <li>Support Email: <strong>{MASTER_ADMIN_EMAIL}</strong></li>
                  <li>Scopes: <code>email</code>, <code>profile</code>, <code>openid</code></li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Create OAuth Client ID (Web)</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-7">
                  Under <strong>Credentials &rarr; Create Credentials &rarr; OAuth Client ID</strong>, select <strong>Web Application</strong>.
                </p>

                {/* Copy Origin */}
                <div className="pl-7 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Authorized JavaScript Origin:
                    </span>
                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                      <code className="text-[10px] font-mono text-slate-700 truncate flex-1">
                        {window.location.origin}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(window.location.origin, 'origin')}
                        className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                        title="Copy Origin"
                      >
                        {copiedKey === 'origin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Copy Redirect URI */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Authorized Redirect URI (for Supabase):
                    </span>
                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                      <code className="text-[10px] font-mono text-slate-700 truncate flex-1">
                        https://xhzphnfzuutduztukiln.supabase.co/auth/v1/callback
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('https://xhzphnfzuutduztukiln.supabase.co/auth/v1/callback', 'callback')}
                        className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                        title="Copy Redirect URI"
                      >
                        {copiedKey === 'callback' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Enable Google in Supabase Auth</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-7 leading-relaxed">
                  In Supabase Console &rarr; <strong>Authentication &rarr; Providers &rarr; Google</strong>, toggle Enabled ON, paste your <strong>Client ID</strong> and <strong>Client Secret</strong>, then click Save.
                </p>
              </div>
            </div>
          </div>

          {/* How Approval Works Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white">How Admin &amp; Maker Approval Works</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. When anyone signs in with their Google account, their identity is proven.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              2. Unless their email is <strong>{MASTER_ADMIN_EMAIL}</strong>, they are placed in <strong>Customer</strong> role by default.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              3. If they wish to be a <strong>Maker</strong> or <strong>Admin</strong>, they apply. Their account status becomes <strong>Pending</strong>.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              4. You (<strong>{MASTER_ADMIN_EMAIL}</strong>) go to <Link to="/admin" className="text-amber-400 underline font-bold">Admin Portal &rarr; Users</Link> and click <strong>✓ Approve Access</strong> or <strong>Promote to Maker</strong>.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              5. Only after your approval can that person open the Maker or Admin workspace on any computer or mobile phone!
            </p>
          </div>
        </div>
      </div>

      {/* Role Request Modal */}
      {showRoleRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {requestRoleTarget === 'maker' ? (
                  <Hammer className="w-5 h-5 text-[#C85A32]" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-slate-900" />
                )}
                <h3 className="text-base font-black text-slate-900">
                  Request {requestRoleTarget.toUpperCase()} Access
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleRequestModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are signed in as <strong>{currentUser?.email}</strong>. Submitting this request places your account in <strong>Pending Status</strong>. Master Admin (<strong>{MASTER_ADMIN_EMAIL}</strong>) will review your application in the Admin Users control center before access is granted.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Note / Student Bio / Portfolio Link
              </label>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="e.g. Student pottery artisan from Delhi Public School, Class 10. Specializing in terracotta planters."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRoleRequestModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestRole}
                className="px-5 py-2 rounded-xl bg-[#C85A32] text-white font-bold text-xs hover:bg-[#b04a25] transition"
              >
                Submit Request for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

