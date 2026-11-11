import React, { useState } from 'react';
import {
  Mail,
  Clock,
  Sparkles,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Store,
  Package,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { submitContactInquiry, ContactSubmissionPayload } from '../services/supabase';
import { SEO } from '../components/SEO';

type DepartmentType = 'buyer_support' | 'partnerships';

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeDepartment, setActiveDepartment] = useState<DepartmentType>('buyer_support');

  // Buyer Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerOrderNumber, setBuyerOrderNumber] = useState('');
  const [buyerCategory, setBuyerCategory] = useState('Order Tracking / Delivery');
  const [buyerSubject, setBuyerSubject] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');

  // Partner Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerStudio, setPartnerStudio] = useState('');
  const [partnerCraft, setPartnerCraft] = useState('Clay Crafts & Pottery');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerSubject, setPartnerSubject] = useState('');
  const [partnerMessage, setPartnerMessage] = useState('');

  // Spam trap honeypot
  const [botTrap, setBotTrap] = useState('');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    inquiryId: string;
    department: string;
    departmentEmail: string;
    emailSent: boolean;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (botTrap) {
      setErrorMessage('Submission rejected.');
      return;
    }

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerSubject.trim() || !buyerMessage.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, Subject, and Message).');
      return;
    }

    if (buyerMessage.trim().length < 10) {
      setErrorMessage('Please provide a message with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: ContactSubmissionPayload = {
        department: 'buyer_support',
        name: buyerName.trim(),
        email: buyerEmail.trim().toLowerCase(),
        phone: buyerPhone.trim() || undefined,
        orderNumber: buyerOrderNumber.trim() || undefined,
        subject: `[${buyerCategory}] ${buyerSubject.trim()}`,
        message: buyerMessage.trim(),
        website_trap: botTrap || undefined,
      };

      const result = await submitContactInquiry(payload);

      if (result.success && result.inquiryId) {
        setSubmitSuccess({
          inquiryId: result.inquiryId,
          department: 'Support & Buyer Support',
          departmentEmail: result.departmentEmail || 'hello@artisanskart.in',
          emailSent: !!result.emailSent,
          message: result.message || 'Your inquiry has been received by our support team.',
        });
        showToast('Inquiry submitted successfully!', 'check-circle');
        // Reset form
        setBuyerName('');
        setBuyerEmail('');
        setBuyerPhone('');
        setBuyerOrderNumber('');
        setBuyerSubject('');
        setBuyerMessage('');
      } else {
        setErrorMessage(result.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (botTrap) {
      setErrorMessage('Submission rejected.');
      return;
    }

    if (!partnerName.trim() || !partnerEmail.trim() || !partnerSubject.trim() || !partnerMessage.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, Subject, and Message).');
      return;
    }

    if (partnerMessage.trim().length < 10) {
      setErrorMessage('Please provide a message with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: ContactSubmissionPayload = {
        department: 'partnerships',
        name: partnerName.trim(),
        email: partnerEmail.trim().toLowerCase(),
        phone: partnerPhone.trim() || undefined,
        studioName: partnerStudio.trim() || undefined,
        craftSpecialty: partnerCraft,
        subject: `[Guild Partnership] ${partnerSubject.trim()}`,
        message: partnerMessage.trim(),
        website_trap: botTrap || undefined,
      };

      const result = await submitContactInquiry(payload);

      if (result.success && result.inquiryId) {
        setSubmitSuccess({
          inquiryId: result.inquiryId,
          department: 'Studio & Guild Partnerships',
          departmentEmail: result.departmentEmail || 'partners@artisanskart.in',
          emailSent: !!result.emailSent,
          message: result.message || 'Your partnership proposal has been received by our guild team.',
        });
        showToast('Partnership proposal submitted!', 'sparkles');
        // Reset form
        setPartnerName('');
        setPartnerEmail('');
        setPartnerStudio('');
        setPartnerPhone('');
        setPartnerSubject('');
        setPartnerMessage('');
      } else {
        setErrorMessage(result.error || 'Failed to submit proposal. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      <SEO
        title="Contact Us & Artisan Guild Partnerships | ArtisansKart"
        description="Contact ArtisansKart for customer support, order tracking, and artisan studio partnerships. Dedicated assistance for buyers and independent makers across India."
        canonicalPath="/contact"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <span>Artisan Concierge</span>
          <span aria-hidden="true">·</span>
          <span>Pan-India Studio Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E293B] tracking-tight">
          Direct Channels &amp; Inquiries
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Connect directly with our dedicated buyer support team or initiate an artisan atelier partnership. Inquiries are handled by human studio coordinators.
        </p>
      </div>

      {/* Two Department Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Department 1: Support & Buyer Support */}
        <div
          onClick={() => {
            setActiveDepartment('buyer_support');
            setSubmitSuccess(null);
          }}
          className={`rounded-3xl p-6 sm:p-8 border transition cursor-pointer flex flex-col justify-between ${
            activeDepartment === 'buyer_support'
              ? 'bg-white border-[#C85A32] shadow-md ring-1 ring-[#C85A32]'
              : 'bg-white border-[#e7e0d8] hover:border-slate-400 shadow-xs'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-1 rounded-full">
                Active Desk
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B]">Support &amp; Buyer Support</h2>
              <p className="text-xs text-slate-500 mt-1">
                For customer questions, orders, payments, delivery, and returns.
              </p>
            </div>

            <div className="pt-2 border-t border-[#e7e0d8] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Mail className="w-4 h-4 text-[#C85A32] shrink-0" />
                <a
                  href="mailto:hello@artisanskart.in"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline text-[#1E293B] font-bold text-sm"
                >
                  hello@artisanskart.in
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Average reply time under 4 hours (9 AM – 6 PM IST)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full py-2.5 text-xs font-bold text-[#C85A32] bg-[#C85A32]/10 hover:bg-[#C85A32] hover:text-white rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Support Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Department 2: Studio & Guild Partnerships */}
        <div
          onClick={() => {
            setActiveDepartment('partnerships');
            setSubmitSuccess(null);
          }}
          className={`rounded-3xl p-6 sm:p-8 border transition cursor-pointer flex flex-col justify-between ${
            activeDepartment === 'partnerships'
              ? 'bg-white border-[#C85A32] shadow-md ring-1 ring-[#C85A32]'
              : 'bg-white border-[#e7e0d8] hover:border-slate-400 shadow-xs'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#5c6a58]/10 flex items-center justify-center text-[#5c6a58]">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c6a58] bg-[#5c6a58]/10 px-2.5 py-1 rounded-full">
                Artisan Guild
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B]">Studio &amp; Guild Partnerships</h2>
              <p className="text-xs text-slate-500 mt-1">
                For independent ateliers, artisans, and maker collectives.
              </p>
            </div>

            <div className="pt-2 border-t border-[#e7e0d8] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Mail className="w-4 h-4 text-[#5c6a58] shrink-0" />
                <a
                  href="mailto:partners@artisanskart.in"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline text-[#1E293B] font-bold text-sm"
                >
                  partners@artisanskart.in
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0" />
                <span>Dedicated atelier onboarding &amp; zero upfront fees</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full py-2.5 text-xs font-bold text-[#5c6a58] bg-[#5c6a58]/10 hover:bg-[#5c6a58] hover:text-white rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Partnership Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Central Hub & Fulfillment Info */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#FAF9F6] border border-[#e7e0d8] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/10 flex items-center justify-center text-slate-800">
              <MapPin className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1E293B]">Central Dispatch &amp; Hub</h2>
              <p className="text-xs text-slate-500 mt-1">
                QC, packaging standardization, and secure transit routing.
              </p>
            </div>

            <div className="pt-2 border-t border-[#e7e0d8] space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Studio 4B, Artisan Enclave, Delhi 110007, India
              </p>
              <div className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>NimbusPost Pan-India Courier Network</span>
              </div>
            </div>
          </div>

          <div className="pt-4 text-xs text-slate-400">
            Operating Hours: Monday – Saturday (9:00 AM – 6:00 PM IST)
          </div>
        </div>
      </div>

      {/* Main Interactive Contact Section */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-[#e7e0d8] shadow-sm p-6 sm:p-10 lg:p-12">
        {/* Form Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#e7e0d8]">
          <div>
            <h2 className="text-2xl font-black text-[#1E293B]">
              {activeDepartment === 'buyer_support'
                ? 'Customer & Buyer Support Form'
                : 'Studio & Guild Partnership Proposal'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {activeDepartment === 'buyer_support'
                ? 'Submissions route directly to hello@artisanskart.in and are logged for swift dispatch.'
                : 'Submissions route directly to partners@artisanskart.in for artisan guild evaluation.'}
            </p>
          </div>

          {/* Department Switcher */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveDepartment('buyer_support');
                setSubmitSuccess(null);
                setErrorMessage(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeDepartment === 'buyer_support'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buyer Support
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDepartment('partnerships');
                setSubmitSuccess(null);
                setErrorMessage(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeDepartment === 'partnerships'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Studio Partnerships
            </button>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {submitSuccess && (
          <div className="mt-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-black text-base text-emerald-900">
                  Inquiry Received &amp; Registered
                </h3>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  {submitSuccess.message}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-200 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 font-bold block">Inquiry ID</span>
                <span className="font-mono text-slate-800">{submitSuccess.inquiryId}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 font-bold block">Department</span>
                <span className="text-slate-800 font-semibold">{submitSuccess.department}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 font-bold block">Target Inbox</span>
                <span className="text-slate-800 font-semibold">{submitSuccess.departmentEmail}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSubmitSuccess(null)}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Send Another Message &rarr;
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Error submitting form: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Hidden Spam Trap Honeypot (bot defense) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_trap">Leave this blank</label>
          <input
            id="website_trap"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
          />
        </div>

        {/* Form 1: Buyer Support */}
        {activeDepartment === 'buyer_support' && (
          <form onSubmit={handleBuyerSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Your Full Name <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Email Address <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="e.g. radhika@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Inquiry Topic
                </label>
                <select
                  value={buyerCategory}
                  onChange={(e) => setBuyerCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white focus:border-[#C85A32] focus:outline-hidden font-medium"
                >
                  <option value="Order Tracking / Delivery">Order Tracking &amp; Courier Delivery</option>
                  <option value="Payment / Razorpay Verification">Payment &amp; UPI Verification</option>
                  <option value="Packaging & Gift Notes">Eco Packaging &amp; Custom Gift Notes</option>
                  <option value="Damaged in Transit / Return">Transit Damage &amp; Replacement</option>
                  <option value="Custom Artisan Request">Custom / Bulk Artisan Commission</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Order Number (If applicable)
                </label>
                <input
                  type="text"
                  value={buyerOrderNumber}
                  onChange={(e) => setBuyerOrderNumber(e.target.value)}
                  placeholder="e.g. AK-1042 or #28775"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Subject <span className="text-[#C85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={buyerSubject}
                onChange={(e) => setBuyerSubject(e.target.value)}
                placeholder="Brief summary of your question or order"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Your Message <span className="text-[#C85A32]">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={buyerMessage}
                onChange={(e) => setBuyerMessage(e.target.value)}
                placeholder="Provide as much context as possible (order date, delivery address, questions for the artisan)..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Routed to <strong className="text-slate-800">hello@artisanskart.in</strong> · Average reply within 4 hours
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#C85A32] hover:bg-[#b04a25] disabled:opacity-60 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Buyer Support</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Form 2: Studio & Guild Partnerships */}
        {activeDepartment === 'partnerships' && (
          <form onSubmit={handlePartnerSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Artisan / Lead Contact Name <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Master Craftsman Ramesh"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Official Email Address <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="e.g. ramesh@jaipurbluepottery.in"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Studio Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="e.g. +91 94140 12345"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Studio / Guild / Atelier Name
                </label>
                <input
                  type="text"
                  value={partnerStudio}
                  onChange={(e) => setPartnerStudio(e.target.value)}
                  placeholder="e.g. Jaipur Traditional Glaze Atelier"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Primary Craft Medium
                </label>
                <select
                  value={partnerCraft}
                  onChange={(e) => setPartnerCraft(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white focus:border-[#C85A32] focus:outline-hidden font-medium"
                >
                  <option value="Clay Crafts & Pottery">Clay Crafts &amp; Pottery</option>
                  <option value="Crochet & Fiber Art">Crochet &amp; Fiber Art</option>
                  <option value="Hand-painted Art & Cards">Hand-painted Art &amp; Cards</option>
                  <option value="Handmade Jewelry & Beads">Handmade Jewelry &amp; Beads</option>
                  <option value="Woodcraft & Metal Carving">Woodcraft &amp; Metal Carving</option>
                  <option value="Textiles, Khadi & Macramé">Textiles, Khadi &amp; Macramé</option>
                  <option value="Other Traditional Craft">Other Traditional Craft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Proposal Headline / Subject <span className="text-[#C85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={partnerSubject}
                onChange={(e) => setPartnerSubject(e.target.value)}
                placeholder="e.g. Partnership inquiry for 25-artisan ceramic studio in Rajasthan"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Craft Background &amp; Workshop Capacity <span className="text-[#C85A32]">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={partnerMessage}
                onChange={(e) => setPartnerMessage(e.target.value)}
                placeholder="Tell us about your workshop, techniques, sustainable materials, monthly crafting capacity, and portfolio web links..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden bg-white leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Routed to <strong className="text-slate-800">partners@artisanskart.in</strong> · Reviewed by Guild Relations
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#5c6a58] hover:bg-[#4a5647] disabled:opacity-60 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Proposal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Guild Partnership Proposal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
