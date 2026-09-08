import React from 'react';
import { ShoppingBag, X, CreditCard } from 'lucide-react';
import { Product, CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onChangeQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  onChangeQty,
  onRemove,
  onProceedCheckout,
}) => {
  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const total = cart.reduce((sum, item) => {
    const p = products.find((prod) => prod.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  return (
    <>
      {/* Overlay */}
      <div
        id="cartOverlay"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Panel */}
      <div
        id="cartDrawer"
        className={`drawer-panel fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF9F6] z-50 shadow-2xl flex flex-col transition-transform duration-400 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
          <h3 className="text-xl font-bold flex items-center gap-2 text-[#1E293B]">
            <ShoppingBag className="w-5 h-5 text-[#C85A32]" /> Your Cart
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="cartItems" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 py-16">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-60" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => {
              const p = products.find((prod) => prod.id === item.id);
              if (!p) return null;
              return (
                <div
                  key={item.id}
                  className="flex gap-3 bg-white rounded-xl p-3 border border-[#f0ebe3]"
                >
                  <img src={p.image} alt={p.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm leading-snug text-[#1E293B]">{p.title}</p>
                    <p className="text-xs text-slate-400 mb-2">{formatINR(p.price)} each</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onChangeQty(item.id, -1)}
                        className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#e7e0d8] flex items-center justify-center text-sm hover:bg-black/5 cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => onChangeQty(item.id, 1)}
                        className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#e7e0d8] flex items-center justify-center text-sm hover:bg-black/5 cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-xs text-[#C85A32] font-semibold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-black/10 px-6 py-5 bg-white/50 backdrop-blur-xs">
          <div className="flex justify-between mb-2 text-sm text-slate-500">
            <span>Subtotal</span>
            <span id="cartSubtotal">{formatINR(total)}</span>
          </div>
          <div className="flex justify-between mb-4 font-bold text-lg text-[#1E293B]">
            <span>Total</span>
            <span id="cartTotal">{formatINR(total)}</span>
          </div>
          <button
            onClick={onProceedCheckout}
            disabled={cart.length === 0}
            className="w-full btn-terracotta font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4" /> Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};
