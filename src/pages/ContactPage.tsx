import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Question');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    showToast('Message sent! Our student coordinator team will reply within 24 hours.', 'party-popper');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
          Support &amp; Community
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] mt-3">
          Contact ArtisansKart
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2 leading-relaxed">
          Have a question about an order, want to partner your college art club, or need custom student creations? We are here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Left Column: Contact Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-xs">
            <h2 className="text-xl font-bold text-[#1E293B] mb-6">Direct Channels</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Student &amp; Buyer Support
                  </h3>
                  <a
                    href="mailto:hello@artisanskart.in"
                    className="text-base font-bold text-[#1E293B] hover:text-[#C85A32] transition"
                  >
                    hello@artisanskart.in
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">Average reply time under 4 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8A9A86]/20 flex items-center justify-center text-[#5c6a58] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Campus Partnerships
                  </h3>
                  <a
                    href="mailto:campus@artisanskart.in"
                    className="text-base font-bold text-[#1E293B] hover:text-[#C85A32] transition"
                  >
                    campus@artisanskart.in
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5">For fine art clubs &amp; design depts</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1E293B]/10 flex items-center justify-center text-[#1E293B] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    Central Packaging Hub
                  </h3>
                  <p className="text-sm font-bold text-[#1E293B]">
                    Studio 4B, University Enclave
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">North Campus, New Delhi 110007</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Creator Guarantee Card */}
          <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-[#e7e0d8]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C85A32] uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span>Dedicated Maker Desk</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you are a student maker needing urgent help with packaging kits, courier pickups, or UPI settlement verification, reach our student coordinator on WhatsApp during campus hours (9 AM – 6 PM).
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#e7e0d8] shadow-xs">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Send Us a Message</h2>
            <p className="text-slate-500 text-sm mb-8">
              Fill out the details below and we will route your inquiry to the appropriate campus coordinator.
            </p>

            {submitted && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Thank you! Your message has been received. Our team will get back to you shortly.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contactName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Your Full Name *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ananya@college.edu"
                    className="w-full px-4 py-3 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactTopic" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Topic of Inquiry
                </label>
                <select
                  id="contactTopic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e7e0d8] text-sm bg-white focus:border-[#C85A32] focus:outline-hidden"
                >
                  <option value="General Question">General Question</option>
                  <option value="Order Status">Order Tracking / Status</option>
                  <option value="Student Maker Application">Student Maker Application</option>
                  <option value="Campus Partnership">College / Campus Partnership</option>
                  <option value="Bulk Gifting">Bulk / Corporate Craft Gifting</option>
                </select>
              </div>

              <div>
                <label htmlFor="contactMessage" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Your Message *
                </label>
                <textarea
                  id="contactMessage"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about what you need, your order ID, or your college art club..."
                  className="w-full px-4 py-3 rounded-xl border border-[#e7e0d8] text-sm focus:border-[#C85A32] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="btn-terracotta text-sm font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 w-full cursor-pointer shadow-sm hover:shadow-md transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
