import React from 'react';
import { User, ShoppingCart, Search, X, Sparkles, Filter } from 'lucide-react';
import { CATEGORIES } from '../data';
import { useApp } from '../context/AppContext';

export const MarketplacePage: React.FC = () => {
  const {
    products,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    setQuickViewId,
    addToCart,
    cartCount,
    setIsCartOpen,
  } = useApp();

  const term = searchTerm.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const catOk = activeCategory === 'All' || p.category === activeCategory;
    const searchOk =
      !term ||
      p.title.toLowerCase().includes(term) ||
      p.maker.toLowerCase().includes(term) ||
      p.school.toLowerCase().includes(term);
    return catOk && searchOk;
  });

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
  const starString = (rating: number) => {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10">
      {/* Marketplace Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
          Student Crafts Catalog
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] mt-3">
          The Marketplace
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2 leading-relaxed">
          Every piece below is crafted on-demand with 65% of your purchase credited directly to the student maker.
        </p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div id="categoryPills" className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`pill-btn px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold cursor-pointer transition ${
                c === activeCategory
                  ? 'active'
                  : 'bg-white border border-[#e7e0d8] text-[#1E293B] hover:border-[#C85A32]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs md:text-sm text-slate-500 border-t border-[#e7e0d8]/80">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{filtered.length} creations</span>
            <span>in</span>
            <span className="badge-terracotta text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {activeCategory}
            </span>
            {searchTerm && (
              <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs">
                Matching: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-red-500 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {cartCount > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-xs font-semibold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{cartCount} item(s) in cart &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="product-card group bg-white rounded-3xl overflow-hidden border border-[#e7e0d8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
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
                <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-xs">
                  {p.stock} left
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
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e7e0d8] max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] text-slate-400 flex items-center justify-center mx-auto mb-4 border border-[#e7e0d8]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">No matching crafts found</h3>
          <p className="text-slate-500 text-sm mb-6">
            Try adjusting your search keywords or switch category filter to view other student items.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchTerm('');
            }}
            className="btn-terracotta text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
