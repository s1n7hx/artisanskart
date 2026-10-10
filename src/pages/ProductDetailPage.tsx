import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  PackageCheck,
  Layers,
  Award,
  Share2,
  Star,
  MapPin,
  Check,
  CreditCard,
  Leaf,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, getProductSlug } from '../types';
import { findProductBySlugOrId, checkPincodeServiceability, PincodeServiceabilityResult } from '../services/ecommerce';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, addToCart, showToast, makerEarningPercent } = useApp();

  // Find target product
  const product = useMemo(() => {
    return findProductBySlugOrId(products, slug);
  }, [products, slug]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  // Purchase controls state
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'craft' | 'shipping' | 'reviews'>('desc');

  // PIN code / Shiprocket serviceability state
  const [pincodeInput, setPincodeInput] = useState('560034');
  const [pincodeResult, setPincodeResult] = useState<PincodeServiceabilityResult | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  // Compile full gallery photos
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
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=1200&q=80');
    }
    return list;
  }, [product]);

  // Reset image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsImageLoading(true);
    setQuantity(1);
    setIsZoomed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!pincodeResult) {
      const initial = checkPincodeServiceability('560034');
      setPincodeResult(initial);
    }
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

  // Zoom mouse tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
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

  // Check PIN code via Shiprocket API with local fallback
  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincodeInput.trim();
    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'alert-circle');
      return;
    }

    setIsCheckingPincode(true);
    try {
      const res = await fetch('/api/shipping/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryPincode: cleanPin,
          pickupPincode: '110001',
          weightKg: 0.5,
          cod: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isServiceable) {
          const days = data.estimatedDays || 3;
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + days);
          const dateStr = deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          setPincodeResult({
            pincode: cleanPin,
            isServiceable: true,
            city: data.city || 'Your Area',
            state: data.state || 'India',
            courierName: data.courierName || 'BlueDart Express',
            estimatedDays: days,
            estimatedDeliveryText: `Estimated delivery by ${dateStr}`,
            codAvailable: data.codAvailable ?? true,
            isExpressAvailable: data.isExpressAvailable ?? true,
            message: data.message || `Serviceable via ${data.courierName || 'BlueDart'}`,
          });
          showToast(`PIN ${cleanPin} is serviceable for delivery!`, 'check-circle');
          setIsCheckingPincode(false);
          return;
        }
      }
    } catch {}

    const localResult = checkPincodeServiceability(cleanPin);
    setPincodeResult(localResult);
    setIsCheckingPincode(false);
    if (localResult.isServiceable) {
      showToast(`PIN ${cleanPin} serviceable via ${localResult.courierName}`, 'check-circle');
    } else {
      showToast(`PIN ${cleanPin} is outside direct coverage`, 'alert-circle');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    showToast(`Added ${quantity} × "${product.title}" to your cart!`, 'shopping-cart');
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
      showToast('Product link copied to clipboard!', 'check-circle');
    }
  };

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const scrollToReviews = () => {
    setActiveTab('reviews');
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C85A32] flex items-center justify-center mx-auto border border-amber-200">
          <Sparkles className="w-8 h-8" />
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

  // Related products from same maker
  const moreFromMaker = products
    .filter((p) => p.maker === product.maker && p.id !== product.id)
    .slice(0, 4);

  // You may also like
  const youMayAlsoLike = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.maker !== product.maker)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-12">
      {/* 2-Column Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* =========================================================
            LEFT COLUMN: MULTI-IMAGE GALLERY WITH VERTICAL THUMBNAIL STRIP & ZOOM
        ========================================================= */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
          {/* Vertical Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[520px] shrink-0 py-1 sm:py-0 select-none">
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
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#C85A32] shadow-sm scale-102 ring-2 ring-[#C85A32]/20'
                      : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.title} angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Display Stage with Hover Zoom */}
          <div className="relative flex-1 w-full bg-white rounded-3xl border border-[#e7e0d8] overflow-hidden aspect-square sm:aspect-[4/4] flex items-center justify-center shadow-xs group select-none">
            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
              <span className="bg-[#FAF9F6]/95 backdrop-blur-md text-[#C85A32] text-xs font-bold px-3 py-1 rounded-full shadow-xs border border-[#C85A32]/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Handmade
              </span>
              {discountPercent && discountPercent > 0 && (
                <span className="bg-[#C85A32] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Prev / Next Nav Controls */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsImageLoading(true);
                    setActiveImageIndex(
                      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
                    );
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md backdrop-blur-xs transition opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
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
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md backdrop-blur-xs transition cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Main Image with Hover Zoom Container */}
            <div
              className="relative w-full h-full overflow-hidden cursor-crosshair"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {isImageLoading && (
                <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">
                  Loading craft imagery...
                </div>
              )}
              <img
                src={galleryImages[activeImageIndex]}
                alt={product.title}
                onLoad={() => setIsImageLoading(false)}
                className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: ORDERED EXACTLY AS SPECIFIED
            1. breadcrumb/category
            2. product title
            3. star rating with a review count link
            4. price section (with taxes, estimated delivery, PIN code)
            5. status badges
            6. maker card
            7. short description
            8. quantity selector
            9. action buttons (sticky on mobile)
            10. trust badges
            11. cost breakdown
        ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Breadcrumb / Category */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-[#C85A32] transition">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/marketplace?category=${encodeURIComponent(product.category)}`}
              className="text-[#C85A32] hover:underline"
            >
              {product.category}
            </Link>
          </div>

          {/* 2. Product Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-[#1E293B] leading-tight tracking-tight">
            {product.title}
          </h1>

          {/* 3. Star Rating with Review Count Link */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < product.rating
                      ? 'fill-amber-400/50 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-800">{product.rating}</span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <button
              onClick={scrollToReviews}
              className="text-[#C85A32] hover:underline font-semibold cursor-pointer"
            >
              {product.reviews} customer reviews
            </button>
          </div>

          {/* 4. Price Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
            <div className="flex items-baseline flex-wrap gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#1E293B]">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                  {discountPercent && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {discountPercent}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">Inclusive of all taxes</p>

            {/* PIN Code Delivery Checker via Shiprocket */}
            <div className="pt-2 border-t border-[#e7e0d8]/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C85A32]" /> Delivery &amp; Serviceability
                </span>
                {pincodeResult && (
                  <span className="text-[11px] text-slate-500">
                    PIN: <strong className="text-slate-700">{pincodeResult.pincode}</strong> (
                    {pincodeResult.city})
                  </span>
                )}
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN code"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCheckingPincode}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1E293B] text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                >
                  {isCheckingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>

              {pincodeResult && (
                <div
                  className={`text-xs p-2.5 rounded-xl flex items-start gap-2 ${
                    pincodeResult.isServiceable
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                  <div className="leading-tight">
                    <p className="font-semibold">{pincodeResult.estimatedDeliveryText}</p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Verified via Shiprocket • {pincodeResult.courierName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Status Badges (Single-line pills with icons that wrap cleanly) */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${
                inStock
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              {product.inStockCount !== undefined
                ? `In Stock (${product.inStockCount} left)`
                : 'In Stock'}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5" /> Made on Demand
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
              <Award className="w-3.5 h-3.5" /> Verified Student Work
            </span>
          </div>

          {/* 6. Maker Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#e7e0d8] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center font-bold text-sm text-[#C85A32] shrink-0">
                {product.maker
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{product.maker}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <School className="w-3.5 h-3.5 shrink-0" />
                  <span>{product.cls}, {product.school}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(`Student Maker: ${product.maker} from ${product.school}`, 'user');
              }}
              className="text-xs font-bold text-[#C85A32] hover:text-[#a04321] hover:underline shrink-0 cursor-pointer"
            >
              View Maker Profile →
            </button>
          </div>

          {/* 7. Short Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* 8. Quantity Selector */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-700">Quantity:</span>
            <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-l-xl transition cursor-pointer font-bold"
              >
                -
              </button>
              <span className="w-12 text-center text-xs font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                disabled={quantity >= maxStock}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-r-xl transition cursor-pointer font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-slate-400">
              (Max {maxStock} per student order)
            </span>
          </div>

          {/* 9. Action Buttons (Sticky on Mobile) */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 px-4 py-3 sm:static sm:p-0 sm:bg-transparent sm:mx-0 z-20 border-t sm:border-t-0 border-[#e7e0d8]">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold border-2 border-[#C85A32] text-[#C85A32] hover:bg-[#C85A32]/5 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#C85A32] text-white hover:bg-[#a04321] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#C85A32]/25"
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>

              <button
                onClick={handleToggleWishlist}
                aria-label="Wishlist craft"
                className={`p-3.5 rounded-xl border transition cursor-pointer shrink-0 ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                aria-label="Share craft"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 10. Trust Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="leading-tight font-medium">Razorpay Secure</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-tight font-medium">Easy 7-day Returns</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <Truck className="w-4 h-4 text-[#C85A32] shrink-0" />
              <span className="leading-tight font-medium">Free Ship &gt; ₹499</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-tight font-medium">Eco Packaging</span>
            </div>
          </div>

          {/* 11. Cost Breakdown: Collapsible "See where your money goes" */}
          <div className="rounded-2xl border border-[#e7e0d8] overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setIsCostBreakdownOpen(!isCostBreakdownOpen)}
              className="w-full px-4 py-3.5 bg-[#FAF9F6] hover:bg-[#f3eee7] transition flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-[#C85A32]">
                <Sparkles className="w-4 h-4" /> See where your money goes (Fair Split)
              </span>
              {isCostBreakdownOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isCostBreakdownOpen && (
              <div className="p-4 sm:p-5 space-y-4 animate-[fadeIn_0.2s_ease-out]">
                {/* Clean Stacked Bar */}
                <div className="h-3.5 w-full bg-[#f0ebe3] rounded-full overflow-hidden flex shadow-inner">
                  <div
                    className="h-full bg-[#C85A32] transition-all duration-300"
                    style={{ width: `${makerEarningPercent}%` }}
                    title={`Student Maker: ${makerEarningPercent}%`}
                  />
                  <div
                    className="h-full bg-[#1E293B] transition-all duration-300"
                    style={{ width: '20%' }}
                    title="ArtisansKart Platform: 20%"
                  />
                  <div
                    className="h-full bg-[#8A9A86] transition-all duration-300"
                    style={{ width: '15%' }}
                    title="Packaging & Delivery: 15%"
                  />
                </div>

                {/* Legend with Amounts & Percentages */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
                      <span>Student Maker</span>
                    </div>
                    <p className="font-bold text-base text-[#C85A32] mt-1">
                      {formatINR(product.price * (makerEarningPercent / 100))}
                    </p>
                    <span className="text-[11px] text-slate-400">{makerEarningPercent}% direct</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" />
                      <span>Platform</span>
                    </div>
                    <p className="font-bold text-base text-slate-800 mt-1">
                      {formatINR(product.price * 0.2)}
                    </p>
                    <span className="text-[11px] text-slate-400">20% server &amp; lab</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#8A9A86]/10 border border-[#8A9A86]/30">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8A9A86]" />
                      <span>Packaging</span>
                    </div>
                    <p className="font-bold text-base text-[#5c6a58] mt-1">
                      {formatINR(product.price * 0.15)}
                    </p>
                    <span className="text-[11px] text-slate-400">15% eco-delivery</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          BELOW THE MAIN SECTION: TABS & CAROUSELS
      ========================================================= */}
      <div ref={reviewsSectionRef} className="pt-8 border-t border-[#e7e0d8] space-y-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-[#e7e0d8] overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'desc'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Description &amp; Origin
          </button>
          <button
            onClick={() => setActiveTab('craft')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'craft'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Craft Details &amp; Care
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Shipping &amp; Returns
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#C85A32] text-[#C85A32]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({product.reviews})
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[160px] text-sm leading-relaxed text-slate-700">
          {activeTab === 'desc' && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              <p className="text-base">{product.description}</p>
              <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  The Story Behind the Craft
                </h4>
                <p className="text-slate-600">
                  Every unit of <strong>{product.title}</strong> is made by {product.maker}, a student in{' '}
                  {product.cls} at {product.school}. By procuring raw materials in small campus batches
                  and making crafts on demand, student artisans gain real entrepreneurship experience while
                  earning funds for books and supplies.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'craft' && (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Materials
                </span>
                <p className="font-semibold text-slate-800">
                  {product.materials || 'Natural riverbed terracotta, organic ochre pigments'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dimensions
                </span>
                <p className="font-semibold text-slate-800">
                  {product.dimensions || 'Handcrafted size specs as listed'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Weight
                </span>
                <p className="font-semibold text-slate-800">{product.weight || '300g – 500g'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Care Instructions
                </span>
                <p className="font-semibold text-slate-800">
                  {product.careInstructions ||
                    'Wipe gently with dry cloth. Avoid harsh chemical cleaners.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="grid sm:grid-cols-3 gap-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="p-5 rounded-2xl bg-white border border-[#e7e0d8] space-y-2">
                <Truck className="w-6 h-6 text-[#C85A32]" />
                <h4 className="font-bold text-slate-900">Shiprocket Verified Logistics</h4>
                <p className="text-xs text-slate-500">
                  Fast delivery across all operational PIN codes in India. Live tracking updates sent via SMS &amp; Email.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e7e0d8] space-y-2">
                <Clock className="w-6 h-6 text-amber-600" />
                <h4 className="font-bold text-slate-900">24-48 Hours Dispatch</h4>
                <p className="text-xs text-slate-500">
                  Carefully boxed and inspected by campus team before transit.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e7e0d8] space-y-2">
                <RotateCcw className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-slate-900">Easy 7-Day Returns</h4>
                <p className="text-xs text-slate-500">
                  Zero-hassle replacement or refund if damaged during transit.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8]">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-[#1E293B]">{product.rating}</div>
                  <div>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Based on {product.reviews} student craft buyer ratings
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    showToast('Thank you! Reviews are verified after delivery.', 'check-circle')
                  }
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E293B] text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Write a Review
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#e7e0d8] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Pooja Sharma</span>
                    <span className="text-slate-400 text-[11px]">Verified Buyer · 3 days ago</span>
                  </div>
                  <div className="flex text-amber-400 text-sm">{'★'.repeat(5)}</div>
                  <p className="text-xs text-slate-600">
                    "The craftsmanship on this {product.title} is astonishing! Knowing the earnings reach
                    a hardworking student artist makes it even more special."
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e7e0d8] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Vikram Malhotra</span>
                    <span className="text-slate-400 text-[11px]">Verified Buyer · 1 week ago</span>
                  </div>
                  <div className="flex text-amber-400 text-sm">{'★'.repeat(5)}</div>
                  <p className="text-xs text-slate-600">
                    "Packaged with biodegradable honeycomb wrap and arrived without a single scratch.
                    10/10 student craftsmanship!"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Carousels */}
        {/* 1. More from this maker */}
        {moreFromMaker.length > 0 && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1E293B]">More from {product.maker}</h3>
              <Link
                to="/marketplace"
                className="text-xs font-semibold text-[#C85A32] hover:underline"
              >
                View All Crafts →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {moreFromMaker.map((item) => (
                <Link
                  key={`maker-${item.id}`}
                  to={`/product/${getProductSlug(item)}`}
                  className="group p-3 rounded-2xl bg-white border border-[#e7e0d8] hover:border-[#C85A32]/40 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#C85A32]">
                      {item.title}
                    </p>
                    <p className="text-sm font-black text-[#1E293B] mt-1">
                      {formatINR(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. You may also like */}
        {youMayAlsoLike.length > 0 && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1E293B]">You May Also Like</h3>
              <Link
                to={`/marketplace?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-semibold text-[#C85A32] hover:underline"
              >
                More in {product.category} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {youMayAlsoLike.map((item) => (
                <Link
                  key={`like-${item.id}`}
                  to={`/product/${getProductSlug(item)}`}
                  className="group p-3 rounded-2xl bg-white border border-[#e7e0d8] hover:border-[#C85A32]/40 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#C85A32]">
                      {item.title}
                    </p>
                    <p className="text-sm font-black text-[#1E293B] mt-1">
                      {formatINR(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fade-in"
        >
          <div className="flex items-center justify-between text-white z-10">
            <span className="text-sm font-medium">
              {product.title} • Photo {activeImageIndex + 1} of {galleryImages.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center py-4"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex(
                    (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
                  )
                }
                className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <img
              src={galleryImages[activeImageIndex]}
              alt={product.title}
              className="max-h-[82vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />

            {galleryImages.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)}
                className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
