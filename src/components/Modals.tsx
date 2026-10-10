import React, { useState } from 'react';
import { X, User, ShoppingCart, PackageCheck, Edit3, Globe, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { Product, CartItem } from '../types';
import { useApp } from '../context/AppContext';
import { initiateRazorpayPayment } from '../services/razorpay';
import { QuickViewModal } from './QuickViewModal';

interface ModalsProps {
  quickViewProduct: Product | null;
  onCloseQuickView: () => void;
  onAddToCart: (id: number) => void;

  isMakerSignupOpen: boolean;
  onCloseMakerSignup: () => void;
  onSubmitMakerSignup: (e: React.FormEvent) => void;

  isCheckoutOpen: boolean;
  onCloseCheckout: () => void;
  onConfirmCheckout: () => void;
  cart: CartItem[];
  products: Product[];
}

export const Modals: React.FC<ModalsProps> = ({
  quickViewProduct,
  onCloseQuickView,
  onAddToCart,
  isMakerSignupOpen,
  onCloseMakerSignup,
  onSubmitMakerSignup,
  isCheckoutOpen,
  onCloseCheckout,
  onConfirmCheckout,
  cart,
  products,
}) => {
  const { openEditorForProduct, makerEarningPercent, currentUser, showToast } = useApp();
  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
  const starString = (rating: number) => {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  const total = cart.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  // Checkout modal form states
  const [checkoutName, setCheckoutName] = useState(currentUser?.name || '');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Sync user name when user logs in
  React.useEffect(() => {
    if (currentUser?.name && !checkoutName) {
      setCheckoutName(currentUser.name);
    }
  }, [currentUser]);

  const handlePaymentSubmit = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'cod') {
      onConfirmCheckout();
      return;
    }

    // Razorpay Flow
    setIsProcessingPayment(true);
    try {
      await initiateRazorpayPayment({
        amount: total,
        customerName: checkoutName || currentUser?.name || 'ArtisansKart Customer',
        customerEmail: currentUser?.email || 'customer@artisanskart.in',
        customerPhone: checkoutPhone || '9999999999',
        description: `Order for ${cart.reduce((s, c) => s + c.qty, 0)} student craft items`,
        onSuccess: (res) => {
          setIsProcessingPayment(false);
          showToast(`Payment verified! ID: ${res.razorpayPaymentId.slice(0, 14)}...`, 'check-circle');
          onConfirmCheckout();
        },
        onFailure: (err) => {
          setIsProcessingPayment(false);
          showToast(err?.message || 'Payment was unsuccessful or cancelled.', 'alert-circle');
        },
        onDismiss: () => {
          setIsProcessingPayment(false);
        },
      });
    } catch (err: any) {
      setIsProcessingPayment(false);
      showToast(err?.message || 'Could not open Razorpay checkout.', 'alert-circle');
    }
  };

  return (
    <>
      {/* QUICK VIEW & COST BREAKDOWN MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={onCloseQuickView}
        onAddToCart={onAddToCart}
      />

      {/* MAKER SIGNUP MODAL */}
      {isMakerSignupOpen && (
        <div
          id="makerSignupOverlay"
          onClick={onCloseMakerSignup}
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4 animate-[fadeIn_0.25s_ease-out]"
        >
          <div
            id="makerSignupPanel"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full mx-auto p-6 md:p-8 shadow-2xl animate-[scaleUp_0.3s_cubic-bezier(.25,.1,.25,1)]"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1E293B]">Sell Your Crafts</h3>
                <p className="text-sm text-slate-500">Join 150+ student creators earning from their art.</p>
              </div>
              <button
                onClick={onCloseMakerSignup}
                className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="makerSignupForm" className="space-y-4" onSubmit={onSubmitMakerSignup}>
              <div>
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                  placeholder="e.g. Aditi Sharma"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">School</label>
                  <input
                    required
                    type="text"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                    placeholder="School name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Class</label>
                  <input
                    required
                    type="text"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                    placeholder="e.g. Class 10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Craft Category</label>
                <select className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm bg-white">
                  <option>Clay Crafts</option>
                  <option>Hand-painted Cards</option>
                  <option>Accessories</option>
                  <option>Keychains</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tell us about your craft</label>
                <textarea
                  rows={3}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                  placeholder="Describe your handmade product..."
                />
              </div>
              <button type="submit" className="w-full btn-terracotta font-semibold py-3.5 rounded-full cursor-pointer">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT CONFIRMATION MODAL WITH RAZORPAY INTEGRATION */}
      {isCheckoutOpen && (
        <div
          id="checkoutOverlay"
          onClick={onCloseCheckout}
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4 animate-[fadeIn_0.25s_ease-out]"
        >
          <div
            id="checkoutPanel"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full mx-auto p-6 md:p-8 text-center shadow-2xl animate-[scaleUp_0.3s_cubic-bezier(.25,.1,.25,1)] max-h-[90vh] overflow-y-auto text-left"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#e7e0d8] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8A9A86]/20 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-[#8A9A86]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1E293B]">Complete Your Order</h3>
                  <p className="text-xs text-slate-500">Handcrafted by student makers with campus dispatch.</p>
                </div>
              </div>
              <button
                onClick={onCloseCheckout}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer transition text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Contact & Address Info */}
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e7e0d8] focus:border-[#C86D51] outline-hidden bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile (for Delivery updates)</label>
                  <input
                    type="tel"
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#e7e0d8] focus:border-[#C86D51] outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Delivery Address & PIN Code</label>
                <input
                  type="text"
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="Hostel / House No, Street, Campus / Locality, PIN Code"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e7e0d8] focus:border-[#C86D51] outline-hidden bg-slate-50/50"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-700 block mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#C86D51] bg-[#C86D51]/5 text-slate-900 ring-2 ring-[#C86D51]/20'
                      : 'border-[#e7e0d8] bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 shrink-0 mt-0.5 ${paymentMethod === 'razorpay' ? 'text-[#C86D51]' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block">Razorpay Gateway</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">UPI, GPay, PhonePe, Cards, NetBanking</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-[#C86D51] bg-[#C86D51]/5 text-slate-900 ring-2 ring-[#C86D51]/20'
                      : 'border-[#e7e0d8] bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PackageCheck className={`w-4 h-4 shrink-0 mt-0.5 ${paymentMethod === 'cod' ? 'text-[#C86D51]' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block">Cash on Delivery</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">Pay on campus delivery</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Order Price Summary */}
            <div className="bg-[#FAF9F6] rounded-xl p-4 mb-5 text-sm border border-[#e7e0d8]">
              <div className="flex justify-between mb-1 text-slate-600 text-xs">
                <span>Items Subtotal ({cart.reduce((s, c) => s + c.qty, 0)} items)</span>
                <span id="checkoutItemsTotal" className="font-semibold text-slate-800">{formatINR(total)}</span>
              </div>
              <div className="flex justify-between mb-1 text-slate-600 text-xs">
                <span>Student Campus Eco Packaging</span>
                <span className="text-[#8A9A86] font-semibold">Free</span>
              </div>
              <div className="flex justify-between font-bold border-t border-black/10 pt-2 mt-2 text-base text-[#1E293B]">
                <span>Payable Amount</span>
                <span id="checkoutGrandTotal" className="text-[#C86D51]">{formatINR(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={isProcessingPayment || cart.length === 0}
                className="w-full btn-terracotta font-semibold py-3.5 rounded-full cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Opening Razorpay Secure Gateway...</span>
                  </>
                ) : paymentMethod === 'razorpay' ? (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatINR(total)} with Razorpay</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4" />
                    <span>Confirm Order (Cash on Delivery)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCloseCheckout}
                disabled={isProcessingPayment}
                className="w-full py-2.5 rounded-full font-medium text-xs text-slate-500 hover:bg-black/5 cursor-pointer transition"
              >
                Cancel &amp; Return
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Secure 256-Bit Encrypted Payments via Razorpay</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
