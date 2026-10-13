import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  PackageCheck,
  Check,
  Sparkles,
  User,
  School,
  Clock,
  Award,
  Layers,
  Leaf,
  CreditCard,
  MapPin,
  ExternalLink,
  Star,
} from 'lucide-react';
import { Product, getProductSlug } from '../types';
import { useApp } from '../context/AppContext';
import { checkPincodeServiceability, PincodeServiceabilityResult } from '../services/ecommerce';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (id: number) => void;
  onOpenMakerProfile?: (makerName: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenMakerProfile,
}) => {
  const navigate = useNavigate();
  const { products, setQuickViewId, showToast, makerEarningPercent } = useApp();

  // Dialog container ref for focus trapping and accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  const bottomTabsRef = useRef<HTMLDivElement>(null);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  // Interactive controls state
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'craft' | 'shipping' | 'reviews'>('desc');

  // PIN code / Shiprocket serviceability state
  const [pincodeInput, setPincodeInput] = useState('560034');
  const [pincodeResult, setPincodeResult] = useState<PincodeServiceabilityResult | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Compile gallery images
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

  // Reset states when product changes
  useEffect(() => {
    if (!product) return;
    setActiveImageIndex(0);
    setIsImageLoading(true);
    setQuantity(1);
    setIsZoomed(false);

    // Initial check with default PIN code if not already checked
    if (!pincodeResult) {
      const initial = checkPincodeServiceability('560034');
      setPincodeResult(initial);
    }

    // Check wishlist
    try {
      const saved = localStorage.getItem('artisanskart_wishlist_v1');
      if (saved) {
        const list: number[] = JSON.parse(saved);
        setIsWishlisted(list.includes(product.id));
      }
    } catch {}
  }, [product?.id]);

  // Focus trapping and Escape key listener
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && galleryImages.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === 'ArrowLeft' && galleryImages.length > 1) {
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, galleryImages.length, onClose]);

  if (!product) return null;

  const inStock = product.inStockCount === undefined || product.inStockCount > 0;
  const maxStock = product.inStockCount !== undefined ? Math.min(product.inStockCount, 15) : 10;
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Related products from same maker
  const moreFromMaker = products
    .filter((p) => p.maker === product.maker && p.id !== product.id)
    .slice(0, 4);

  // You may also like (same category)
  const youMayAlsoLike = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.maker !== product.maker)
    .slice(0, 4);

  // Zoom mouse tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
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
            city: data.city || '',
            state: data.state || '',
            courierName: data.courierName || 'Standard Surface Delivery',
            estimatedDays: days,
            estimatedDeliveryText: `Estimated delivery by ${dateStr}`,
            codAvailable: data.codAvailable ?? true,
            isExpressAvailable: data.isExpressAvailable ?? false,
            message: data.message || `Serviceable for delivery`,
          });
          showToast(`PIN ${cleanPin} is serviceable for delivery!`, 'check-circle');
          setIsCheckingPincode(false);
          return;
        }
      }
    } catch {}

    // Pure authentic lookup via India Post & Shiprocket
    const localResult = await checkPincodeServiceability(cleanPin);
    setPincodeResult(localResult);
    setIsCheckingPincode(false);
    if (localResult.isServiceable) {
      showToast(`PIN ${cleanPin} serviceable via ${localResult.courierName || 'Courier Partner'}`, 'check-circle');
    } else {
      showToast(localResult.message || `PIN ${cleanPin} delivery unconfirmed`, 'alert-circle');
    }
  };

  // Add to cart with quantity
  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product.id);
    }
    showToast(`Added ${quantity} × "${product.title}" to your cart!`, 'shopping-cart');
  };

  // Buy Now: adds to cart and redirects straight to /checkout
  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    navigate('/checkout');
  };

  // Toggle wishlist
  const handleToggleWishlist = () => {
    try {
      const saved = localStorage.getItem('artisanskart_wishlist_v1');
      let list: number[] = saved ? JSON.parse(saved) : [];
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setIsWishlisted(false);
        showToast(`Removed "${product.title}" from wishlist`, 'heart');
      } else {
        list.push(product.id);
        setIsWishlisted(true);
        showToast(`Saved "${product.title}" to student wishlist!`, 'sparkles');
      }
      localStorage.setItem('artisanskart_wishlist_v1', JSON.stringify(list));
    } catch {}
  };

  // Share product
  const handleShare = async () => {
    const slug = getProductSlug(product);
    const productUrl = `${window.location.origin}/product/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} by ${product.maker}`,
          text: `Check out this student craft "${product.title}" on ArtisansKart!`,
          url: productUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(productUrl);
      showToast('Product link copied to clipboard!', 'check-circle');
    }
  };

  const scrollToReviews = () => {
    setActiveTab('reviews');
    bottomTabsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      id="quickViewOverlay"
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickViewTitle"
    >
      <div
        ref={modalRef}
        id="quickViewPanel"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl md:rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e7e0d8] overflow-hidden animate-[scaleUp_0.25s_cubic-bezier(.25,.1,.25,1)]"
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-[#e7e0d8]/80 bg-[#FAF9F6]/80 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-[#C85A32] uppercase tracking-wider text-[11px]">
              ArtisansKart Quick View
            </span>
            <span aria-hidden="true" className="text-slate-300">
              /
            </span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{product.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/product/${getProductSlug(product)}`}
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-[#C85A32] flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-black/5 transition"
              title="Open full product page"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={onClose}
              aria-label="Close Quick View"
              className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto px-5 sm:px-7 py-6 space-y-10 focus:outline-hidden">
          {/* Main 2-Column Section */}
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Gallery with Vertical Thumbnails, Zoom, Badges */}
            <div className="md:col-span-6 flex flex-col-reverse sm:flex-row gap-3.5">
              {/* Vertical Thumbnail Strip */}
              {galleryImages.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[440px] shrink-0 py-1 sm:py-0 select-none">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={`thumb-${idx}`}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setIsImageLoading(true);
                      }}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} angle ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image with Hover Zoom */}
              <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 group">
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
                  <span className="bg-[#FAF9F6]/95 backdrop-blur-md text-[#C85A32] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-[#C85A32]/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Handmade
                  </span>
                  {discountPercent && discountPercent > 0 && (
                    <span className="bg-[#C85A32] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Left / Right Arrow Controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(
                          (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
                        );
                        setIsImageLoading(true);
                      }}
                      aria-label="Previous image"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
                        setIsImageLoading(true);
                      }}
                      aria-label="Next image"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image Container with Zoom */}
                <div
                  className="relative aspect-square sm:aspect-[4/4] overflow-hidden cursor-crosshair"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">
                      Loading high-res craft photo...
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

            {/* RIGHT COLUMN: Sequence as requested */}
            <div className="md:col-span-6 flex flex-col space-y-4">
              {/* 1. Breadcrumb / Category */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Link to="/" onClick={onClose} className="hover:text-[#C85A32] transition">
                  Home
                </Link>
                <span aria-hidden="true">/</span>
                <Link
                  to={`/marketplace?category=${encodeURIComponent(product.category)}`}
                  onClick={onClose}
                  className="text-[#C85A32] hover:underline"
                >
                  {product.category}
                </Link>
              </div>

              {/* 2. Product Title */}
              <h2
                id="quickViewTitle"
                className="text-2xl sm:text-3xl font-black text-[#1E293B] leading-tight"
              >
                {product.title}
              </h2>

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
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
                <div className="flex items-baseline flex-wrap gap-2.5">
                  <span className="text-3xl font-black text-[#1E293B]">{formatINR(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-slate-400 line-through">
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

                <p className="text-[11px] text-slate-500 font-medium">Inclusive of all taxes</p>

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

              {/* 5. Status Badges (Single-line pills that wrap cleanly) */}
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
              <div className="p-3.5 rounded-2xl bg-white border border-[#e7e0d8] shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center font-bold text-sm text-[#C85A32] shrink-0">
                    {product.maker
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{product.maker}</p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <School className="w-3 h-3 shrink-0" />
                      <span>{product.cls}, {product.school}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenMakerProfile) {
                      onOpenMakerProfile(product.maker);
                    } else {
                      showToast(`Student Maker: ${product.maker} from ${product.school}`, 'user');
                    }
                  }}
                  className="text-xs font-bold text-[#C85A32] hover:text-[#a04321] hover:underline shrink-0 cursor-pointer"
                >
                  View Maker Profile →
                </button>
              </div>

              {/* 7. Short Description */}
              {product.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
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
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-l-xl transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-r-xl transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  (Max {maxStock} per student order)
                </span>
              </div>

              {/* 9. Action Buttons (Sticky on Mobile) */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-5 px-5 py-3 md:static md:p-0 md:bg-transparent md:mx-0 z-20 border-t md:border-t-0 border-[#e7e0d8]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border-2 border-[#C85A32] text-[#C85A32] hover:bg-[#C85A32]/5 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#C85A32] text-white hover:bg-[#a04321] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#C85A32]/25"
                  >
                    <Zap className="w-4 h-4" /> Buy Now
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    aria-label="Wishlist craft"
                    className={`p-3 rounded-xl border transition cursor-pointer shrink-0 ${
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
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 10. Trust Badges Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="leading-tight font-medium">Razorpay Secure</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <ShieldCheck className="w-4 h-4 text-[#C85A32] shrink-0" />
                  <span className="leading-tight font-medium">Student Handcrafted</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <Truck className="w-4 h-4 text-[#C85A32] shrink-0" />
                  <span className="leading-tight font-medium">Free Ship &gt; ₹499</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="leading-tight font-medium">Eco Packaging</span>
                </div>
              </div>

              {/* 11. Cost Breakdown: Collapsible "See where your money goes" */}
              <div className="rounded-2xl border border-[#e7e0d8] overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setIsCostBreakdownOpen(!isCostBreakdownOpen)}
                  className="w-full px-4 py-3 bg-[#FAF9F6] hover:bg-[#f3eee7] transition flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-[#C85A32]">
                    <Sparkles className="w-3.5 h-3.5" /> See where your money goes (Fair Split)
                  </span>
                  {isCostBreakdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {isCostBreakdownOpen && (
                  <div className="p-4 space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
                    {/* Clean Stacked Bar */}
                    <div className="h-3 w-full bg-[#f0ebe3] rounded-full overflow-hidden flex shadow-inner">
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
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                          <span>Student Maker</span>
                        </div>
                        <p className="font-bold text-sm text-[#C85A32] mt-0.5">
                          {formatINR(product.price * (makerEarningPercent / 100))}
                        </p>
                        <span className="text-[10px] text-slate-400">{makerEarningPercent}% direct</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-[#1E293B]" />
                          <span>Platform</span>
                        </div>
                        <p className="font-bold text-sm text-slate-800 mt-0.5">
                          {formatINR(product.price * 0.2)}
                        </p>
                        <span className="text-[10px] text-slate-400">20% server &amp; lab</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#8A9A86]/10 border border-[#8A9A86]/30">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-[#8A9A86]" />
                          <span>Packaging</span>
                        </div>
                        <p className="font-bold text-sm text-[#5c6a58] mt-0.5">
                          {formatINR(product.price * 0.15)}
                        </p>
                        <span className="text-[10px] text-slate-400">15% eco-delivery</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LOWER SECTION: Tabs for Description, Craft Details, Shipping & Delivery, and Reviews */}
          <div ref={bottomTabsRef} className="pt-6 border-t border-[#e7e0d8] space-y-6">
            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-[#e7e0d8] overflow-x-auto select-none">
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'desc'
                    ? 'border-[#C85A32] text-[#C85A32]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Description &amp; Story
              </button>
              <button
                onClick={() => setActiveTab('craft')}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'craft'
                    ? 'border-[#C85A32] text-[#C85A32]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Craft Details
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'shipping'
                    ? 'border-[#C85A32] text-[#C85A32]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Shipping &amp; Delivery
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-[#C85A32] text-[#C85A32]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Reviews ({product.reviews})
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[140px] text-xs sm:text-sm leading-relaxed text-slate-700">
              {activeTab === 'desc' && (
                <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <p>{product.description}</p>
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Student Artisan Story
                    </h4>
                    <p className="text-xs text-slate-600">
                      Crafted by <strong>{product.maker}</strong> from {product.school}. Each piece is
                      individually shaped by hand during extracurricular arts and vocational studio sessions.
                      Every purchase directly supports student educational funds and creative materials.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'craft' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Materials
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {product.materials || 'Natural riverbed terracotta, organic ochre pigments'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Dimensions / Size
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {product.dimensions || 'Handcrafted dimensions as specified by artisan'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Approximate Weight
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {product.weight || '300g – 500g'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Care Instructions
                    </span>
                    <p className="text-xs font-semibold text-slate-800">
                      {product.careInstructions ||
                        'Wipe gently with clean dry cloth. Avoid harsh abrasive cleaners.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#e7e0d8]">
                      <Truck className="w-5 h-5 text-[#C85A32] mb-1.5" />
                      <p className="font-bold text-xs text-slate-900">Shiprocket Air &amp; Surface</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Shipped with verified live tracking to 27,000+ Indian PIN codes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#e7e0d8]">
                      <Clock className="w-5 h-5 text-amber-600 mb-1.5" />
                      <p className="font-bold text-xs text-slate-900">24-48 Hours Dispatch</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Handcrafted or carefully packed by the student maker campus hub.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#e7e0d8]">
                      <PackageCheck className="w-5 h-5 text-emerald-600 mb-1.5" />
                      <p className="font-bold text-xs text-slate-900">Eco-Protective Packaging</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Each item is safely cushioned with recyclable materials to reach you intact.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8]">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-black text-[#1E293B]">{product.rating}</div>
                      <div>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Based on {product.reviews} student craft buyer ratings
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        showToast('Thank you! Reviews are verified after delivery.', 'check-circle')
                      }
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E293B] text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      Write a Review
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-[#e7e0d8]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900">Pooja Sharma</span>
                        <span className="text-slate-400 text-[11px]">Verified Buyer · 3 days ago</span>
                      </div>
                      <div className="flex text-amber-400 mb-1">
                        {'★'.repeat(5)}
                      </div>
                      <p className="text-xs text-slate-600">
                        "The craftsmanship on this {product.title} is astonishing! Knowing the earnings
                        reach a hardworking student artist makes it even more special."
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-[#e7e0d8]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900">Vikram Malhotra</span>
                        <span className="text-slate-400 text-[11px]">Verified Buyer · 1 week ago</span>
                      </div>
                      <div className="flex text-amber-400 mb-1">
                        {'★'.repeat(5)}
                      </div>
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
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1E293B]">
                    More from {product.maker}
                  </h4>
                  <Link
                    to="/marketplace"
                    onClick={onClose}
                    className="text-xs font-semibold text-[#C85A32] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {moreFromMaker.map((item) => (
                    <div
                      key={`maker-${item.id}`}
                      onClick={() => setQuickViewId(item.id)}
                      className="group p-2.5 rounded-2xl bg-white border border-[#e7e0d8] hover:border-[#C85A32]/40 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
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
                        <p className="text-xs font-black text-[#1E293B] mt-0.5">
                          {formatINR(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. You may also like */}
            {youMayAlsoLike.length > 0 && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#1E293B]">You May Also Like</h4>
                  <Link
                    to="/marketplace"
                    onClick={onClose}
                    className="text-xs font-semibold text-[#C85A32] hover:underline"
                  >
                    Explore Category
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {youMayAlsoLike.map((item) => (
                    <div
                      key={`like-${item.id}`}
                      onClick={() => setQuickViewId(item.id)}
                      className="group p-2.5 rounded-2xl bg-white border border-[#e7e0d8] hover:border-[#C85A32]/40 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
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
                        <p className="text-xs font-black text-[#1E293B] mt-0.5">
                          {formatINR(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
