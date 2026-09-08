import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { COLLECTIONS } from '../data';
import { useApp } from '../context/AppContext';

export const CollectionsPage: React.FC = () => {
  const stackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setActiveCategory } = useApp();

  // Sticky stacking cards scroll scale effect
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const cards = stack.querySelectorAll<HTMLDivElement>('.sticky-card');

    const onScroll = () => {
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const stickyTop = parseFloat(card.style.top) * 16;
        const progress = Math.min(Math.max((stickyTop - rect.top) / 300, 0), 1);
        const scale = 1 - progress * 0.04 * (cards.length - i);
        card.style.transform = `scale(${Math.max(scale, 0.92)})`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShopCategory = (cat: string) => {
    setActiveCategory(cat);
    navigate('/marketplace');
  };

  return (
    <div className="space-y-16 py-8">
      {/* Page Header */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 text-center pt-8">
        <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
          Curated Catalog
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-[#1E293B] mt-4 tracking-tight">
          Handcrafted Collections
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
          Thematic craft sets designed and sculpted by student artisans. Scroll through our signature stacking showcases.
        </p>
      </section>

      {/* Interactive Sticky Stacking Showcase */}
      <section className="bg-[#1E293B] rounded-3xl md:rounded-[3rem] text-white px-4 md:px-10 pt-16 pb-28 mx-2 md:mx-6 shadow-2xl">
        <div className="max-w-5xl mx-auto mb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-[#8A9A86] font-semibold">
            Interactive Stacking Cards
          </p>
          <h2 className="text-3xl md:text-5xl font-black mt-2">
            The Artisan Series
          </h2>
        </div>

        <div ref={stackRef} id="collectionsStack" className="max-w-5xl mx-auto space-y-8">
          {COLLECTIONS.map((c, i) => (
            <div
              key={c.n}
              className="sticky-card"
              style={{ top: `${6 + i * 1.75}rem` }}
            >
              <div className="rounded-[2rem] md:rounded-[2.5rem] border-2 border-white/15 bg-[#1E293B] p-5 md:p-8 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span
                      className="text-white font-black leading-none"
                      style={{ fontSize: 'clamp(2rem,6vw,56px)' }}
                    >
                      {c.n}
                    </span>
                    <div>
                      <p className="text-[#8A9A86] text-xs uppercase tracking-widest font-semibold">{c.cat}</p>
                      <h3 className="text-white text-xl md:text-3xl font-bold">{c.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => handleShopCategory(c.cat)}
                    className="btn-terracotta text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 cursor-pointer shadow-sm hover:scale-105 transition-transform"
                  >
                    <span>Shop {c.cat}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 3-Photo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[c.img1, c.img2, c.img3].map((src, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden aspect-4/3 bg-white/5 border border-white/10 group relative"
                    >
                      <img
                        src={src}
                        alt={`${c.title} craft piece ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-white text-xs font-semibold">
                          Artisan Student Original #{idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sustainable Material Pledges */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="badge-terracotta text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Conscious Materials
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] mt-2">
            What Goes Into Every Creation
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
            <h3 className="font-bold text-[#1E293B] text-base mb-2">Natural Terracotta Clay</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Locally sourced riverbed clay, fired at low thermal footprint in college kilns with food-safe non-lead glazes.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
            <h3 className="font-bold text-[#1E293B] text-base mb-2">300 GSM Cotton Rag Paper</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Tree-free handmade paper made from discarded textile cotton cuts, perfect for lightfast botanical watercolours.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
            <h3 className="font-bold text-[#1E293B] text-base mb-2">Unbleached Macramé Twine</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              100% natural jute and raw cotton cord hand-knotted without synthetic nylon binders or toxic chemical bleaches.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
            <h3 className="font-bold text-[#1E293B] text-base mb-2">Zero Plastic Enclosures</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Every package arrives secured with paper tape, natural kraft labels, and water-soluble compostable protection.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to Marketplace */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center pb-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#e7e0d8] shadow-sm">
          <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] mb-2">
            Looking for an Individual Piece?
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Browse our complete catalog with live student maker profiles, reviews, and immediate dispatch status.
          </p>
          <Link
            to="/marketplace"
            className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            <span>Explore All Marketplace Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
