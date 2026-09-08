import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Scissors, Paintbrush, Gift, ArrowRight, Heart, Sparkles, School, ShieldCheck } from 'lucide-react';
import { ABOUT_TEXT } from '../data';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { setIsMakerSignupOpen } = useApp();
  const pRef = useRef<HTMLParagraphElement>(null);
  const chars = ABOUT_TEXT.split('');

  useEffect(() => {
    const p = pRef.current;
    if (!p) return;
    const spans = p.querySelectorAll<HTMLSpanElement>('span');

    const onScroll = () => {
      const rect = p.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.2;
      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      const revealCount = Math.floor(progress * spans.length);
      spans.forEach((s, i) => {
        s.style.opacity = i < revealCount ? '1' : '0.2';
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const partnerSchools = [
    { name: 'Sir J.J. School of Art', city: 'Mumbai', students: '28 Makers', craft: 'Ceramics & Printmaking' },
    { name: 'Faculty of Fine Arts (MSU)', city: 'Vadodara', students: '22 Makers', craft: 'Terracotta & Glazes' },
    { name: 'College of Art (Delhi Univ)', city: 'New Delhi', students: '34 Makers', craft: 'Botanical Illustration' },
    { name: 'Abhinav Kala Mahavidyalaya', city: 'Pune', students: '18 Makers', craft: 'Woodcraft & Macramé' },
    { name: 'Stella Maris College', city: 'Chennai', students: '19 Makers', craft: 'Handmade Stationery' },
  ];

  return (
    <div className="space-y-20 py-8">
      {/* Page Header */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center pt-8">
        <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
          Our Story &amp; Purpose
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-[#1E293B] mt-4 tracking-tight">
          Where Campus Creativity Meets Fair-Trade Support
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
          ArtisansKart was born out of a simple observation: art and design students produce remarkable, heirloom-quality handcrafts that never leave campus halls.
        </p>
      </section>

      {/* Interactive Char-by-Char Scroll Reveal Section with Floating Icons */}
      <section className="relative bg-[#FAF9F6] border-y border-[#e7e0d8] px-5 md:px-10 py-24 overflow-hidden">
        {/* Floating artisanal icons */}
        <div
          className="float-icon absolute top-10 left-[8%] md:left-[12%] text-[#C85A32] select-none pointer-events-auto p-4 rounded-2xl bg-white/80 shadow-md border border-[#e7e0d8] hover:scale-125 transition-transform"
          aria-hidden="true"
        >
          <Flower2 className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div
          className="float-icon float-delay-1 absolute top-20 right-[8%] md:right-[14%] text-[#8A9A86] select-none pointer-events-auto p-4 rounded-2xl bg-white/80 shadow-md border border-[#e7e0d8] hover:scale-125 transition-transform"
          aria-hidden="true"
        >
          <Scissors className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div
          className="float-icon float-delay-2 absolute bottom-12 left-[10%] md:left-[18%] text-[#E6A373] select-none pointer-events-auto p-4 rounded-2xl bg-white/80 shadow-md border border-[#e7e0d8] hover:scale-125 transition-transform"
          aria-hidden="true"
        >
          <Paintbrush className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div
          className="float-icon float-delay-3 absolute bottom-10 right-[10%] md:right-[16%] text-[#1E293B] select-none pointer-events-auto p-4 rounded-2xl bg-white/80 shadow-md border border-[#e7e0d8] hover:scale-125 transition-transform"
          aria-hidden="true"
        >
          <Gift className="w-8 h-8 md:w-10 md:h-10" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-xs uppercase tracking-widest text-[#C85A32] font-bold mb-4">
            Scroll to Reveal Our Manifesto
          </p>
          <p
            ref={pRef}
            id="charRevealPara"
            className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight select-none text-[#1E293B]"
          >
            {chars.map((ch, idx) => (
              <span
                key={idx}
                className="transition-opacity duration-150 inline"
                style={{ opacity: 0.2 }}
              >
                {ch}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="badge-terracotta text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Our Guiding Pillars
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#1E293B] mt-2">
            Built Differently From Commercial Marketplaces
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32] mb-6">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E293B] mb-3">65% Direct Split</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Students receive 65% of the total order value. The remaining 35% covers sustainable carton packaging, courier logistics, and verified campus drop-off hubs.
            </p>
            <div className="bg-[#FAF9F6] p-3 rounded-xl text-xs font-semibold text-slate-700">
              Direct UPI transfer every Friday upon delivery confirmation.
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#8A9A86]/20 flex items-center justify-center text-[#5c6a58] mb-6">
              <School className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E293B] mb-3">Campus Craft Studios</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              We collaborate directly with student design societies and college art clubs, setting up verified studio drop-off lockers inside campuses.
            </p>
            <div className="bg-[#FAF9F6] p-3 rounded-xl text-xs font-semibold text-slate-700">
              Partnered with 12+ premier art and design universities.
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#1E293B]/10 flex items-center justify-center text-[#1E293B] mb-6">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E293B] mb-3">Zero Plastic Pledge</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Every parcel uses honeycomb craft paper, water-activated paper tape, and plant-starch mailer bags. We leave zero toxic footprint.
            </p>
            <div className="bg-[#FAF9F6] p-3 rounded-xl text-xs font-semibold text-slate-700">
              100% compostable packaging supplied free to makers.
            </div>
          </div>
        </div>
      </section>

      {/* Partner Schools Showcase */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-3xl border border-[#e7e0d8] p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                Academic Partners
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] mt-2">
                Active Campus Partner Institutions
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Student makers enrolled across these campuses actively fulfill handcrafted orders.
              </p>
            </div>
            <button
              onClick={() => setIsMakerSignupOpen(true)}
              className="btn-terracotta text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full self-start md:self-auto cursor-pointer"
            >
              Add Your College
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerSchools.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{s.city}</span>
                    <span className="text-[#C85A32] font-semibold">{s.students}</span>
                  </div>
                  <h3 className="font-bold text-[#1E293B] text-base">{s.name}</h3>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e7e0d8]/60 text-xs text-slate-500">
                  Specialty: <span className="font-medium text-slate-700">{s.craft}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Action Section */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center pb-8">
        <div className="bg-[#1E293B] text-white rounded-3xl p-8 md:p-12 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Support the Next Generation of Makers?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base mb-8">
            Every piece arrives with a handwritten note from the student creator and details on the craft technique used.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/marketplace"
              className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-full flex items-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold px-6 py-3 rounded-full transition"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
