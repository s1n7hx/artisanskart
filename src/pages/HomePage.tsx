import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Leaf, User, ShoppingCart } from 'lucide-react';
import { Hero } from '../components/Hero';
import { Marquee } from '../components/Marquee';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, addToCart, setQuickViewId, setIsMakerSignupOpen } = useApp();

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
  const starString = (rating: number) => {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  const spotlightProducts = products.slice(0, 4);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Interactive Magnet Hero */}
      <Hero
        onExploreMarketplace={() => navigate('/marketplace')}
        onOpenMakerSignup={() => setIsMakerSignupOpen(true)}
      />

      {/* Dual-row Scroll-driven Marquee */}
      <Marquee />

      {/* Three Guiding Values */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Why ArtisansKart?
          </span>
          <h2 className="fade-in text-3xl md:text-4xl font-black text-[#1E293B] mt-3">
            Every Purchase Empowers a Student's Future
          </h2>
          <p className="fade-in text-slate-500 mt-2 text-sm md:text-base">
            We bypass middlemen so high school &amp; university makers can fund their tuition and craft supplies directly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="fade-in bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32] mb-5">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">65% Student-First Earnings</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Unlike generic e-commerce taking 40-50% cuts, our student creators receive 65% of every sale directly to their student accounts.
            </p>
          </div>

          <div className="fade-in bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-[#8A9A86]/20 flex items-center justify-center text-[#5c6a58] mb-5">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">Zero Mass-Production Waste</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Products are handcrafted on demand in campus studios with non-toxic glazes, sustainable papers, and zero warehouse deadstock.
            </p>
          </div>

          <div className="fade-in bg-white rounded-3xl p-8 border border-[#e7e0d8] shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32] mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">Verified Student Verification</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every artisan is verified through institutional student IDs from partner art colleges and university design departments.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#C85A32] hover:text-[#a04321] transition group"
          >
            <span>Learn more about our mission &amp; school partners</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Featured Spotlight Creations */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="badge-terracotta text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Handmade With Care
            </span>
            <h2 className="fade-in text-3xl md:text-4xl font-black text-[#1E293B] mt-2">
              Spotlight Student Creations
            </h2>
            <p className="fade-in text-slate-500 mt-1 text-sm md:text-base">
              Hand-picked originals currently being crafted across partner studios.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 btn-terracotta text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full self-start md:self-auto"
          >
            <span>View Full Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spotlightProducts.map((p) => (
            <div
              key={p.id}
              className="fade-in group bg-white rounded-3xl overflow-hidden border border-[#e7e0d8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <button
                  onClick={() => setQuickViewId(p.id)}
                  className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-xs font-semibold px-3 py-1.5 rounded-full shadow-md text-[#1E293B] hover:bg-[#1E293B] hover:text-white transition cursor-pointer"
                >
                  Quick View
                </button>
                <span className="absolute top-3 left-3 badge-sage text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                  {p.category}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <User className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span className="font-medium text-slate-700">{p.maker}</span>
                  <span className="text-slate-300">•</span>
                  <span className="truncate">{p.school}</span>
                </div>

                <h3 className="font-bold text-[#1E293B] text-base mb-1 line-clamp-1 group-hover:text-[#C85A32] transition">
                  {p.title}
                </h3>

                <div className="flex items-center gap-1 text-[#C85A32] text-xs mb-3">
                  <span>{starString(p.rating)}</span>
                  <span className="text-slate-400 font-medium">({p.reviews})</span>
                </div>

                <div className="mt-auto pt-3 border-t border-[#f0eae1] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-light">Price</span>
                    <span className="text-lg font-black text-[#1E293B]">{formatINR(p.price)}</span>
                  </div>

                  <button
                    onClick={() => addToCart(p.id)}
                    className="w-9 h-9 rounded-full bg-[#1E293B] text-white flex items-center justify-center hover:bg-[#C85A32] transition cursor-pointer shadow-xs"
                    aria-label={`Add ${p.title} to cart`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Collections Teaser */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-[#1E293B] text-white rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="max-w-xl relative z-10">
            <span className="bg-[#8A9A86]/20 text-[#8A9A86] border border-[#8A9A86]/30 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Curated Series
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-4">
              Explore Our Signature Craft Collections
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-8 leading-relaxed">
              Experience the tactile charm of terracotta ceramics, hand-bound botanical prints, and woven macramé wearables made with zero plastic.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/collections"
                className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-full flex items-center gap-2"
              >
                <span>View Stacking Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold px-6 py-3 rounded-full transition"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Student Maker Callout */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="bg-linear-to-br from-[#FAF9F6] to-[#f4ebe1] rounded-3xl border border-[#e7e0d8] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Calling Student Creators
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] mt-2 mb-3">
              Are you a high school or college maker?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Join 120+ student artisans selling pottery, jewelry, illustrations, and crochet items. We handle payments, customer support, and campus drop-off logistics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => setIsMakerSignupOpen(true)}
              className="btn-terracotta text-xs md:text-sm font-semibold px-6 py-3 rounded-full flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply to Sell</span>
            </button>
            <Link
              to="/maker"
              className="bg-white border border-[#e7e0d8] text-[#1E293B] hover:border-[#1E293B] text-xs md:text-sm font-semibold px-6 py-3 rounded-full transition"
            >
              View Maker Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
