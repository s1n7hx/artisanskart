import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShieldCheck,
  Shield,
  Hammer,
  LogOut,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    userRole,
    signInWithGoogle,
    logoutUser,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed.');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await logoutUser();
    setLoading(false);
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
            {currentUser ? 'Account & Session' : 'Sign in to ArtisansKart'}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {currentUser
              ? `Signed in with verified Google account`
              : 'Authenticate with Google to manage your craft portfolio, orders, or admin panel.'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* State: User Logged In */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Name:</span>
                <span className="font-extrabold text-slate-900">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Google Email:</span>
                <span className="font-mono text-slate-700">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-500">Permission:</span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    userRole === 'admin' || currentUser.email.toLowerCase() === 'ssumollah@gmail.com'
                      ? 'bg-slate-900 text-white'
                      : userRole === 'maker'
                      ? 'bg-[#C85A32] text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentUser.email.toLowerCase() === 'ssumollah@gmail.com' ? 'MASTER ADMIN' : userRole}
                </span>
              </div>
            </div>

            {(userRole === 'admin' || currentUser.email.toLowerCase() === 'ssumollah@gmail.com') && (
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  navigate('/admin');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Open Master Admin Portal</span>
              </button>
            )}

            {userRole === 'customer' && (
              <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2 text-center">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Want to sell your handmade crafts on ArtisansKart?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    navigate('/become-a-maker');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>Apply to Become a Maker</span>
                </button>
              </div>
            )}

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* State: Not Logged In - Real Google OAuth ONLY */
          <div className="space-y-4">
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
              <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Verified Sign-in:</strong> Real Google OAuth is required. Administrator privileges are granted only to allowlisted accounts.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  navigate('/login');
                }}
                className="text-[11px] text-slate-500 hover:text-[#C85A32] font-semibold underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Go to login page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
