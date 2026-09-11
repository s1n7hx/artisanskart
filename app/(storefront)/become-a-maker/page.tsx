'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Hammer,
  Sparkles,
  School,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Palette,
  Coins,
  Send,
} from 'lucide-react';

export default function BecomeAMakerPage() {
  const router = useRouter();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://xhzphnfzuutduztukiln.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'placeholder-anon-key';

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form inputs
  const [school, setSchool] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkUserAndApplications() {
      setIsLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setSessionUser(null);
          setIsLoading(false);
          return;
        }

        setSessionUser(user);

        // Fetch current user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);

        // Check for an existing pending or recent application
        const { data: apps, error: appError } = await supabase
          .from('maker_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!appError && apps && apps.length > 0) {
          // Check if any application is pending
          const pendingApp = apps.find((a) => a.status === 'pending');
          setExistingApplication(pendingApp || apps[0]);
        }
      } catch (err: any) {
        console.warn('Error verifying session:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserAndApplications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!sessionUser) {
      router.push('/login?redirectTo=/become-a-maker');
      return;
    }

    if (!school.trim() || !gradeClass.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Double check for any existing pending application before inserting
      const { data: pendingCheck, error: checkError } = await supabase
        .from('maker_applications')
        .select('id, status')
        .eq('user_id', sessionUser.id)
        .eq('status', 'pending');

      if (!checkError && pendingCheck && pendingCheck.length > 0) {
        setErrorMessage('You already have an application under review. Multiple pending submissions are not permitted.');
        setExistingApplication({
          status: 'pending',
          school: school,
          grade_class: gradeClass,
          created_at: new Date().toISOString(),
        });
        setIsSubmitting(false);
        return;
      }

      // 2. Insert new maker application row
      // Row Level Security ensures auth.uid() = user_id
      const { data, error } = await supabase
        .from('maker_applications')
        .insert({
          user_id: sessionUser.id,
          school: school.trim(),
          grade_class: gradeClass.trim(),
          message: message.trim(),
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSuccessMessage('Your application has been successfully submitted! Master Admin will review your craft portfolio.');
      setExistingApplication(data);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Student & Artisan Creator Program</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Apply to Become an ArtisansKart Maker
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Turn your handmade pottery, textiles, paintings, and traditional crafts into sustainable income. Retain 80% of every sale directly to your student UPI account.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e7e0d8] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Curated Creator Profile</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Showcase your school, craft heritage, and process stories to authentic patrons.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e7e0d8] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">80% Fair-Trade Payout</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Fast, direct deposits to your bank or UPI ID upon delivery confirmation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e7e0d8] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Verified Artisan Badge</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Every maker is verified by our administration team to ensure quality and authenticity.
            </p>
          </div>
        </div>

        {/* Dynamic State Handling */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 border border-[#e7e0d8] text-center space-y-2 shadow-sm">
            <Clock className="w-8 h-8 text-[#C85A32] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Checking your account status...</p>
          </div>
        ) : !sessionUser ? (
          /* State 1: User Not Logged In */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e7e0d8] shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <Hammer className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Sign in to apply</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You must be signed in with your official Google account so we can link your application and craft store to your verified identity.
              </p>
            </div>
            <Link
              href="/login?redirectTo=/become-a-maker"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <span>Sign in with Google to Apply</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : userProfile?.role === 'maker' || userProfile?.role === 'admin' ? (
          /* State 2: Already Approved Maker */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase">
                Active Artisan Maker
              </span>
              <h2 className="text-xl font-bold text-slate-900">You are already an approved Maker!</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your maker workspace is active. You can list creations, manage order dispatches, and check customer feedback directly.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/maker"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
              >
                <span>Go to Maker Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : existingApplication && existingApplication.status === 'pending' ? (
          /* State 3: Existing Pending Application */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-200 shadow-sm space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Application Under Review</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                    Status: Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your maker application was received on{' '}
                  <strong>{new Date(existingApplication.created_at).toLocaleDateString()}</strong> and is currently being evaluated by the ArtisansKart administrative team.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#e7e0d8] space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                <span className="text-slate-500">Applicant Email:</span>
                <span className="font-bold text-slate-800">{sessionUser.email}</span>
              </div>
              <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                <span className="text-slate-500">School / College:</span>
                <span className="font-bold text-slate-800">{existingApplication.school}</span>
              </div>
              <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                <span className="text-slate-500">Class / Grade:</span>
                <span className="font-bold text-slate-800">{existingApplication.grade_class}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Your Submission Statement:</span>
                <p className="italic text-slate-700 bg-white p-3 rounded-xl border border-[#e7e0d8]">
                  "{existingApplication.message}"
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                You do not need to submit again. Once approved by Master Admin, you will automatically gain access to <strong>/maker</strong>.
              </span>
            </div>
          </div>
        ) : (
          /* State 4: Application Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e7e0d8] shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Hammer className="w-5 h-5 text-[#C85A32]" />
                <span>Submit Maker Application</span>
              </h2>
              <p className="text-xs text-slate-500">
                Applying as <strong className="text-slate-700">{sessionUser.email}</strong>. Please provide accurate details.
              </p>
            </div>

            {/* Notifications */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  School, College, or Institution *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Delhi Public School, RK Puram"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grade, Class, or Department *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={gradeClass}
                    onChange={(e) => setGradeClass(e.target.value)}
                    placeholder="e.g. Class 10 (Ceramics Club) or 2nd Year Design"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Craft Description &amp; Statement *
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what handmade items you craft (pottery, hand-painted cards, macramé, indigo textiles), materials used, and why you want to sell on ArtisansKart..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6] resize-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  Minimum 20 characters describing your handmade crafts.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Application...' : 'Submit Maker Application'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
