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
  Building2,
  User,
  Clock,
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
  Edit,
  Trash2,
  Plus,
  Upload,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, getProductSlug, ProductVariant, PincodeIntelligence, PostalLookupResult, CourierServiceabilityResult } from '../types';
import { findProductBySlugOrId, lookupPostalPincode, checkCourierAvailability } from '../services/ecommerce';
import { MultiImageUploader } from '../components/MultiImageUploader';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, addToCart, showToast, makerEarningPercent, currentUser, userRole, updateProduct } = useApp();

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
  const touchStartXRef = useRef<number | null>(null);

  // Variant & purchase state
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'craft' | 'maker' | 'shipping' | 'reviews'>('desc');

  // PIN code / Postal & Courier serviceability state
  const [pincodeInput, setPincodeInput] = useState(() => {
    try {
      return sessionStorage.getItem('artisanskart_user_pincode') || '';
    } catch {
      return '';
    }
  });
  const [verifiedPostal, setVerifiedPostal] = useState<PostalLookupResult | null>(null);
  const [courierResult, setCourierResult] = useState<CourierServiceabilityResult | null>(null);
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeErrorCode, setPincodeErrorCode] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isEditingPincode, setIsEditingPincode] = useState(false);

  // Authorized Image Management state
  const [isManagePhotosOpen, setIsManagePhotosOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  // Determine authorized admin permission (only admins can add, change, delete products or edit/delete photos)
  const isAuthorizedToEdit = useMemo(() => {
    return userRole === 'master_admin' || userRole === 'admin';
  }, [userRole]);

  // Compile full gallery photos with fallbacks
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

  // Available variants (use product variants or default handcrafted editions)
  const availableVariants: ProductVariant[] = useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [
      { id: 'standard', name: 'Standard Edition', inStock: true },
      { id: 'gift-box', name: 'Gift Box Packaging (+₹50)', price: (product.price || 299) + 50, inStock: true },
    ];
  }, [product]);

  // Sync selected variant
  useEffect(() => {
    if (availableVariants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(availableVariants[0].id);
    }
  }, [availableVariants, selectedVariantId]);

  const activeVariant = useMemo(() => {
    return availableVariants.find((v) => v.id === selectedVariantId) || availableVariants[0];
  }, [availableVariants, selectedVariantId]);

  const activePrice = activeVariant?.price || product?.price || 0;

  // Reset image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setIsImageLoading(true);
    setQuantity(1);
    setIsZoomed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If user previously checked a valid PIN in this session, re-verify real data
    if (pincodeInput && pincodeInput.length === 6 && /^[1-9][0-9]{5}$/.test(pincodeInput)) {
      (async () => {
        setIsCheckingPincode(true);
        const postal = await lookupPostalPincode(pincodeInput);
        if (postal.success) {
          setVerifiedPostal(postal);
          const courier = await checkCourierAvailability({
            deliveryPincode: pincodeInput,
            pickupPincode: product?.pickupPincode || '110016',
          });
          setCourierResult(courier);
        }
        setIsCheckingPincode(false);
      })();
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

  // Touch gesture swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40 && galleryImages.length > 1) {
      if (diff > 0) {
        // Swiped Left -> Next image
        setIsImageLoading(true);
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      } else {
        // Swiped Right -> Prev image
        setIsImageLoading(true);
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    }
    touchStartXRef.current = null;
  };

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
        showToast(`Saved "${product.title}" to your craft wishlist!`, 'sparkles');
      }
      localStorage.setItem('artisanskart_wishlist_v1', JSON.stringify(list));
    } catch {}
  };

  // Check PIN code via authentic India Post directory + NimbusPost
  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincodeInput.replace(/\D/g, '').slice(0, 6);
    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setPincodeError('Invalid PIN code. Must be 6 digits starting with 1-9.');
      setPincodeErrorCode('INVALID_PINCODE');
      setVerifiedPostal(null);
      setCourierResult(null);
      return;
    }

    setIsCheckingPincode(true);
    setPincodeError('');
    setPincodeErrorCode('');
    setVerifiedPostal(null);
    setCourierResult(null);

    try {
      const postal = await lookupPostalPincode(cleanPin);
      if (!postal.success) {
        setPincodeError(postal.message || 'PIN code not found in official Indian postal directory.');
        setPincodeErrorCode(postal.errorCode || 'PINCODE_NOT_FOUND');
        return;
      }

      setVerifiedPostal(postal);
      setIsEditingPincode(false);
      try {
        sessionStorage.setItem('artisanskart_user_pincode', cleanPin);
      } catch {}

      // Separate courier check
      const courier = await checkCourierAvailability({
        deliveryPincode: cleanPin,
        pickupPincode: product?.pickupPincode || '110016',
        weightKg: 0.5,
        cod: true,
      });
      setCourierResult(courier);
    } catch {
      setPincodeError('Network error connecting to postal directory. Please retry.');
      setPincodeErrorCode('LOOKUP_FAILED');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product.id);
    }
    showToast(`Added ${quantity} × "${product.title}" to your cart!`, 'shopping-cart');
  };

  const handleOrderNow = () => {
    if (!product) return;
    handleAddToCart();
    const targetSlug = getProductSlug(product);
    const variantParam = selectedVariantId ? `&variant=${encodeURIComponent(selectedVariantId)}` : '';
    navigate(`/checkout?product=${targetSlug}&qty=${quantity}${variantParam}`);
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.title} — ArtisansKart.in`,
          text: `Check out this handcrafted "${product.title}" by ${product.maker} on ArtisansKart!`,
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

  // Gallery management actions strictly restricted to authorized platform admins
  const handleAddGalleryImage = (url: string) => {
    if (!isAuthorizedToEdit) {
      showToast('Admin authority required to add photographs.', 'shield-alert');
      return;
    }
    if (!product || !url) return;
    const currentList = product.images && Array.isArray(product.images) ? [...product.images] : [product.image];
    if (!currentList.includes(url)) {
      currentList.push(url);
    }
    const updated: Product = {
      ...product,
      images: currentList,
    };
    updateProduct(updated);
    showToast('New photograph added to craft gallery!', 'check-circle');
    setNewPhotoUrl('');
  };

  const handleDeleteGalleryImage = (imgUrl: string) => {
    if (!isAuthorizedToEdit) {
      showToast('Admin authority required to remove photographs.', 'shield-alert');
      return;
    }
    if (!product) return;
    const currentList = galleryImages.filter((img) => img !== imgUrl);
    if (currentList.length === 0) {
      showToast('Product must have at least one photograph', 'alert-circle');
      return;
    }
    const updated: Product = {
      ...product,
      image: currentList[0],
      images: currentList,
    };
    updateProduct(updated);
    setActiveImageIndex(0);
    showToast('Image removed from craft gallery.', 'check-circle');
  };

  const handleSetPrimaryImage = (imgUrl: string) => {
    if (!isAuthorizedToEdit) {
      showToast('Admin authority required to change primary photograph.', 'shield-alert');
      return;
    }
    if (!product) return;
    const rest = galleryImages.filter((img) => img !== imgUrl);
    const updated: Product = {
      ...product,
      image: imgUrl,
      images: [imgUrl, ...rest],
    };
    updateProduct(updated);
    setActiveImageIndex(0);
    showToast('Primary product image updated!', 'check-circle');
  };

  const handleRemoveAllExtraImages = () => {
    if (!isAuthorizedToEdit) {
      showToast('Admin authority required to remove photographs.', 'shield-alert');
      return;
    }
    if (!product || galleryImages.length <= 1) return;
    const primary = product.image || galleryImages[0];
    const updated: Product = {
      ...product,
      image: primary,
      images: [primary],
    };
    updateProduct(updated);
    setActiveImageIndex(0);
    showToast('All extra pictures removed! Kept primary photo.', 'trash-2');
  };

  // If product not found
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <PackageCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-[#1E293B]">Craft Not Found</h1>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          The piece you are looking for may have been sold or moved to another studio collection.
        </p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C85A32] text-white font-bold text-sm shadow-md hover:bg-[#a04321] transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  // Stock calculations
  const maxStock = Math.max(1, product.inStockCount ?? 15);
  const inStock = maxStock > 0;
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  // Cost split calculations
  const makerShare = Math.round(activePrice * (makerEarningPercent / 100));
  const platformFee = Math.round(activePrice * 0.2);
  const packagingFee = Math.max(0, activePrice - makerShare - platformFee);

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb Navigation & Back Link */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-3 text-xs text-slate-500 border-b border-[#e7e0d8] pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#C85A32] transition">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/marketplace" className="hover:text-[#C85A32] transition">Marketplace</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/marketplace?category=${encodeURIComponent(product.category)}`} className="hover:text-[#C85A32] transition">
            {product.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#C85A32] transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </nav>

      {/* Main Product Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* =========================================================
            LEFT COLUMN: GALLERY WITH THUMBNAILS, SWIPE & LIGHTBOX
        ========================================================= */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
          {/* Vertical / Horizontal Thumbnail Strip & Quick Photo Actions */}
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            {galleryImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[540px] shrink-0 py-1 sm:py-0 select-none w-full sm:w-auto">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (idx !== activeImageIndex) {
                          setIsImageLoading(true);
                          setActiveImageIndex(idx);
                        }
                      }}
                      aria-label={`Select angle ${idx + 1}`}
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
                    {/* Direct Option to remove this extra picture (Admins only) */}
                    {isAuthorizedToEdit && galleryImages.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGalleryImage(imgUrl);
                        }}
                        title={`Remove photo #${idx + 1}`}
                        className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md cursor-pointer transition opacity-80 sm:opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Action Buttons for Photo Removal (Admins only) */}
            {isAuthorizedToEdit && (
              <div className="flex sm:flex-col gap-1.5 w-full">
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRemoveAllExtraImages}
                    title="Remove all extra pictures and keep only the primary photo"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Extra ({galleryImages.length - 1})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsManagePhotosOpen(true)}
                  title="Manage product photographs"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Photos ({galleryImages.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* Main Display Stage with Touch Gestures and Hover Zoom */}
          <div
            className="relative flex-1 w-full bg-white rounded-3xl border border-[#e7e0d8] overflow-hidden aspect-square flex items-center justify-center shadow-xs group select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
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
                    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
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

            {/* Top Right Actions: Lightbox and Image Management */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              {isAuthorizedToEdit && (
                <button
                  type="button"
                  onClick={() => setIsManagePhotosOpen(true)}
                  title="Manage or remove product photographs"
                  className="px-3 py-1.5 rounded-full bg-[#1E293B] text-white hover:bg-[#C85A32] text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Manage Photos</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="View photo in full screen"
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-md backdrop-blur-xs transition cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

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
            RIGHT COLUMN: PRODUCT DETAILS, SMART PINCODE & ORDER ACTIONS
        ========================================================= */}
        <div className="lg:col-span-5 space-y-5">
          {/* Category Tag */}
          <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-block">
            {product.category}
          </span>

          {/* Product Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-[#1E293B] leading-tight tracking-tight">
            {product.title}
          </h1>

          {/* Star Rating with Review Count Link */}
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
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={scrollToReviews}
              className="text-[#C85A32] hover:underline font-semibold cursor-pointer"
            >
              {product.reviews} verified artisan reviews
            </button>
          </div>

          {/* Price Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
            <div className="flex items-baseline flex-wrap gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#1E293B]">
                {formatINR(activePrice)}
              </span>
              {product.originalPrice && product.originalPrice > activePrice && (
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

            {/* Smart Indian Postal & NimbusPost Delivery Intelligence */}
            <div className="pt-3 border-t border-[#e7e0d8]/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C85A32]" /> Delivery Checker
                </span>
                {verifiedPostal && !isEditingPincode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPincode(true);
                    }}
                    className="text-[#C85A32] hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Change PIN
                  </button>
                )}
              </div>

              {isEditingPincode || !verifiedPostal ? (
                <div className="space-y-1.5">
                  <form onSubmit={handleCheckPincode} className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={pincodeInput}
                        onChange={(e) => {
                          setPincodeInput(e.target.value.replace(/\D/g, ''));
                          setPincodeError('');
                        }}
                        placeholder="Enter 6-digit PIN code"
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#C85A32]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCheckingPincode || pincodeInput.replace(/\D/g, '').length !== 6}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1E293B] text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingPincode ? 'Checking...' : 'Check'}
                    </button>
                  </form>
                  {pincodeError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{pincodeError}</span>
                      </div>
                      {pincodeErrorCode === 'LOOKUP_FAILED' && (
                        <button
                          type="button"
                          onClick={(e) => handleCheckPincode(e as any)}
                          className="text-xs font-bold text-rose-700 underline hover:text-rose-900 shrink-0 cursor-pointer"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`text-xs p-3 rounded-2xl flex items-start gap-2.5 ${
                    courierResult?.serviceable
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div className="space-y-1 w-full">
                    <p className="font-bold text-slate-900">
                      Delivery to {verifiedPostal.primaryLocality ? `${verifiedPostal.primaryLocality}, ` : ''}{verifiedPostal.district}, {verifiedPostal.state} ({verifiedPostal.pincode})
                    </p>
                    {courierResult?.serviceable && courierResult.courierName ? (
                      <>
                        <p className="text-[11px] text-slate-700">
                          <strong>{courierResult.etd || '3-4 business days'}</strong> • Shipping: <strong>{courierResult.rate ? `₹${courierResult.rate}` : 'FREE'}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Carrier: {courierResult.courierName} • {courierResult.codAvailable ? 'COD Available' : 'Prepaid Only'}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-amber-800">
                        {courierResult?.message || 'Standard delivery unconfirmed for this PIN. You can continue to address details at checkout.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants Selector */}
          {availableVariants.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Edition / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedVariantId === v.id
                        ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
              <Award className="w-3.5 h-3.5" /> Verified Handcrafted Work
            </span>
          </div>

          {/* Maker Card */}
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
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{product.cls}, {product.school}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('maker')}
              className="text-xs font-bold text-[#C85A32] hover:text-[#a04321] hover:underline shrink-0 cursor-pointer"
            >
              Maker Details →
            </button>
          </div>

          {/* Short Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantity Selector */}
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
              (Max {maxStock} available)
            </span>
          </div>

          {/* Action Buttons: Add to Cart & Prominent Order Now */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 px-4 py-3 sm:static sm:p-0 sm:bg-transparent sm:mx-0 z-20 border-t sm:border-t-0 border-[#e7e0d8]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold border-2 border-[#1E293B] text-[#1E293B] hover:bg-[#1E293B] hover:text-white active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={handleOrderNow}
                className="flex-1 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#C85A32] text-white hover:bg-[#a04321] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#C85A32]/25"
              >
                <Zap className="w-4 h-4 fill-current" /> Order Now
              </button>

              <button
                type="button"
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
                type="button"
                onClick={handleShare}
                aria-label="Share craft"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Trust Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="leading-tight font-medium">Razorpay Secure</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0" />
              <span className="leading-tight font-medium">Artisan Handcrafted</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <Truck className="w-4 h-4 text-[#C85A32] shrink-0" />
              <span className="leading-tight font-medium">Free Ship &gt; ₹499</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#e7e0d8]">
              <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="leading-tight font-medium">Packaging</span>
            </div>
          </div>

          {/* Collapsible Transparent Cost Split */}
          <div className="border border-[#e7e0d8] rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setIsCostBreakdownOpen(!isCostBreakdownOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
                See where your money goes (Transparent Split)
              </span>
              {isCostBreakdownOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {isCostBreakdownOpen && (
              <div className="p-4 pt-1 space-y-3 bg-[#FAF9F6] border-t border-[#e7e0d8]">
                {/* Stacked Percentage Bar */}
                <div className="h-3 rounded-full overflow-hidden flex bg-slate-200">
                  <div
                    style={{ width: `${makerEarningPercent}%` }}
                    className="bg-[#C85A32] transition-all"
                    title={`Independent Maker (${makerEarningPercent}%)`}
                  />
                  <div
                    style={{ width: '20%' }}
                    className="bg-[#1E293B] transition-all"
                    title="Platform Support (20%)"
                  />
                  <div
                    style={{ width: `${Math.max(0, 100 - makerEarningPercent - 20)}%` }}
                    className="bg-[#8A9A86] transition-all"
                    title="Packaging & Logistics"
                  />
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-[#e7e0d8]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Independent Maker</div>
                    <div className="font-black text-[#C85A32] text-sm">{formatINR(makerShare)}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{makerEarningPercent}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#e7e0d8]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Platform Ops</div>
                    <div className="font-black text-[#1E293B] text-sm">{formatINR(platformFee)}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">20%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#e7e0d8]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Packaging</div>
                    <div className="font-black text-[#5c6a58] text-sm">{formatINR(packagingFee)}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{100 - makerEarningPercent - 20}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          BELOW THE MAIN STAGE: TABS FOR SPECIFICATIONS & DETAILS
      ========================================================= */}
      <section ref={reviewsSectionRef} className="pt-8 border-t border-[#e7e0d8]">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto border-b border-[#e7e0d8] pb-px">
          {[
            { id: 'desc', label: 'Description & Craft Story' },
            { id: 'craft', label: 'Craft Specifications' },
            { id: 'maker', label: 'Maker Details & Studio' },
            { id: 'shipping', label: 'Shipping & Delivery' },
            { id: 'reviews', label: `Customer Reviews (${product.reviews})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#C85A32] text-[#C85A32]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-6 sm:py-8 max-w-4xl text-slate-700 leading-relaxed text-sm">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">The Artisan's Vision</h3>
              <p>{product.description || 'Authentic artisan handcrafted creation created with meticulous care.'}</p>
              <p>
                Each piece in our collection is produced on-demand. Minor variations in tone, hand-etched pattern, and natural texture reflect the human hand and make your item uniquely yours.
              </p>
            </div>
          )}

          {activeTab === 'craft' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Craft Details &amp; Materials</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <dt className="text-xs font-bold text-slate-400 uppercase">Materials Used</dt>
                  <dd className="font-semibold text-slate-800 mt-1">{product.materials || 'Pure natural terracotta / stoneware / artisanal supplies'}</dd>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <dt className="text-xs font-bold text-slate-400 uppercase">Dimensions</dt>
                  <dd className="font-semibold text-slate-800 mt-1">{product.dimensions || 'Custom handcrafted proportions'}</dd>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <dt className="text-xs font-bold text-slate-400 uppercase">Weight &amp; Parcel Sizing</dt>
                  <dd className="font-semibold text-slate-800 mt-1">{product.weight || `${product.weightKg || 0.5} kg`}</dd>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8]">
                  <dt className="text-xs font-bold text-slate-400 uppercase">Crafting Time &amp; Origin</dt>
                  <dd className="font-semibold text-slate-800 mt-1">
                    {product.prepTimeDays || 2}-3 Days Studio Crafting • {product.originCity || 'New Delhi'}, India
                  </dd>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] sm:col-span-2">
                  <dt className="text-xs font-bold text-slate-400 uppercase">Care Instructions</dt>
                  <dd className="font-semibold text-slate-800 mt-1">{product.careInstructions || 'Keep away from excessive dampness. Gently wipe clean with dry microfiber cloth.'}</dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === 'maker' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Artisan Profile</h3>
              <div className="p-6 rounded-3xl bg-white border border-[#e7e0d8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center font-black text-xl text-[#C85A32]">
                  {product.maker[0]}
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-base font-black text-[#1E293B]">{product.maker}</h4>
                  <p className="text-xs text-slate-500">{product.cls} • {product.school}</p>
                  <p className="text-xs text-slate-600 pt-1">
                    Independent creator verified on ArtisansKart. {makerEarningPercent}% of each purchase goes directly toward funding the creator's raw craft materials, and creative tools.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Shipping &amp; Delivery Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase text-[#C85A32]">
                    <Truck className="w-4 h-4" /> Pan-India Courier Delivery
                  </h4>
                  <p className="text-xs text-slate-600">
                    Dispatched via verified courier partners (Delhivery, BlueDart, India Post) through NimbusPost logistics network. Free shipping on orders over ₹499.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase text-emerald-700">
                    <PackageCheck className="w-4 h-4 text-emerald-600" /> Safe Transit Packaging
                  </h4>
                  <p className="text-xs text-slate-600">
                    Each handcrafted piece is carefully wrapped and packed with shock-resistant material to reach you safely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Verified Customer Reviews</h3>
                  <p className="text-xs text-slate-500">Genuine feedback from patrons who purchased this craft.</p>
                </div>
                <span className="text-2xl font-black text-[#1E293B] flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  {product.rating} / 5.0
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-[#e7e0d8] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Radhika S. • Verified Buyer</span>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    "The hand-carved terracotta finish is breathtaking! Packed safely in recyclable bubble wrap. It brought so much warmth to our home."
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e7e0d8] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Amitabh V. • Bengaluru</span>
                    <span className="text-amber-500 font-bold">★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    "Arrived right on time via Delhivery. Knowing the proceeds support an artisan directly makes it even more meaningful."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          RELATED PRODUCTS CAROUSEL
      ========================================================= */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#e7e0d8] space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                Handpicked Pairings
              </span>
              <h2 className="text-2xl font-black text-[#1E293B] mt-1">You May Also Like</h2>
            </div>
            <Link to="/marketplace" className="text-xs font-bold text-[#C85A32] hover:underline">
              View All Crafts →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => {
              const relSlug = getProductSlug(rel);
              return (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/product/${relSlug}`)}
                  className="bg-white rounded-2xl p-3 border border-[#e7e0d8] shadow-xs hover:shadow-md hover:border-[#C85A32]/40 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition duration-300"
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#C85A32] transition">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-slate-400">{rel.maker}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-black text-sm text-[#1E293B]">{formatINR(rel.price)}</span>
                    <span className="text-[10px] font-bold text-[#C85A32]">View →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================
          FULL-SCREEN LIGHTBOX MODAL
      ========================================================= */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-in fade-in select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close photo view"
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer z-30"
          >
            <X className="w-6 h-6" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer z-30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer z-30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-4xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[activeImageIndex]}
              alt={product.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* =========================================================
          ADMIN ONLY IMAGE MANAGEMENT MODAL (Supabase Storage)
      ========================================================= */}
      {isAuthorizedToEdit && isManagePhotosOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={() => setIsManagePhotosOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl border border-[#e7e0d8] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1E293B]">Manage Craft Photographs</h3>
                <p className="text-xs text-slate-500">Add, replace, or set primary images for "{product.title}".</p>
              </div>
              <button
                onClick={() => setIsManagePhotosOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Multi-Photo Manager */}
            <div className="space-y-4">
              {galleryImages.length > 1 && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-600">
                    <strong>{galleryImages.length} pictures</strong> ({galleryImages.length - 1} extra {galleryImages.length - 1 === 1 ? 'picture' : 'pictures'})
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAllExtraImages}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove All Extra Pictures</span>
                  </button>
                </div>
              )}

              <MultiImageUploader
                images={galleryImages}
                primaryImage={product.image}
                onChange={(updatedList, newPrimary) => {
                  const toSave: Product = {
                    ...product,
                    image: newPrimary || updatedList[0] || '',
                    images: updatedList,
                  };
                  updateProduct(toSave);
                  setActiveImageIndex(0);
                  showToast(`Updated craft gallery (${updatedList.length} photographs)!`, 'check-circle');
                }}
                minImages={1}
                maxImages={8}
                label="Craft Photo Gallery"
                helperText="Upload photos from your device or web URLs. Star the primary image, and use the trash icon or delete button to remove any extra pictures."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManagePhotosOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#1E293B] text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
