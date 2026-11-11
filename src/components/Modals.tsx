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

  // Maker Signup state
  const [makerEmail, setMakerEmail] = useState(currentUser?.email || '');
  const [makerPhone, setMakerPhone] = useState('');
  React.useEffect(() => {
    if (currentUser?.email && !makerEmail) {
      setMakerEmail(currentUser.email);
    }
  }, [currentUser]);

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
                <p className="text-sm text-slate-500">Join ArtisansKart and become independent creator/ artisan and start earning from your valuable crafts.</p>
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
                  name="full_name"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                  placeholder="e.g. Aditi Sharma"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input
                  required
                  type="email"
                  name="applicant_email"
                  value={makerEmail}
                  onChange={(e) => setMakerEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                  placeholder="e.g. aditi@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Contact Phone Number *</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={makerPhone}
                  onChange={(e) => setMakerPhone(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Studio / Collective</label>
                  <input
                    required
                    type="text"
                    name="school"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                    placeholder="Studio or brand name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Experience / Series</label>
                  <input
                    required
                    type="text"
                    name="grade_class"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm"
                    placeholder="e.g. Master Artisan / Independent"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Craft Category</label>
                <select name="craft_type" className="w-full mt-1 px-4 py-2.5 rounded-xl border border-[#e7e0d8] text-sm bg-white">
                  <option>Clay Crafts</option>
                  <option>Hand-painted Cards</option>
                  <option>Accessories</option>
                  <option>Keychains</option>
                  <option>Crochet</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Tell us about your craft</label>
                <textarea
                  name="message"
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
    </>
  );
};
