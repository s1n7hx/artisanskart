import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  Sparkles,
  School,
  User,
  Clock,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers,
  Award,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, getProductSlug } from '../types';
import { findProductBySlugOrId, checkPincodeServiceability, PincodeServiceabilityResult } from '../services/ecommerce';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, addToCart, cartCount, setIsCartOpen, showToast, makerEarningPercent } = useApp();

  // Find target product
  const product = useMemo(() => {
    return findProductBySlugOrId(products, slug);
  }, [products, slug]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Purchase controls state
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<PincodeServiceabilityResult | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Compile full gallery photos (primary + additional gallery images)
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      }
    }
    // Fallback if only 1 image provided: provide authentic complementary perspective
    if (list.length === 0) {
      list.push('https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&w=800');
    }
    return list;
  }, [product]);

  // Reset image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsImageLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id]);

  // Check wishlist state
  useEffect(() => {
    if (!product) return;
    try {
      const saved = localStorage.getItem('artisanskart_wishlist_v1');
      if (saved) {
        const list: number[] = JSON.parse(saved);
        setIsWishlisted(list.includes(product.id));
      }
    } catch {}
  }, [product?.id]);

  // Keyboard navigation for gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryImages.length <= 1) return;
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      } else if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages.length, isLightboxOpen]);

  // Touch swipe support for mobile gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else {
        // Swiped right -> prev
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    }
    setTouchStartX(null);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    try {
      const saved = localStorage.getItem('artisanskart_wishlist_v1');
      let list: number[] = saved ? JSON.parse(saved) : [];
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setIsWishlisted(false);
        showToast(`Removed "${product.title}" from your wishlist.`, 'heart');
      } else {
        list.push(product.id);
        setIsWishlisted(true);
        showToast(`Saved "${product.title}" to your student craft wishlist!`, 'sparkles');
      }
      localStorage.setItem('artisanskart_wishlist_v1', JSON.stringify(list));
    } catch {}
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.trim().length !== 6) {
      showToast('Please enter a 6-digit Indian PIN code.', 'alert');
      return;
    }
    setIsCheckingPincode(true);
    setTimeout(() => {
      const res = checkPincodeServiceability(pincodeInput.trim());
      setPincodeResult(res);
      setIsCheckingPincode(false);
    }, 250);
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    showToast(`Added ${quantity} × "${product.title}" to your cart.`, 'cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} — ArtisansKart.in`,
          text: `Check out this student-crafted "${product.title}" by ${product.maker} on ArtisansKart!`,
          url: shareUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Product link copied to clipboard!', 'check');
    }
  };

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
  const starString = (rating: number) => {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  // Related products from same category or maker
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && (p.category === product.category || p.maker === product.maker))
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mx-auto border border-amber-200">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Craft Not Found</h1>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          The requested student craft may have been updated or moved. Browse our live catalog to discover other handmade student creations.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/marketplace"
            className="btn-terracotta px-6 py-3 rounded-full text-xs font-bold shadow-xs inline-flex items-center gap-2"
          >
            Explore Marketplace
          </Link>
          <Link
            to="/"
            className="px-6 py-3 rounded-full text-xs font-bold bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const inStock = product.inStockCount === undefined || product.inStockCount > 0;
  const maxStock = product.inStockCount !== undefined ? Math.min(product.inStockCount, 15) : 10;
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap pb-1">
        <Link to="/" className="hover:text-[#C85A32] transition">Home</Link>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <Link to="/marketplace" className="hover:text-[#C85A32] transition">Marketplace</Link>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">{product.category}</span>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main 2-Column Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* =========================================================
            LEFT COLUMN: MULTI-IMAGE GALLERY (7 cols on desktop)
        ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Display Stage */}
          <div
            className="relative bg-white rounded-3xl border border-[#e7e0d8] overflow-hidden aspect-4/3 sm:aspect-square flex items-center justify-center shadow-xs group select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Primary Image */}
            <img
              src={galleryImages[activeImageIndex]}
              alt={`${product.title} - Photo ${activeImageIndex + 1}`}
              onLoad={() => setIsImageLoading(false)}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isImageLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
              }`}
            />

            {/* Subtle Loading Placeholder */}
            {isImageLoading && (
              <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-slate-300">
                <Sparkles className="w-8 h-8" />
              </div>
            )}

            {/* Prev / Next Nav Controls */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsImageLoading(true);
                    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsImageLoading(true);
                    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Lightbox Trigger Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="View photo in full screen"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md backdrop-blur-xs transition cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Image Counter Pill */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full">
                {activeImageIndex + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          {/* Clickable Gallery Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (idx !== activeImageIndex) {
                      setIsImageLoading(true);
                      setActiveImageIndex(idx);
                    }
                  }}
                  aria-label={`Select photo ${idx + 1}`}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#C85A32] shadow-sm scale-102 ring-2 ring-[#C85A32]/20'
                      : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Craftsmanship Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3.5 bg-white rounded-2xl border border-[#e7e0d8] space-y-1">
              <ShieldCheck className="w-4 h-4 text-[#C85A32] mx-auto" />
              <p className="font-bold text-slate-800">100% Student Made</p>
              <p className="text-[11px] text-slate-400">Verified creator origin</p>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-[#e7e0d8] space-y-1">
              <Package className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-800">Eco-Friendly Wrap</p>
              <p className="text-[11px] text-slate-400">Plastic-free carton</p>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-[#e7e0d8] space-y-1">
              <Clock className="w-4 h-4 text-[#1E293B] mx-auto" />
              <p className="font-bold text-slate-800">Made on Demand</p>
              <p className="text-[11px] text-slate-400">Zero factory waste</p>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: PRODUCT DETAILS & PURCHASE (5 cols)
        ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Metadata (Quiet unboxed text) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#C85A32]">{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>Class {product.cls}</span>
                <span aria-hidden="true">·</span>
                <span>{product.school}</span>
              </div>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Artisan Attribution Link */}
            <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5">
              <div className="w-6 h-6 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center font-bold text-[10px]">
                {product.maker[0]}
              </div>
              <span>Handcrafted by</span>
              <span className="font-bold text-slate-900">{product.maker}</span>
              <span className="text-slate-400">({product.school})</span>
            </div>

            {/* Genuine Reviews & Stock Status */}
            <div className="flex items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1 text-[#C85A32]">
                <span className="font-bold">{starString(product.rating)}</span>
                <span className="text-slate-700 font-bold ml-1">{product.rating}</span>
                <span className="text-slate-400">({product.reviews} genuine reviews)</span>
              </div>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={`font-semibold ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                {product.stock}
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-4 bg-white rounded-2xl border border-[#e7e0d8] space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#1E293B]">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Inclusive of all taxes. Free eco-delivery on orders above ₹499.
            </p>

            {/* Transparent Fair-Trade Earnings Banner */}
            <div className="pt-2 border-t border-[#f0ebe3] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Award className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Student Creator Education Fund:</span>
              </div>
              <span className="font-black text-[#C85A32]">
                {formatINR(product.price * (makerEarningPercent / 100))} ({makerEarningPercent}%)
              </span>
            </div>
          </div>

          {/* Purchase Controls */}
          <div className="space-y-3.5">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-slate-700">Quantity:</label>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  disabled={quantity <= 1 || !inStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer font-bold text-slate-700"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-900">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= maxStock || !inStock}
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer font-bold text-slate-700"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-400">
                {product.inStockCount ? `(${product.inStockCount} available in studio)` : 'Made to order'}
              </span>
            </div>

            {/* Action Buttons: Add to Cart + Buy Now + Wishlist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider bg-white border-2 border-[#1E293B] text-[#1E293B] hover:bg-[#1E293B] hover:text-white transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider btn-terracotta text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-2 cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isWishlisted ? 'Saved in Your Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Postal PIN Code Delivery Estimator */}
          <div className="p-4 bg-white rounded-2xl border border-[#e7e0d8] space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Truck className="w-4 h-4 text-[#C85A32]" />
              <span>Check Delivery &amp; COD Availability</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN code (e.g. 560034)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#C85A32]"
              />
              <button
                type="submit"
                disabled={isCheckingPincode}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#C85A32] text-white font-bold rounded-xl transition cursor-pointer"
              >
                {isCheckingPincode ? 'Checking...' : 'Check'}
              </button>
            </form>

            {/* Result feedback */}
            {pincodeResult && (
              <div
                className={`p-3 rounded-xl border space-y-1 animate-fade-in ${
                  pincodeResult.isServiceable
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {pincodeResult.isServiceable ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{pincodeResult.message}</span>
                </div>
                {pincodeResult.isServiceable && (
                  <p className="text-[11px] text-emerald-800">
                    {pincodeResult.estimatedDeliveryText}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description & Artisan Story */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              About this Creation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description || 'Authentic made-on-demand craft sculpted and painted by student creators.'}
            </p>
          </div>

          {/* Technical Specifications Table */}
          <div className="p-4 bg-white rounded-2xl border border-[#e7e0d8] space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 mb-2">Craftsmanship Specifications</h4>
            <div className="divide-y divide-slate-100">
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Craft Category</span>
                <span className="font-medium text-slate-800">{product.category}</span>
              </div>
              {product.materials && (
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400">Materials</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{product.materials}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400">Dimensions</span>
                  <span className="font-medium text-slate-800">{product.dimensions}</span>
                </div>
              )}
              {product.weight && (
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400">Weight</span>
                  <span className="font-medium text-slate-800">{product.weight}</span>
                </div>
              )}
              {product.careInstructions && (
                <div className="py-1.5 flex justify-between">
                  <span className="text-slate-400">Care Instructions</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{product.careInstructions}</span>
                </div>
              )}
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-400">Artisan School</span>
                <span className="font-medium text-slate-800">{product.school}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FULL-SCREEN LIGHTBOX MODAL
      ========================================================= */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs">
              <span className="font-bold">{product.title}</span>
              <span className="text-white/60 ml-2">
                Photo {activeImageIndex + 1} of {galleryImages.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Center Image Stage */}
          <div
            className="flex-1 flex items-center justify-center relative p-4 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[activeImageIndex]}
              alt={`${product.title} full resolution`}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                  className="absolute left-2 md:left-6 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)}
                  className="absolute right-2 md:right-6 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnail Strip */}
          <div
            className="flex justify-center gap-2 overflow-x-auto py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                  activeImageIndex === idx ? 'border-[#C85A32] scale-105' : 'border-white/30 opacity-60'
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          RELATED STUDENT CRAFTS SECTION
      ========================================================= */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-[#e7e0d8] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">More Handcrafted Pieces</h2>
              <p className="text-xs text-slate-500">Other authentic creations by student makers in this collection</p>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-[#C85A32] hover:underline"
            >
              View Full Marketplace &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${getProductSlug(p)}`}
                className="group bg-white rounded-3xl overflow-hidden border border-[#e7e0d8] shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-bold px-2.5 py-0.5 rounded-full text-slate-700">
                    {p.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">{p.maker} · {p.school}</p>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5 group-hover:text-[#C85A32] transition line-clamp-1">
                      {p.title}
                    </h3>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                    <span className="font-black text-slate-900 text-base">{formatINR(p.price)}</span>
                    <span className="text-[11px] font-bold text-[#C85A32] group-hover:underline">View Craft</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          MOBILE STICKY BOTTOM PURCHASE BAR
      ========================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">{product.title}</p>
          <p className="text-sm font-black text-[#C85A32]">{formatINR(product.price)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            disabled={!inStock}
            onClick={handleAddToCart}
            className="px-4 py-2.5 rounded-full bg-white border border-slate-300 font-bold text-xs text-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
          <button
            type="button"
            disabled={!inStock}
            onClick={handleBuyNow}
            className="px-5 py-2.5 rounded-full btn-terracotta text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
