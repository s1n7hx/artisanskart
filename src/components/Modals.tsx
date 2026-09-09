import React from 'react';
import { X, User, ShoppingCart, PackageCheck, Edit3, Globe, Sparkles } from 'lucide-react';
import { Product, CartItem } from '../types';
import { useApp } from '../context/AppContext';

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
  const { openEditorForProduct } = useApp();
  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
  const starString = (rating: number) => {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  const total = cart.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  return (
    <>
      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div
          id="quickViewOverlay"
          onClick={onCloseQuickView}
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4 animate-[fadeIn_0.25s_ease-out]"
        >
          <div
            id="quickViewPanel"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full mx-auto p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-[scaleUp_0.3s_cubic-bezier(.25,.1,.25,1)]"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-[#1E293B]">Quick View &amp; Cost Breakdown</h3>
              <button
                onClick={onCloseQuickView}
                className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="quickViewContent" className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  className="w-full h-64 md:h-full object-cover rounded-2xl"
                />
              </div>
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-1 rounded-full mb-2">
                  <User className="w-3 h-3" /> Made by {quickViewProduct.maker} • {quickViewProduct.cls},{' '}
                  {quickViewProduct.school}
                </p>
                <h3 className="text-2xl font-bold mb-1 text-[#1E293B]">{quickViewProduct.title}</h3>
                <div className="flex items-center gap-1 mb-3">
                  <span className="stars text-sm">{starString(quickViewProduct.rating)}</span>
                  <span className="text-xs text-slate-400">
                    {quickViewProduct.rating} ({quickViewProduct.reviews} reviews)
                  </span>
                  <span className="text-slate-300 mx-1">•</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {quickViewProduct.stock}
                  </span>
                </div>

                {/* Craft Description */}
                {quickViewProduct.description && (
                  <div className="my-3 p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-xs leading-relaxed text-slate-700">
                    <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Artisan Craft Description</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified Student Work
                      </span>
                    </div>
                    <p>{quickViewProduct.description}</p>
                  </div>
                )}

                <p className="text-3xl font-black mb-4 text-[#1E293B]">{formatINR(quickViewProduct.price)}</p>

                <p className="font-semibold text-sm mb-3 text-[#1E293B]">Transparent Price Split</p>
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Student Maker Earnings</span>
                      <span className="font-bold text-[#C85A32]">
                        {formatINR(quickViewProduct.price * 0.65)} (65%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f0ebe3] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C85A32] rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>ArtisansKart Platform &amp; Server Fee</span>
                      <span>{formatINR(quickViewProduct.price * 0.2)} (20%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f0ebe3] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1E293B] rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Eco Packaging &amp; Delivery</span>
                      <span>{formatINR(quickViewProduct.price * 0.15)} (15%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f0ebe3] rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A9A86] rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onAddToCart(quickViewProduct.id);
                    onCloseQuickView();
                  }}
                  className="mt-2 w-full btn-terracotta font-semibold py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* CHECKOUT CONFIRMATION MODAL */}
      {isCheckoutOpen && (
        <div
          id="checkoutOverlay"
          onClick={onCloseCheckout}
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4 animate-[fadeIn_0.25s_ease-out]"
        >
          <div
            id="checkoutPanel"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full mx-auto p-8 text-center shadow-2xl animate-[scaleUp_0.3s_cubic-bezier(.25,.1,.25,1)]"
          >
            <div className="w-16 h-16 rounded-full bg-[#8A9A86]/20 flex items-center justify-center mx-auto mb-4">
              <PackageCheck className="w-8 h-8 text-[#8A9A86]" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-[#1E293B]">Confirm Your Order</h3>
            <p className="text-slate-500 text-sm mb-6">
              Your handcrafted items will be made-on-demand by our student artisans and shipped in eco-friendly packaging.
            </p>
            <div className="bg-[#FAF9F6] rounded-xl p-4 mb-6 text-left text-sm border border-[#e7e0d8]">
              <div className="flex justify-between mb-1">
                <span>Items Total</span>
                <span id="checkoutItemsTotal">{formatINR(total)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Eco Delivery</span>
                <span className="text-[#8A9A86] font-semibold">Free</span>
              </div>
              <div className="flex justify-between font-bold border-t border-black/10 pt-2 mt-2 text-base text-[#1E293B]">
                <span>Grand Total</span>
                <span id="checkoutGrandTotal">{formatINR(total)}</span>
              </div>
            </div>
            <button
              onClick={onConfirmCheckout}
              className="w-full btn-terracotta font-semibold py-3.5 rounded-full cursor-pointer"
            >
              Place Order
            </button>
            <button
              onClick={onCloseCheckout}
              className="w-full mt-2 py-3 rounded-full font-medium text-slate-500 hover:bg-black/5 cursor-pointer transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
