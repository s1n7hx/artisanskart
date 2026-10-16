import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, ShieldCheck, ArrowRight, Flower2, Scissors, Palette, Award, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { setIsMakerSignupOpen, makerEarningPercent } = useApp();
  const navigate = useNavigate();

  // Scroll reveal effect
  useEffect(() => {
    const onScroll = () => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('visible');
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="space-y-20 py-8">
      {/* Page Header */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center pt-8">
        <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
          Our Story &amp; Purpose
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-[#1E293B] mt-4 tracking-tight">
          Where Independent Creativity Meets Fair-Trade Support
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
          ArtisansKart was born out of a simple observation: independent makers, homemakers, and skilled artisans produce remarkable, heirloom-quality handcrafts that deserve a direct connection with appreciative patrons.
        </p>
      </section>

      {/* Interactive Floating Icons Section */}
      <section className="relative bg-[#FAF9F6] border-y border-[#e7e0d8] px-5 md:px-10 py-24 overflow-hidden">
        <div className="float-icon absolute top-10 left-[8%] md:left-[12%] text-[#C85A32] select-none pointer-events-none p-4 rounded-2xl bg-white/80 shadow-md border border-[#e7e0d8]">
          <Flower2 className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div className="float-icon absolute bottom-10 right-[8%] md:right-[12%] text-[#8A9A86] select-none pointer-events-none p-4 rounded-2xl bg-white/80 shadow-md border border-[#e7e0d8]" style={{ animationDelay: '1s' }}>
          <Scissors className="w-8 h-8 md:w-10 md:h-10" />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <span className="badge-terracotta text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Our Manifesto
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[#1E293B] leading-tight">
            "Handmade is a dialogue between human hands and patient materials."
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            In an era of mass-produced inventory and automated warehouses, ArtisansKart celebrates the slow, deliberate work of individual makers. Every crochet stitch, ceramic glaze, and watercolor stroke carries the distinct signature of its creator.
          </p>
        </div>
      </section>

      {/* Three Guiding Pillars */}
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
            <h3 className="text-2xl font-bold text-[#1E293B] mb-3">{makerEarningPercent}% Direct Split</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Creators receive {makerEarningPercent}% of the total order value. The remaining {100 - makerEarningPercent}% covers sustainable carton packaging, courier logistics, and secure platform fulfillment.
            </p>
            <div className="bg-[#FAF9F6] p-3 rounded-xl text-xs font-semibold text-slate-700">
              Direct transfer upon delivery confirmation.
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#8A9A86]/20 flex items-center justify-center text-[#5c6a58] mb-6">
              <Palette className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E293B] mb-3">Independent Craft Focus</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              We collaborate directly with independent makers, home crafters, and skilled artisans, providing a dedicated digital showcase for their handmade originals.
            </p>
            <div className="bg-[#FAF9F6] p-3 rounded-xl text-xs font-semibold text-slate-700">
              Supporting independent makers pan-India.
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
              100% compostable packaging supplied to creators.
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Action Section */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center pb-8">
        <div className="bg-[#1E293B] text-white rounded-3xl p-8 md:p-12 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Support Independent Makers &amp; Artisans?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base mb-8">
            Every piece arrives with details on the craft technique used and direct credit to the independent maker.
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
