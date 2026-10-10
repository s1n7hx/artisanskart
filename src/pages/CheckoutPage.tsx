import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initiateRazorpayPayment } from '../services/razorpay';
import { checkPincodeServiceability } from '../services/ecommerce';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, products, currentUser, confirmCheckout, showToast, makerEarningPercent } = useApp();

  // Customer Shipping Details
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pincode, setPincode] = useState('560034');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState('');
  const [completedTrackingAwb, setCompletedTrackingAwb] = useState('');

  // Cart calculation
  const cartItemsDetailed = cart.map((item) => {
    const prod = products.find((p) => p.id === item.id);
    return {
      ...item,
      product: prod,
      subtotal: (prod?.price || 0) * item.qty,
    };
  });

  const subtotal = cartItemsDetailed.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const grandTotal = subtotal + shippingFee;

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  // Auto-detect city/state from PIN code
  useEffect(() => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      const pinInfo = checkPincodeServiceability(pincode);
      if (pinInfo.city) setCity(pinInfo.city);
      if (pinInfo.state) setState(pinInfo.state);
    }
  }, [pincode]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty', 'alert-circle');
      return;
    }

    if (!fullName || !phone || !addressLine || !pincode) {
      showToast('Please complete required shipping fields', 'alert-circle');
      return;
    }

    if (paymentMethod === 'cod') {
      setIsProcessing(true);
      setTimeout(() => {
        const orderNum = `AK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const awb = `SR-BLR-${Math.floor(100000 + Math.random() * 900000)}`;
        setCompletedOrderNumber(orderNum);
        setCompletedTrackingAwb(awb);
        confirmCheckout();
        setIsProcessing(false);
        setOrderComplete(true);
        showToast('Order confirmed via Cash on Delivery!', 'check-circle');
      }, 700);
      return;
    }

    // Razorpay Checkout
    setIsProcessing(true);
    try {
      await initiateRazorpayPayment({
        amount: grandTotal,
        customerName: fullName,
        customerEmail: email || 'customer@artisanskart.in',
        customerPhone: phone || '9999999999',
        description: `Order for ${cart.reduce((s, c) => s + c.qty, 0)} student craft items`,
        onSuccess: (res) => {
          setIsProcessing(false);
          const orderNum = `AK-2026-${Math.floor(10000 + Math.random() * 90000)}`;
          const awb = `SR-${res.razorpayPaymentId.slice(-6).toUpperCase()}`;
          setCompletedOrderNumber(orderNum);
          setCompletedTrackingAwb(awb);
          confirmCheckout();
          setOrderComplete(true);
          showToast(`Razorpay payment verified! ID: ${res.razorpayPaymentId}`, 'check-circle');
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
      showToast(err?.message || 'Could not initiate Razorpay checkout.', 'alert-circle');
    }
  };

  // Order Complete Screen
  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Order Placed Successfully
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-[#1E293B]">
            Thank You for Supporting Student Creators!
          </h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Your payment and delivery details have been recorded. A notification receipt will be dispatched to your phone and email.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#e7e0d8] text-left shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e7e0d8]">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order Number</p>
              <p className="font-mono text-base font-bold text-slate-900">{completedOrderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Shiprocket Tracking AWB</p>
              <p className="font-mono text-base font-bold text-[#C85A32]">{completedTrackingAwb}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Delivering To:</span>
              <p>{fullName}</p>
              <p>{addressLine}</p>
              <p>{city}, {state} - {pincode}</p>
              <p>Phone: {phone}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
              <span className="font-bold text-slate-800 block text-xs">Direct Student Impact:</span>
              <p className="text-[#C85A32] font-bold text-sm">
                {formatINR(subtotal * (makerEarningPercent / 100))} credited to student artisans
              </p>
              <p className="text-[11px] text-slate-400">
                100% fair-trade student creator revenue share model
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <Link
            to="/marketplace"
            className="btn-terracotta px-6 py-3 rounded-full text-xs font-bold shadow-xs inline-flex items-center gap-2"
          >
            Explore More Crafts
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

  // Empty cart view
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#C85A32] flex items-center justify-center mx-auto border border-orange-200">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Your Cart is Currently Empty</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Explore handmade campus creations crafted by student artisans and add your favorite crafts to proceed.
        </p>
        <div className="pt-2">
          <Link
            to="/marketplace"
            className="btn-terracotta px-7 py-3.5 rounded-full text-sm font-bold shadow-xs inline-flex items-center gap-2"
          >
            Explore Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e7e0d8]">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#C85A32] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Shipping & Payment Form (7 cols) */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-base font-bold text-[#1E293B]">
              <MapPin className="w-5 h-5 text-[#C85A32]" />
              <span>1. Shipping Address &amp; Delivery Details</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (for SMS &amp; Delivery OTP) <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (for Receipt &amp; Tracking)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Flat, House No., Building, Street <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Flat 304, Green Heights, 1st Cross"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Indian PIN Code <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit PIN code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / District</label>
                <input
                  required
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  required
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-[#1E293B]">
              <CreditCard className="w-5 h-5 text-[#C85A32]" />
              <span>2. Select Payment Method</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#C85A32] bg-orange-50/40 ring-2 ring-[#C85A32]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#C85A32]" /> Razorpay Gateway
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-[#C85A32]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Instant UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking.
                </p>
                <span className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200 w-max">
                  Recommended • Zero Transaction Fee
                </span>
              </div>

              {/* Cash on Delivery Option */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-[#C85A32] bg-orange-50/40 ring-2 ring-[#C85A32]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-slate-600" /> Cash on Delivery (COD)
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#C85A32]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Pay cash or UPI upon courier arrival at your doorstep.
                </p>
                <span className="mt-2 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block w-max">
                  Shiprocket Verified
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="mt-4 w-full py-4 rounded-2xl bg-[#C85A32] hover:bg-[#a04321] text-white font-bold text-sm shadow-lg shadow-[#C85A32]/30 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <Lock className="w-4 h-4" /> Pay {formatINR(grandTotal)} via Razorpay
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm Cash on Delivery Order ({formatINR(grandTotal)})
                </>
              )}
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Order Summary & Fair-Trade Split (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-base">Order Summary ({cart.length} crafts)</h3>

            {/* Item List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cartItemsDetailed.map((item) => (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.product?.image}
                      alt={item.product?.title || 'Craft'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.product?.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {item.qty} × {formatINR(item.product?.price || 0)}
                    </p>
                    <p className="text-[10px] text-[#C85A32] font-semibold">
                      Maker: {item.product?.maker}
                    </p>
                  </div>
                  <span className="text-xs font-black text-slate-900 shrink-0">
                    {formatINR(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-[#e7e0d8] text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Eco Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-[#e7e0d8]">
                <span>Total Amount</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Transparent Student Earning Impact Split */}
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" /> Transparent Impact Split
              </span>
              <div className="h-2 w-full bg-[#f0ebe3] rounded-full overflow-hidden flex">
                <div className="h-full bg-[#C85A32]" style={{ width: `${makerEarningPercent}%` }} />
                <div className="h-full bg-[#1E293B]" style={{ width: '20%' }} />
                <div className="h-full bg-[#8A9A86]" style={{ width: '15%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                <span>Student Maker ({makerEarningPercent}%):</span>
                <strong className="text-[#C85A32]">{formatINR(subtotal * (makerEarningPercent / 100))}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
