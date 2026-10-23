import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, CustomerAddress, OrderItemSnapshot, PostalLookupResult, CourierServiceabilityResult } from '../types';
import { initiateRazorpayPayment } from '../services/razorpay';
import { OrderTimeline } from '../components/OrderTimeline';
import {
  fetchCustomerAddresses,
  saveCustomerAddress,
  createOrderRecord,
  validateCouponCode,
  findProductBySlugOrId,
  lookupPostalPincode,
  checkCourierAvailability,
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

  // Address Form (Empty by default; never hardcoded to Guwahati or Bangalore)
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');

  // Postal & Courier state (Strictly Separated)
  const [postalLookupStatus, setPostalLookupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [verifiedPostal, setVerifiedPostal] = useState<PostalLookupResult | null>(null);
  const [postalErrorMessage, setPostalErrorMessage] = useState('');
  const [postalErrorCode, setPostalErrorCode] = useState('');
  const [availableLocalities, setAvailableLocalities] = useState<string[]>([]);
  const [courierResult, setCourierResult] = useState<CourierServiceabilityResult | null>(null);
  const [courierStatus, setCourierStatus] = useState<'idle' | 'loading' | 'checked'>('idle');

  // Sequence ref to prevent out-of-order API responses from overwriting newer PIN entries
  const lookupRequestIdRef = useRef<number>(0);

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

  // Core Lookup Logic: Runs real postal lookup, then separate courier check
  const executePostalAndCourierLookup = async (cleanPin: string, reqId: number) => {
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      if (reqId === lookupRequestIdRef.current) {
        setPostalLookupStatus('error');
        setPostalErrorCode('INVALID_PINCODE');
        setPostalErrorMessage('Invalid PIN code. Must be 6 digits and start with 1-9.');
      }
      return;
    }

    setPostalLookupStatus('loading');
    setCourierStatus('idle');

    // 1. Authentic Postal Lookup
    const postal = await lookupPostalPincode(cleanPin);

    // Stale check: Discard if customer typed a newer PIN while waiting
    if (reqId !== lookupRequestIdRef.current) return;

    if (!postal.success) {
      if (postal.errorCode === 'LOOKUP_FAILED') {
        setPostalLookupStatus('idle');
        setPostalErrorCode('LOOKUP_FAILED');
        setPostalErrorMessage('Unable to auto-fill address details. Please fill them manually.');
        showToast('Unable to auto-fill address details. Please fill them manually.', 'info');
      } else {
        setPostalLookupStatus('error');
        setPostalErrorCode(postal.errorCode || 'PINCODE_NOT_FOUND');
        setPostalErrorMessage(postal.message || 'PIN code not found in Indian postal registry.');
      }
      return;
    }

    // Postal lookup succeeded
    setPostalLookupStatus('success');
    setVerifiedPostal(postal);
    setPostalErrorMessage('');
    setPostalErrorCode('');

    if (postal.district) setCity(postal.district);
    if (postal.state) setState(postal.state);

    const locs = postal.localities && postal.localities.length > 0
      ? postal.localities
      : [postal.primaryLocality || postal.district || ''];
    setAvailableLocalities(locs);

    const initialLocality = postal.primaryLocality || locs[0] || '';
    setLocality(initialLocality);

    // Note: Customer's addressLine1, addressLine2, landmark remain untouched!

    // 2. Separate NimbusPost Courier Serviceability & Live Rate Check
    const totalCartWeightKg = checkoutItems.reduce((acc, item) => {
      const weight = Number(item.product?.weightKg || 0.5);
      return acc + (weight * item.qty);
    }, 0) || 0.5;

    setCourierStatus('loading');
    const courier = await checkCourierAvailability({
      deliveryPincode: cleanPin,
      pickupPincode: checkoutItems[0]?.product?.pickupPincode || '110016',
      weightKg: totalCartWeightKg,
      cod: true,
    });

    if (reqId !== lookupRequestIdRef.current) return;

    setCourierStatus('checked');
    setCourierResult(courier);
    if (courier && courier.serviceable && courier.rate !== undefined) {
      setShippingFee(courier.rate);
    } else {
      setShippingFee(0);
    }
  };

  // Immediate PIN editing handler: Instantly clears stale data
  const handlePincodeChange = (raw: string) => {
    const cleanPin = raw.replace(/\D/g, '').slice(0, 6);
    setPincode(cleanPin);

    // Clear previous verified location, courier, and stale serviceability immediately!
    setVerifiedPostal(null);
    setCourierResult(null);
    setShippingFee(0);
    setPostalErrorMessage('');
    setPostalErrorCode('');
    setAvailableLocalities([]);

    lookupRequestIdRef.current += 1;
    const currentReqId = lookupRequestIdRef.current;

    if (cleanPin.length === 0) {
      setPostalLookupStatus('idle');
      setCity('');
      setState('');
      setLocality('');
      return;
    }

    if (cleanPin.length < 6) {
      setPostalLookupStatus('idle');
      return;
    }

    executePostalAndCourierLookup(cleanPin, currentReqId);
  };

  const handleRetryLookup = () => {
    if (pincode.length === 6) {
      lookupRequestIdRef.current += 1;
      executePostalAndCourierLookup(pincode, lookupRequestIdRef.current);
    }
  };

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

        if (def.pincode && def.pincode.length === 6) {
          lookupRequestIdRef.current += 1;
          executePostalAndCourierLookup(def.pincode, lookupRequestIdRef.current);
        }
      }
    });
  }, [currentUser?.id]);

  // Handle Saved Address Switch
  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setPincode('');
      setAddressLine1('');
      setAddressLine2('');
      setLocality('');
      setCity('');
      setState('');
      setLandmark('');
      setVerifiedPostal(null);
      setCourierResult(null);
      setPostalLookupStatus('idle');
      setPostalErrorMessage('');
      setAvailableLocalities([]);
      return;
    }
    const match = savedAddresses.find((a) => a.id === addrId);
    if (match) {
      setFullName(match.fullName);
      setPhone(match.phone);
      setPincode(match.pincode);
      setAddressLine1(match.buildingHouse);
      setAddressLine2(match.streetAddress);
      setLocality(match.landmark || '');
      setCity(match.city);
      setState(match.state);
      setLandmark(match.landmark || '');

      if (match.pincode && match.pincode.length === 6) {
        lookupRequestIdRef.current += 1;
        executePostalAndCourierLookup(match.pincode, lookupRequestIdRef.current);
      }
    }
  };

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

  // Fixed packaging fee based on item weight: Small (<1kg) = ₹30, Big (>=1kg) = ₹60
  const packagingFee = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      const weight = Number(item.product?.weightKg || 0.5);
      return acc + (weight < 1 ? 30 : 60);
    }, 0);
  }, [checkoutItems]);

  const [shippingFee, setShippingFee] = useState(0);
  const grandTotal = Math.max(0, itemsSubtotal + packagingFee + shippingFee - couponDiscount);
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

  // Order Submission with Server Validation & Pre-payment Database Persistence
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
            weightKg: ci.product?.weightKg || 0.5,
          })),
          couponCode: appliedCoupon,
          pincode,
          shippingFee,
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

      const orderNum = `AK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const awb = `NP-${Math.floor(100000 + Math.random() * 900000)}`;

      // A. COD Payment Flow
      if (paymentMethod === 'cod') {
        const orderRecord = await createOrderRecord({
          orderNumber: orderNum,
          customerName: fullName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          shippingAddress: shippingAddressObj,
          amount: verifiedTotal,
          itemsTotal: itemsSubtotal,
          packagingFee,
          discountAmount: couponDiscount,
          status: 'awaiting_maker_acceptance',
          paymentStatus: 'cod',
          paymentMethod: 'cod',
          trackingAwb: awb,
          courierName: courierResult?.courierName || (courierResult?.serviceable ? 'NimbusPost Express Partner' : 'Standard Hub Dispatch'),
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
      // Pre-persist order in database before launching payment gateway to prevent zombie payments
      const initialPrepaidOrder = await createOrderRecord({
        orderNumber: orderNum,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: shippingAddressObj,
        amount: verifiedTotal,
        itemsTotal: itemsSubtotal,
        packagingFee,
        discountAmount: couponDiscount,
        status: 'order_placed',
        paymentStatus: 'pending',
        paymentMethod: 'razorpay',
        trackingAwb: awb,
        courierName: courierResult?.courierName || (courierResult?.serviceable ? 'NimbusPost Express Partner' : 'Standard Hub Dispatch'),
        items: orderItemSnapshots,
        makerId: checkoutItems[0]?.product?.makerId,
        makerName: checkoutItems[0]?.product?.maker,
        pickupPincode: checkoutItems[0]?.product?.pickupPincode || '110016',
      });

      await initiateRazorpayPayment({
        amount: verifiedTotal,
        orderNumber: orderNum,
        customerName: fullName.trim(),
        customerEmail: email.trim() || 'customer@artisanskart.in',
        customerPhone: phone.trim() || '9999999999',
        description: `ArtisansKart Order #${orderNum} for ${checkoutItems.reduce((s, c) => s + c.qty, 0)} handcrafted creations`,
        notes: {
          order_number: orderNum,
        },
        onSuccess: async (payRes) => {
          const updatedAwb = `NP-${payRes.razorpayPaymentId.slice(-6).toUpperCase()}`;

          const confirmedRecord = await createOrderRecord({
            ...initialPrepaidOrder,
            orderNumber: orderNum,
            paymentStatus: 'paid',
            status: 'awaiting_maker_acceptance',
            trackingAwb: updatedAwb,
          });

          setCompletedOrderNumber(orderNum);
          setCompletedTrackingAwb(updatedAwb);
          setCompletedOrderSnapshot(confirmedRecord);
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
            Thank You for Supporting Independent Artisans!
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Your order has been routed directly to the artisan. Crafting will begin as soon as the studio accepts the specifications.
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
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courier Tracking AWB (NimbusPost)</span>
              <p className="text-sm font-bold text-[#C85A32] font-mono">{completedTrackingAwb}</p>
            </div>
          </div>

          {/* Workflow Status Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Production &amp; Delivery Timeline</h3>
            <OrderTimeline
              order={
                completedOrderSnapshot || {
                  id: Date.now(),
                  orderNumber: completedOrderNumber,
                  status: 'awaiting_maker_acceptance',
                  trackingAwb: completedTrackingAwb,
                  courierName: 'NimbusPost Express Partner',
                  amount: completedOrderSnapshot?.amount || grandTotal,
                  itemsTotal: itemsSubtotal,
                  product: checkoutItems.map((c) => c.product?.title).join(', '),
                  qty: checkoutItems.reduce((s, c) => s + c.qty, 0),
                  city: `${city}, ${state}`,
                  deadline: '3-4 business days',
                  shippingFee: 0,
                  discountAmount: couponDiscount,
                  customerName: fullName,
                  paymentStatus: paymentMethod === 'cod' ? 'cod' : 'paid',
                  paymentMethod: paymentMethod,
                }
              }
            />
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
              to={`/track/${completedOrderNumber}`}
              className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-[#C85A32] text-white hover:bg-[#b04a25] text-center transition shadow-md"
            >
              Track Order Live ({completedOrderNumber})
            </Link>
            <Link
              to="/marketplace"
              className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-[#1E293B] text-white hover:bg-slate-800 text-center transition shadow-md"
            >
              Continue Exploring Creations
            </Link>
            <Link
              to="/"
              className="py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 text-center transition"
            >
              Home
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
            <ArrowLeft className="w-4 h-4" /> Back to Shop
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

              {/* PIN Code with Authentic Postal Directory Auto-Lookup */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>6-Digit Indian PIN Code *</span>
                    <span className="text-[10px] text-slate-400 font-normal">(All India supported)</span>
                  </label>
                  {postalLookupStatus === 'loading' && (
                    <span className="text-[11px] text-[#C85A32] flex items-center gap-1 font-semibold animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Verifying postal directory...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter 6-digit PIN code (e.g. 110001, 560034, 400001)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none bg-white text-xs font-mono font-bold transition ${
                      postalLookupStatus === 'error' && postalErrorCode !== 'LOOKUP_FAILED'
                        ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                        : postalLookupStatus === 'success'
                        ? 'border-emerald-400 focus:border-emerald-500'
                        : 'border-slate-300 focus:border-[#C85A32]'
                    }`}
                  />
                  {postalLookupStatus === 'success' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Honest Error State: Invalid PIN or Not Found */}
                {postalLookupStatus === 'error' && postalErrorCode !== 'LOOKUP_FAILED' && (
                  <div className="mt-1.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{postalErrorMessage}</p>
                        <p className="text-[11px] text-red-700 mt-0.5">
                          {postalErrorCode === 'INVALID_PINCODE'
                            ? 'Please ensure you entered a standard 6-digit numeric Indian postal code.'
                            : 'This PIN code was not found in authentic Indian postal directory records.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Graceful Manual Fallback Info Banner */}
                {postalErrorCode === 'LOOKUP_FAILED' && (
                  <div className="mt-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Unable to auto-fill address details. Please fill them manually.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRetryLookup}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition cursor-pointer shrink-0"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Verified Postal Registry Result: Authentic locality, district, state */}
                {postalLookupStatus === 'success' && verifiedPostal && (
                  <div className="mt-1.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-900">
                          Verified Postal Location: {verifiedPostal.district}, {verifiedPostal.state}
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        PIN {verifiedPostal.pincode}
                      </span>
                    </div>

                    {/* Multiple Post Offices / Localities selector */}
                    {availableLocalities.length > 1 && (
                      <div className="pt-2 border-t border-emerald-200/80">
                        <label className="font-bold text-slate-700 block text-[11px] mb-1">
                          Select Delivery Post Office / Locality ({availableLocalities.length} found in this PIN):
                        </label>
                        <select
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C85A32]"
                        >
                          {availableLocalities.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Separate Courier Delivery Status (NimbusPost) */}
                {courierStatus === 'loading' && (
                  <div className="mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#C85A32]" />
                    <span>Checking courier serviceability &amp; delivery time for PIN {pincode}...</span>
                  </div>
                )}

                {courierStatus === 'checked' && courierResult && (
                  <div
                    className={`mt-1.5 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                      courierResult.serviceable
                        ? 'bg-blue-50 border-blue-200 text-blue-950'
                        : courierResult.courierAvailable
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className={`w-4 h-4 shrink-0 ${courierResult.serviceable ? 'text-blue-600' : 'text-slate-500'}`} />
                      <div>
                        {courierResult.serviceable && courierResult.courierName ? (
                          <p className="font-bold text-blue-900">
                            Serviceable via {courierResult.courierName}
                            {courierResult.etd ? ` • ${courierResult.etd}` : ''}
                          </p>
                        ) : courierResult.courierAvailable ? (
                          <p className="font-bold text-amber-900">
                            Courier service currently outside standard zone for this PIN.
                          </p>
                        ) : (
                          <p className="font-medium text-slate-700">
                            Postal location verified. Courier routing under standard dispatch.
                          </p>
                        )}
                      </div>
                    </div>
                    {courierResult.serviceable && (
                      <span className="text-[10px] font-bold bg-white text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                        {packagingFee === 0 ? 'Free Packaging' : `₹${packagingFee} Packaging Fee`}
                      </span>
                    )}
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
                  placeholder="e.g. Outer Ring Road, 4th Cross"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              {/* Locality / Sub-area (if user wants to customize) */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700">Locality / Post Office Name *</label>
                <input
                  type="text"
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Connaught Place, Koramangala, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              {/* City & State (prefilled from authentic postal directory) */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>City / District *</span>
                  {postalLookupStatus === 'success' && (
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Auto-filled from postal directory"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>State *</span>
                  {postalLookupStatus === 'success' && (
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Auto-filled from postal directory"
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
                  Pay in cash when the handcrafted piece is delivered to your doorstep.
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
                    placeholder="Coupon code (e.g. MAKER10)"
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
                <span>Packaging Fee</span>
                <span className="font-bold text-slate-900">
                  {packagingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatINR(packagingFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Delivery &amp; Courier Fee</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatINR(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Taxes &amp; GST</span>
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
              By confirming, you agree to ArtisansKart's Terms of Sale (All Sales Final) and Artisan Creator Guarantee.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
