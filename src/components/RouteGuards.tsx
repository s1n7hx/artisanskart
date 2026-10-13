import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ArrowLeft, Lock, Hammer, Sparkles } from 'lucide-react';

interface GuardProps {
  children: React.ReactNode;
}

/**
 * Route guard enforcing role-based access control for Maker Portal (/maker).
 * Normal customers or unauthenticated visitors cannot access maker tools.
 * Permitted roles: maker (with approved status), admin, master_admin.
 */
export const MakerRouteGuard: React.FC<GuardProps> = ({ children }) => {
  const { currentUser, userRole, userStatus } = useApp();

  // 1. Unauthenticated users
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#e7e0d8] shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C85A32] bg-[#C85A32]/10 px-3 py-0.5 rounded-full">
            Creator Authorization
          </span>
          <h2 className="text-2xl font-black text-[#1E293B]">Maker Portal Sign In</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please sign in with your approved creator account to access your studio workshop and order management.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/login?redirectTo=/maker"
            className="w-full py-3 rounded-full btn-terracotta text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Sign In to Studio
          </Link>
          <Link
            to="/become-a-maker"
            className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-[#C85A32]" /> Apply to Become a Maker
          </Link>
          <Link
            to="/"
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-700 transition"
          >
            &larr; Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  // 2. Master Admin and Admin always have full maker capabilities
  if (userRole === 'master_admin' || userRole === 'admin') {
    return <>{children}</>;
  }

  // 3. Approved Makers
  if (userRole === 'maker' && userStatus === 'approved') {
    return <>{children}</>;
  }

  // 4. Maker application pending review
  if (userStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  // 5. Customer with no maker privileges
  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#e7e0d8] shadow-sm text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
        <Hammer className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full">
          Maker Access Restricted
        </span>
        <h2 className="text-2xl font-black text-[#1E293B]">Creator Membership Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You are currently signed in as a customer (<strong>{currentUser.email}</strong>). The Maker Portal is reserved for approved creators, artists, and crafters.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-xs text-slate-600 text-left space-y-2">
        <p className="font-bold text-slate-800">Want to sell your handcrafted pieces?</p>
        <p className="text-[11px]">
          Anyone with creative skills — crochet artists, ceramicists, painters, independent crafters — can apply to become an ArtisansKart creator.
        </p>
      </div>
      <div className="flex flex-col gap-2 pt-1">
        <Link
          to="/become-a-maker"
          className="w-full py-3 rounded-full btn-terracotta text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Submit Maker Application
        </Link>
        <Link
          to="/"
          className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          &larr; Back to Marketplace
        </Link>
      </div>
    </div>
  );
};

/**
 * Route guard enforcing role-based access control for Admin Portal (/admin).
 * Permitted roles: admin, master_admin.
 */
export const AdminRouteGuard: React.FC<GuardProps> = ({ children }) => {
  const { currentUser, userRole } = useApp();

  if (!currentUser) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (userRole !== 'admin' && userRole !== 'master_admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#e7e0d8] shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-800 bg-red-100 px-3 py-0.5 rounded-full">
            Restricted System
          </span>
          <h2 className="text-2xl font-black text-[#1E293B]">Admin Privileges Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This area is restricted to ArtisansKart administrators and the platform owner.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
