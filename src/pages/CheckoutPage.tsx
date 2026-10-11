import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  Sparkles,
  CheckCircle2,
  Lock,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  Layers,
  ChevronRight,
  AlertCircle,
  Clock,
  Heart,
  Tag,
  Check,
  Building,
  Home,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, CustomerAddress, OrderItemSnapshot } from '../types';
import { initiateRazorpayPayment } from '../services/razorpay';
import {
  fetchPincodeIntelligence,
  checkPincodeServiceability,
  fetchCustomerAddresses,
  saveCustomerAddress,
  createOrderRecord,
  validateCouponCode,
  findProductBySlugOrId,
} from '../services/ecommerce';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, products, currentUser, confirmCheckout, showToast, makerEarningPercent, addToCart, changeQty } = useApp();

  // URL query params for direct "Order Now"
  const directProductSlug = searchParams.get('product');
  const directQtyParam = Number(searchParams.get('qty') || 1);
  const directVariantParam = searchParams.get('variant');

  // Handle direct product ordering injection if navigated via "Order Now"
  useEffect(() => {
    if (directProductSlug) {
      const prod = findProductBySlugOrId(products, directProductSlug);
      if (prod) {
        const inCart = cart.find((c) => c.id === prod.id);
        if (!inCart) {
          addToCart(prod.id);
        }
      }
    }
  }, [directProductSlug, products]);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  // Address Form
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('560034');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [locality, setLocality] = useState('Koramangala');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [landmark, setLandmark] = useState('');

  // Postal & Courier intelligence state
  const [pincodeInfo, setPincodeInfo] = useState<any>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState('');
  const [completedTrackingAwb, setCompletedTrackingAwb] = useState('');
  const [completedOrderSnapshot, setCompletedOrderSnapshot] = useState<any>(null);

  // Load customer saved addresses
  useEffect(() => {
    fetchCustomerAddresses(currentUser?.id).then((list) => {
      setSavedAddresses(list);
      if (list.length > 0) {
        const def = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(def.id);
        setFullName(def.fullName);
        setPhone(def.phone);
        setPincode(def.pincode);
        setAddressLine1(def.buildingHouse);
        setAddressLine2(def.streetAddress);
        setLocality(def.landmark || '');
        setCity(def.city);
        setState(def.state);
        setLandmark(def.landmark || '');
      }
    });
  }, [currentUser?.id]);

  // Handle Saved Address Switch
  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setAddressLine1('');
      setAddressLine2('');
      setLandmark('');
      return;
    }
    const match = savedAddresses.find((a) => a.id === addrId);
    if (match) {
      setFullName(match.fullName);
      setPhone(match.phone);
      setPincode(match.pincode);
      setAddressLine1(match.buildingHouse);
      setAddressLine2(match.streetAddress);
      setCity(match.city);
      setState(match.state);
      setLandmark(match.landmark || '');
    }
  };

  // Auto-detect Postal Directory & Courier Serviceability on PIN change
  useEffect(() => {
    const cleanPin = pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length === 6 && /^[1-9][0-9]{5}$/.test(cleanPin)) {
      setIsVerifyingPin(true);
      fetchPincodeIntelligence(cleanPin)
        .then((intel) => {
          setPincodeInfo(intel);
          if (intel.district) setCity(intel.district);
          if (intel.state) setState(intel.state);
          if (intel.locality) setLocality(intel.locality);
        })
        .finally(() => setIsVerifyingPin(false));
    } else {
      setPincodeInfo(null);
    }
  }, [pincode]);

  // Detailed items in order
  const checkoutItems = useMemo(() => {
    return cart.map((item) => {
      const prod = products.find((p) => p.id === item.id);
      return {
        ...item,
        product: prod,
        subtotal: (prod?.price || 0) * item.qty,
      };
    }).filter((i) => Boolean(i.product));
  }, [cart, products]);

  // Pricing calculations
  const itemsSubtotal = checkoutItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = itemsSubtotal >= 499 || itemsSubtotal === 0 ? 0 : 49;
  const grandTotal = Math.max(0, itemsSubtotal + shippingFee - couponDiscount);

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Coupon handling
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = validateCouponCode(couponInput, itemsSubtotal);
    if (result.isValid) {
      setAppliedCoupon(result.code);
      setCouponDiscount(result.discountAmount);
      showToast(result.message, 'tag');
    } else {
      showToast(result.message || 'Invalid coupon code', 'alert-circle');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponDiscount(0);
    setCouponInput('');
    showToast('Coupon removed.', 'tag');
  };

  // Order Submission with Server Validation
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutItems.length === 0) {
      showToast('Your order cart is empty.', 'alert-circle');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !pincode.trim()) {
      showToast('Please fill in all required delivery address fields.', 'alert-circle');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'alert-circle');
      return;
    }

    // Prevent duplicate submission
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Validate Order & Prices with trusted server endpoint
      const validateRes = await fetch('/api/checkout/validate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems.map((ci) => ({
            id: ci.id,
            qty: ci.qty,
            title: ci.product?.title,
            price: ci.product?.price,
            maker: ci.product?.maker,
          })),
          couponCode: appliedCoupon,
          pincode,
        }),
      });

      const validatedData = await validateRes.json().catch(() => ({}));
      const verifiedTotal = validatedData.totalAmount !== undefined ? validatedData.totalAmount : grandTotal;

      // 2. Prepare Customer Address object
      const shippingAddressObj: CustomerAddress = {
        id: selectedAddressId !== 'new' ? selectedAddressId : `addr_${Date.now()}`,
        userId: currentUser?.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        pincode: pincode.trim(),
        buildingHouse: addressLine1.trim(),
        streetAddress: addressLine2.trim() || locality.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        country: 'India',
        isDefault: true,
      };

      if (saveAddressForFuture && currentUser?.id) {
        saveCustomerAddress(shippingAddressObj).catch(() => {});
      }

      // 3. Snapshot Order Items
      const orderItemSnapshots: OrderItemSnapshot[] = checkoutItems.map((ci) => ({
        productId: ci.product!.id,
        title: ci.product!.title,
        imageUrl: ci.product!.image,
        unitPrice: ci.product!.price,
        quantity: ci.qty,
        subtotal: ci.subtotal,
        makerName: ci.product!.maker,
        makerId: ci.product!.makerId,
        makerEarningPercent: makerEarningPercent,
        makerShareAmount: Math.round(ci.subtotal * (makerEarningPercent / 100)),
        productionStatus: 'pending',
      }));

      // A. COD Payment Flow
      if (paymentMethod === 'cod') {
        const orderNum = `AK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const awb = `SR-COD-${Math.floor(100000 + Math.random() * 900000)}`;

        const orderRecord = await createOrderRecord({
          orderNumber: orderNum,
          customerName: fullName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          shippingAddress: shippingAddressObj,
          amount: verifiedTotal,
          itemsTotal: itemsSubtotal,
          shippingFee,
          discountAmount: couponDiscount,
          status: 'awaiting_maker_acceptance',
          paymentStatus: 'cod',
          paymentMethod: 'cod',
          trackingAwb: awb,
          courierName: pincodeInfo?.recommendedCourier || 'Delhivery Surface (Eco-Packaging)',
          items: orderItemSnapshots,
          makerId: checkoutItems[0]?.product?.makerId,
          makerName: checkoutItems[0]?.product?.maker,
          pickupPincode: checkoutItems[0]?.product?.pickupPincode || '110016',
        });

        setCompletedOrderNumber(orderNum);
        setCompletedTrackingAwb(awb);
        setCompletedOrderSnapshot(orderRecord);
        confirmCheckout();
        setIsProcessing(false);
        setOrderComplete(true);
        showToast('Order confirmed via Cash on Delivery!', 'check-circle');
        return;
      }

      // B. Razorpay Prepaid Payment Flow
      await initiateRazorpayPayment({
        amount: verifiedTotal,
        customerName: fullName.trim(),
        customerEmail: email.trim() || 'customer@artisanskart.in',
        customerPhone: phone.trim() || '9999999999',
        description: `ArtisansKart Order for ${checkoutItems.reduce((s, c) => s + c.qty, 0)} student creations`,
        onSuccess: async (payRes) => {
          const orderNum = `AK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
          const awb = `SR-RZP-${payRes.razorpayPaymentId.slice(-6).toUpperCase()}`;

          const orderRecord = await createOrderRecord({
            orderNumber: orderNum,
            customerName: fullName.trim(),
            customerEmail: email.trim(),
            customerPhone: phone.trim(),
            shippingAddress: shippingAddressObj,
            amount: verifiedTotal,
            itemsTotal: itemsSubtotal,
            shippingFee,
            discountAmount: couponDiscount,
            status: 'awaiting_maker_acceptance',
            paymentStatus: 'paid',
            paymentMethod: 'razorpay',
            trackingAwb: awb,
            courierName: pincodeInfo?.recommendedCourier || 'BlueDart Air Express',
            items: orderItemSnapshots,
            makerId: checkoutItems[0]?.product?.makerId,
            makerName: checkoutItems[0]?.product?.maker,
            pickupPincode: checkoutItems[0]?.product?.pickupPincode || '110016',
          });

          setCompletedOrderNumber(orderNum);
          setCompletedTrackingAwb(awb);
          setCompletedOrderSnapshot(orderRecord);
          confirmCheckout();
          setIsProcessing(false);
          setOrderComplete(true);
          showToast(`Payment verified! Order #${orderNum} placed.`, 'check-circle');
        },
        onFailure: (err) => {
          setIsProcessing(false);
          showToast(err?.message || 'Payment was unsuccessful or cancelled.', 'alert-circle');
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      showToast(err?.message || 'Could not place order. Please try again.', 'alert-circle');
    }
  };

  // =========================================================
  // ORDER CONFIRMATION SCREEN
  // =========================================================
  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 space-y-8 animate-in fade-in">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-block">
            Order Confirmed &amp; Dispatched to Studio
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1E293B]">
            Thank You for Supporting Student Artists!
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Your order has been routed directly to the student maker. Crafting will begin as soon as the studio accepts the specifications.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e0d8]">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Reference</span>
              <p className="text-xl font-black text-[#1E293B] font-mono">{completedOrderNumber}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shiprocket Tracking AWB</span>
              <p className="text-sm font-bold text-[#C85A32] font-mono">{completedTrackingAwb}</p>
            </div>
          </div>

          {/* Workflow Status Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Artisan Production Workflow:</span>
              <span className="font-semibold text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-0.5 rounded-full">
                Step 1: Awaiting Maker Acceptance
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="w-1/6 h-full bg-[#C85A32]" />
            </div>
            <p className="text-[11px] text-slate-500">
              The student maker has 24 hours to confirm the raw materials and commence crafting.
            </p>
          </div>

          {/* Shipping Address Review */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Delivery Destination</span>
            <p className="text-xs font-bold text-slate-800">{fullName} • {phone}</p>
            <p className="text-xs text-slate-600">
              {addressLine1}, {addressLine2 ? `${addressLine2}, ` : ''}{city}, {state} - {pincode}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/marketplace"
              className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-[#1E293B] text-white hover:bg-slate-800 text-center transition shadow-md"
            >
              Continue Exploring Student Crafts
            </Link>
            <Link
              to="/"
              className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 text-center transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // CHECKOUT PAGE MAIN VIEW
  // =========================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between border-b border-[#e7e0d8] pb-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#C85A32] transition cursor-pointer mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Shop
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            Checkout &amp; Order Placement
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit Secure Checkout</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* =========================================================
            LEFT COLUMN (7 cols): SAVED ADDRESSES & DELIVERY FORM
        ========================================================= */}
        <div className="lg:col-span-7 space-y-8">
          {/* Saved Addresses Selector (if user has any) */}
          {savedAddresses.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#e7e0d8] shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Home className="w-4 h-4 text-[#C85A32]" />
                Select a Saved Delivery Address
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr.id)}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer text-xs space-y-1 ${
                      selectedAddressId === addr.id
                        ? 'border-[#C85A32] bg-[#FAF9F6] shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{addr.fullName}</span>
                      {selectedAddressId === addr.id && (
                        <Check className="w-4 h-4 text-[#C85A32]" />
                      )}
                    </div>
                    <p className="text-slate-500 truncate">{addr.buildingHouse}, {addr.streetAddress}</p>
                    <p className="text-slate-600 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}

                <div
                  onClick={() => handleSelectSavedAddress('new')}
                  className={`p-3.5 rounded-2xl border-2 border-dashed transition cursor-pointer text-xs flex items-center justify-center gap-2 font-bold ${
                    selectedAddressId === 'new'
                      ? 'border-[#C85A32] text-[#C85A32] bg-[#FAF9F6]'
                      : 'border-slate-300 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>+ Enter a New Address</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address Input Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
            <div className="border-b border-[#e7e0d8] pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C85A32]" />
                Delivery Address Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure phone and PIN code are accurate for verified courier delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">10-Digit Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address (for order receipts)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              {/* PIN Code with auto-lookup */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">6-Digit PIN Code *</label>
                  {isVerifyingPin && (
                    <span className="text-[11px] text-[#C85A32] flex items-center gap-1 font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Verifying postal hub...
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 560034"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs font-mono font-bold"
                />

                {pincodeInfo && (
                  <div
                    className={`mt-1.5 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
                      pincodeInfo.isServiceable
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <span>
                      Verified: <strong>{pincodeInfo.locality ? `${pincodeInfo.locality}, ` : ''}{pincodeInfo.district}, {pincodeInfo.state}</strong>
                    </span>
                    <span className="text-[10px] opacity-80 shrink-0 font-semibold">
                      {pincodeInfo.recommendedCourier}
                    </span>
                  </div>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700">Flat / House No. / Building / Floor *</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Flat 402, Green Glen Apartments"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700">Street / Area / Sector</label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Outer Ring Road, Bellandur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              {/* City & State */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">City / District *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Central Mall"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>
            </div>

            {/* Save Address Toggle */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveAddressCheckbox"
                checked={saveAddressForFuture}
                onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                className="w-4 h-4 rounded text-[#C85A32] focus:ring-[#C85A32] cursor-pointer"
              />
              <label htmlFor="saveAddressCheckbox" className="text-xs text-slate-600 cursor-pointer">
                Save this delivery address to my account for future orders
              </label>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e0d8] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C85A32]" />
              Select Payment Method
            </h2>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#C85A32] bg-[#FAF9F6] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Online Payment (Razorpay)
                  </span>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="text-[#C85A32]"
                  />
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Pay securely via UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, or NetBanking.
                </p>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'cod'
                    ? 'border-[#C85A32] bg-[#FAF9F6] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C85A32]" />
                    Cash on Delivery (COD)
                  </span>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-[#C85A32]"
                  />
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Pay in cash when the student craft is delivered to your doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN (5 cols): ORDER SUMMARY & COST BREAKDOWN
        ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#e7e0d8] shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between border-b pb-3">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-slate-500">{checkoutItems.length} items</span>
            </h2>

            {/* Items List with Live Qty Edit */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex gap-3 items-start pb-3 border-b border-slate-100 last:border-b-0">
                  <img
                    src={item.product?.image}
                    alt={item.product?.title}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">
                      {item.product?.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Crafted by <strong>{item.product?.maker}</strong>
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      {/* Qty Counter */}
                      <div className="inline-flex items-center border border-slate-200 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => changeQty(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-black text-slate-900">{formatINR(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2 border-t border-[#e7e0d8]">
              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon}</strong> (-{formatINR(couponDiscount)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. STUDENT10)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="pt-3 border-t border-[#e7e0d8] space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatINR(itemsSubtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Shipping Charges</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Taxes &amp; Packaging</span>
                <span>Included</span>
              </div>

              <div className="pt-3 border-t border-[#e7e0d8] flex items-center justify-between text-base font-black text-slate-900">
                <span>Final Payable</span>
                <span className="text-xl text-[#C85A32]">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isProcessing || checkoutItems.length === 0}
              className="w-full py-4 rounded-2xl bg-[#C85A32] hover:bg-[#a04321] text-white font-black text-sm shadow-lg shadow-[#C85A32]/25 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Secure Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order &amp; Pay {formatINR(grandTotal)}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              By confirming, you agree to ArtisansKart's 7-Day Return and Student Creator Guarantee.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
