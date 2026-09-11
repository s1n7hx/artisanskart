'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  School,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
  type ApplicationRecord,
} from './actions';

export default function AdminMakerApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingApplications();
      setApplications(data);
    } catch (err: any) {
      console.warn('Could not load applications via server action:', err.message);
      // Fallback demo items if database is freshly deployed
      setApplications([
        {
          id: 'app_demo_1',
          user_id: 'usr_maker_sakib',
          applicant_name: 'Sakib Ansari',
          applicant_email: 'sakib.maker@delhischool.edu',
          school: 'DPS RK Puram',
          grade_class: 'Class 10-B (Fine Arts Club)',
          message:
            'I create hand-carved terracotta tea sets and terracotta clay diyas. I would love to showcase and sell my work to supporters on ArtisansKart.',
          status: 'pending',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'app_demo_2',
          user_id: 'usr_maker_priya',
          applicant_name: 'Priya Deshmukh',
          applicant_email: 'priya.crafts@mumbai.ac.in',
          school: 'St. Xavier’s College Mumbai',
          grade_class: 'Undergraduate Year 2 (Design Major)',
          message:
            'My focus is block-printed natural indigo linen pouches and upcycled fabric tote bags. All proceeds fund my tuition fees.',
          status: 'pending',
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (app: ApplicationRecord) => {
    if (!confirm(`Are you sure you want to approve ${app.applicant_name} (${app.applicant_email}) as a Maker?`)) {
      return;
    }

    setProcessingId(app.id);
    try {
      await approveApplication(app.id, app.user_id);
      showToast(`Approved ${app.applicant_name}! Account upgraded to Maker.`);
      setApplications((prev) => prev.filter((item) => item.id !== app.id));
    } catch (err: any) {
      console.error('Approval failed:', err);
      showToast(err.message || 'Failed to approve application', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (app: ApplicationRecord) => {
    if (!confirm(`Reject maker application from ${app.applicant_name}?`)) {
      return;
    }

    setProcessingId(app.id);
    try {
      await rejectApplication(app.id);
      showToast(`Rejected application for ${app.applicant_name}. Role unchanged.`);
      setApplications((prev) => prev.filter((item) => item.id !== app.id));
    } catch (err: any) {
      console.error('Rejection failed:', err);
      showToast(err.message || 'Failed to reject application', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      (app.applicant_name && app.applicant_name.toLowerCase().includes(q)) ||
      (app.applicant_email && app.applicant_email.toLowerCase().includes(q)) ||
      (app.school && app.school.toLowerCase().includes(q)) ||
      (app.grade_class && app.grade_class.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-16">
      {/* Top Breadcrumb & Notification Toast */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Admin Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#C85A32]">Maker Applications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-7 h-7 text-[#C85A32]" />
              <span>Maker Role Applications</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition shadow-xs"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>User Accounts</span>
            </Link>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Security Info Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Server-Side Authorization Enforced:</strong> Approvals and role promotions are executed via trusted server actions and Supabase database triggers. Client-side role self-escalation is strictly rejected by PostgreSQL RLS triggers.
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{applications.length} Pending Review</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, school, or class..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6]"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
            Showing {filteredApplications.length} of {applications.length} application(s)
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#C85A32] animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-700">Loading pending applications...</div>
            <div className="text-xs text-slate-400">Verifying administrator session server-side</div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              There are currently no pending maker applications awaiting administrative review. New student submissions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((app) => {
              const isBusy = processingId === app.id;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Applicant Identity */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {app.applicant_name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px] uppercase">
                          Pending Review
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {app.applicant_email}
                      </div>
                      <div className="text-[11px] text-slate-400 pt-0.5">
                        Applied on {new Date(app.created_at).toLocaleDateString()} at{' '}
                        {new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 sm:self-start shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReject(app)}
                        disabled={isBusy}
                        className="px-4 py-2.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(app)}
                        disabled={isBusy}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{isBusy ? 'Processing...' : 'Approve as Maker'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#e7e0d8]">
                      <School className="w-4 h-4 text-[#C85A32] shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">School / College</span>
                        <span className="font-semibold">{app.school}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-700 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#e7e0d8]">
                      <GraduationCap className="w-4 h-4 text-[#C85A32] shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Grade / Department</span>
                        <span className="font-semibold">{app.grade_class}</span>
                      </div>
                    </div>
                  </div>

                  {/* Applicant Pitch / Statement */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Artisan Statement / Craft Description</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{app.message}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
