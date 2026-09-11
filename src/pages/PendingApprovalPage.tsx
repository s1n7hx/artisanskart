import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowLeft, Mail, LogOut, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp, MASTER_ADMIN_EMAIL } from '../context/AppContext';

export const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userRole, userStatus, logoutUser } = useApp();

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto flex flex-col justify-center items-center text-center">
      <div className="bg-white rounded-3xl border border-[#e7e0d8] shadow-xl p-8 sm:p-10 w-full space-y-6">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          {userStatus === 'rejected' ? (
            <ShieldAlert className="w-8 h-8 text-red-500" />
          ) : (
            <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900">
            {userStatus === 'rejected' ? 'Application Not Approved' : 'Account Awaiting Approval'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {userStatus === 'rejected'
              ? 'Access Request Declined'
              : 'Elevated Access Pending Master Admin Approval'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {userStatus === 'rejected'
              ? `Your application for the ${userRole.toUpperCase()} role was not approved. You can still browse and purchase from the public marketplace as a Customer.`
              : `Your account (${currentUser?.email || 'user'}) is registered as a ${userRole.toUpperCase()}, but elevated administrative or artisan permissions require verification by the Master Admin.`}
          </p>
        </div>

        {/* Account Details Box */}
        <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-left text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Logged In As:</span>
            <span className="font-extrabold text-slate-800">{currentUser?.email || 'Guest User'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Requested Role:</span>
            <span className="font-black uppercase text-[#C85A32]">{userRole}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Approval Status:</span>
            <span
              className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px] ${
                userStatus === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {userStatus}
            </span>
          </div>
        </div>

        {/* Information Callout */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs text-left space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-400">
            <Mail className="w-4 h-4" />
            <span>Master Admin Review Process</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            The platform Master Admin (<strong>{MASTER_ADMIN_EMAIL}</strong>) reviews maker portfolio submissions and co-admin privileges in the <strong>Admin &rarr; Users</strong> control dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logoutUser();
              navigate('/login');
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign In with Another Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
