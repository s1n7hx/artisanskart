import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase, submitMakerApplication } from '../services/supabase';
import { MultiImageUploader } from '../components/MultiImageUploader';
import { maskEmail } from '../types';
import {
  Hammer,
  Sparkles,
  Phone,
  Mail,
  User,
  Palette,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Coins,
  Send,
  Image as ImageIcon,
} from 'lucide-react';

const CRAFT_CATEGORIES = [
  'Clay Crafts & Pottery',
  'Hand-painted Cards & Prints',
  'Accessories & Jewelry',
  'Keychains & Charms',
  'Crochet & Macramé',
  'Textiles & Handloom',
  'Woodwork & Carving',
  'Metalwork & Brass',
  'Other Handmade Crafts',
];

export const BecomeAMakerPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userRole, showToast, makerEarningPercent } = useApp();

  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [studioName, setStudioName] = useState('');
  const [category, setCategory] = useState(CRAFT_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [primaryPhoto, setPrimaryPhoto] = useState<string>('');

  // Sync user info if available
  useEffect(() => {
    if (currentUser?.name && !fullName) {
      setFullName(currentUser.name);
    }
    if (currentUser?.email && !email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Load existing application if user is logged in
  useEffect(() => {
    async function loadExistingApp() {
      if (!currentUser?.id && !currentUser?.email) return;
      setLoadingApp(true);
      try {
        const queryParam = currentUser?.id ? `userId=${currentUser.id}` : `email=${currentUser.email}`;
        const res = await fetch(`/api/maker-applications?${queryParam}`);
        if (res.ok) {
          const json = await res.json();
          if (json.applications && json.applications.length > 0) {
            const pending = json.applications.find((a: any) => a.status === 'pending');
            setExistingApplication(pending || json.applications[0]);
            setLoadingApp(false);
            return;
          }
        }
      } catch (e) {}

      try {
        const { data, error } = await supabase
          .from('maker_applications')
          .select('*')
          .or(`user_id.eq.${currentUser.id},applicant_email.eq.${currentUser.email}`)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const pending = data.find((a) => a.status === 'pending');
          setExistingApplication(pending || data[0]);
        }
      } catch (err: any) {
        console.warn('Could not query maker_applications:', err.message);
      } finally {
        setLoadingApp(false);
      }
    }

    loadExistingApp();
  }, [currentUser?.id, currentUser?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentUser) {
      navigate('/login?redirectTo=/become-a-maker');
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedStudio = studioName.trim();
    const trimmedMsg = message.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Phone validation (minimum 10 digits for Indian or international numbers)
    const cleanedPhone = trimmedPhone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit contact phone number.');
      return;
    }

    if (trimmedMsg.length < 20) {
      setErrorMsg('Please provide a description of your handmade craft (at least 20 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        applicant_id: currentUser.id,
        user_id: currentUser.id,
        full_name: trimmedName,
        applicant_name: trimmedName,
        email: trimmedEmail,
        applicant_email: trimmedEmail,
        phone: trimmedPhone,
        applicant_phone: trimmedPhone,
        craft_type: category,
        category: category,
        school: trimmedStudio || `${trimmedName}'s Studio`,
        studio_name: trimmedStudio || `${trimmedName}'s Studio`,
        message: trimmedMsg,
        description: trimmedMsg,
        photos: photos.filter(Boolean),
      };

      const appResult = await submitMakerApplication(payload);

      const appData = appResult || {
        ...payload,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      setExistingApplication(appData);
      setSuccessMsg('Your application has been received and forwarded to the Master Admin for review!');
      showToast('Maker application submitted!', 'sparkles');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Independent &amp; Artisan Creator Program</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Apply to Become an ArtisansKart Maker
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Showcase your handcrafted creations, pottery, textiles, and art. Receive {makerEarningPercent}% fair payouts directly to your account with zero upfront listing fees.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e7e0d8] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Curated Creator Profile</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Showcase your studio, craft heritage, and process stories to authentic patrons across India.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e7e0d8] shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">{makerEarningPercent}% Fair-Trade Payout</h3>
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
              Every maker is verified by our administrative team to ensure genuine craftsmanship.
            </p>
          </div>
        </div>

        {/* Dynamic State Handling */}
        {!currentUser ? (
          /* State 1: User Not Logged In */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e7e0d8] shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <Hammer className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Sign In to Apply</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                To submit a maker application, you must sign in first so we can verify your identity and link your application securely to your account.
              </p>
            </div>
            <Link
              to="/login?redirectTo=/become-a-maker"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-sm shadow-sm transition cursor-pointer"
            >
              <span>Sign in with Google to Apply</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : userRole === 'maker' ? (
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
                Your maker workspace is active. You can list creations, accept incoming orders, manage dispatches, and check customer feedback directly.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/maker"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
              >
                <Hammer className="w-4 h-4 text-[#C85A32]" />
                <span>Go to Maker Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : existingApplication && existingApplication.status === 'pending' ? (
          /* State 3: Existing Pending Application */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-200 shadow-sm space-y-6">
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
                  Your maker application was submitted on{' '}
                  <strong>{new Date(existingApplication.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> and is currently being evaluated by the ArtisansKart administrative team.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#e7e0d8] space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                <span className="text-slate-500">Applicant Name:</span>
                <span className="font-bold text-slate-800">{existingApplication.applicant_name || currentUser.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-bold text-slate-800">{maskEmail(existingApplication.applicant_email || currentUser.email)}</span>
              </div>
              {(existingApplication.phone || existingApplication.applicant_phone) && (
                <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                  <span className="text-slate-500">Contact Phone:</span>
                  <span className="font-bold text-slate-800">{existingApplication.phone || existingApplication.applicant_phone}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                <span className="text-slate-500">Studio / Brand:</span>
                <span className="font-bold text-slate-800">{existingApplication.school || existingApplication.studio_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-[#e7e0d8] pb-2">
                <span className="text-slate-500">Craft Category:</span>
                <span className="font-bold text-[#C85A32]">{existingApplication.craft_type || existingApplication.category || existingApplication.grade_class}</span>
              </div>
              {(existingApplication.message || existingApplication.description) && (
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Your Submission Statement:</span>
                  <p className="italic text-slate-700 bg-white p-3 rounded-xl border border-[#e7e0d8]">
                    "{existingApplication.message || existingApplication.description}"
                  </p>
                </div>
              )}

              {/* Uploaded Craft Photos Preview */}
              {Array.isArray(existingApplication.photos) && existingApplication.photos.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-2 font-bold">Uploaded Craft Photos ({existingApplication.photos.length}):</span>
                  <div className="flex flex-wrap gap-2.5">
                    {existingApplication.photos.map((photoUrl: string, idx: number) => (
                      <a
                        key={idx}
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 block hover:scale-105 transition"
                      >
                        <img src={photoUrl} alt={`Craft ${idx + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Your role remains <strong>Customer</strong> while your application is under review. Once the Master Admin approves your application, your role will be updated to <strong>Maker</strong> and you will automatically gain access to <strong>/maker</strong>.
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
                Logged in as <strong className="text-slate-700">{currentUser.name}</strong> ({maskEmail(currentUser.email)}). Please complete your artisan profile details below.
              </p>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aditi Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aditi@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone Number & Studio Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used for order dispatch notifications &amp; logistics coordination.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Studio / Brand / Guild Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="e.g. Earthcraft Studio, Clay Creations"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Craft Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Craft Category *
                </label>
                <div className="relative">
                  <Palette className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6] cursor-pointer"
                  >
                    {CRAFT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Craft Description & Statement */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Craft Description &amp; Artist Statement *
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe what handmade items you craft (materials, techniques, dimensions, studio experience), and what you plan to offer on ArtisansKart..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32] bg-[#FAF9F6] resize-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Minimum 20 characters describing your craft.</span>
                  <span className={message.trim().length >= 20 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {message.trim().length} characters
                  </span>
                </div>
              </div>

              {/* Craft Photographs Uploader */}
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#e7e0d8] space-y-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-xs font-bold text-slate-800">
                    Craft Sample Photographs (Optional but Recommended)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload photos of your handmade crafts or studio pieces to help the Master Admin quickly evaluate and approve your application.
                </p>

                <MultiImageUploader
                  images={photos}
                  primaryImage={primaryPhoto}
                  onChange={(imgs, primary) => {
                    setPhotos(imgs);
                    setPrimaryPhoto(primary);
                  }}
                  maxImages={6}
                  minImages={0}
                  label="Sample Craft Pictures"
                  helperText="Upload up to 6 pictures of your crafts or workspace."
                />
              </div>

              {/* Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                <span>
                  Submitting this application does not automatically grant Maker privileges. Your application will be sent to the Master Admin for review. Once approved, your account will be upgraded to <strong>Maker</strong>.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Application...' : 'Submit Maker Application'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
