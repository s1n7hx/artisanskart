import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Edit3, Globe, Sparkles, RefreshCw, Zap, Images } from 'lucide-react';
import { CATEGORIES } from '../data';
import { Product, getProductSlug } from '../types';
import { useApp } from '../context/AppContext';

interface MarketplaceProps {
  products: Product[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchTerm: string;
  onQuickView: (id: number) => void;
  onAddToCart: (id: number) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  products,
  activeCategory,
  setActiveCategory,
  searchTerm,
  onQuickView,
  onAddToCart,
}) => {
  const navigate = useNavigate();
  const { wpConfig, setIsWpModalOpen, openEditorForProduct } = useApp();

  const allCategories = React.useMemo(() => {
    const base = ['All', 'Clay Crafts', 'Hand-painted Cards', 'Paintings', 'Accessories', 'Keychains', 'Other Crafts'];
    const dynamicTypes = products.map((p) => p.category).filter(Boolean);
    return Array.from(new Set([...base, ...dynamicTypes]));
  }, [products]);

  const term = searchTerm.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const catOk =
      activeCategory === 'All' ||
      p.category === activeCategory ||
      (activeCategory === 'Paintings' &&
        (p.category.toLowerCase().includes('paint') || p.category.toLowerCase().includes('canvas'))) ||
      (activeCategory === 'Other Crafts' &&
        !['Clay Crafts', 'Hand-painted Cards', 'Paintings', 'Accessories', 'Keychains'].includes(p.category));

    const searchOk =
      !term ||
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
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
    <section id="marketplace" className="px-4 md:px-10 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="fade-in text-3xl md:text-5xl font-black text-[#1E293B]">The Marketplace</h2>
        <p className="fade-in text-slate-500 mt-2 max-w-2xl mx-auto">
          Every craft below is made-on-demand by talented independent artisans. Descriptions and details can be managed via WordPress or the Live Content Hub without touching code.
        </p>

        {/* Content Management Quick Bar */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2.5 bg-white border border-[#e7e0d8] p-1.5 rounded-2xl shadow-xs">
          <button
            onClick={() => setIsWpModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#1E293B] hover:text-[#C85A32] bg-[#FAF9F6] hover:bg-[#FAF9F6] border border-[#e7e0d8] flex items-center gap-2 cursor-pointer transition shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Edit Any Description</span>
          </button>

          <button
            onClick={() => setIsWpModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E293B] text-white hover:bg-[#C85A32] flex items-center gap-2 cursor-pointer transition shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>WordPress REST Hub</span>
            {wpConfig.isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div id="categoryPills" className="flex flex-wrap justify-center gap-2 mb-10">
        {allCategories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`pill-btn px-5 py-2 rounded-full text-sm font-semibold cursor-pointer ${
              c === activeCategory ? 'active' : 'bg-white border border-[#e7e0d8] text-[#1E293B]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div id="productGrid" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((p) => {
          const productSlug = getProductSlug(p);
          return (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${productSlug}`)}
              className="fade-in in-view bg-white rounded-2xl overflow-hidden card-hover border border-[#f0ebe3] flex flex-col justify-between group cursor-pointer transition hover:border-[#C85A32]/40"
            >
              <div>
                <div className="relative">
                  <img src={p.image} alt={p.title} className="w-full h-52 object-cover group-hover:scale-102 transition duration-300" />


                  {p.images && p.images.length > 1 && (
                    <span className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Images className="w-3 h-3" /> {p.images.length} photos
                    </span>
                  )}

                  {/* Edit description shortcut button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditorForProduct(p.id);
                    }}
                    title="Edit description for this craft"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#C85A32] flex items-center justify-center shadow-md backdrop-blur-xs transition cursor-pointer opacity-80 hover:opacity-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 pb-2">
                  <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-1 rounded-full mb-2">
                    <User className="w-3 h-3" /> Made by {p.maker} • {p.cls}
                  </p>
                  <h3 className="font-bold text-base leading-snug mb-1 text-[#1E293B] line-clamp-1 group-hover:text-[#C85A32] transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2">{p.school}</p>

                  {/* Product Description */}
                  {p.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                      {p.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1 mb-2">
                    <span className="stars text-sm">{starString(p.rating)}</span>
                    <span className="text-xs text-slate-400">
                      {p.rating} ({p.reviews})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-black text-[#1E293B]">{formatINR(p.price)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${p.id}`);
                    }}
                    className="text-xs font-semibold text-[#1E293B] underline decoration-[#C85A32] underline-offset-4 hover:text-[#C85A32] cursor-pointer"
                  >
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(p.id);
                    }}
                    className="px-3 py-2.5 rounded-full border border-[#1E293B] text-[#1E293B] hover:bg-[#1E293B] hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(p.id);
                      navigate(`/checkout?product=${productSlug}&qty=1`);
                    }}
                    className="px-3 py-2.5 rounded-full bg-[#C85A32] text-white hover:bg-[#b04a25] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p id="noResults" className="text-center text-slate-400 py-16">
          No crafts found — try a different search or category.
        </p>
      )}
    </section>
  );
};
