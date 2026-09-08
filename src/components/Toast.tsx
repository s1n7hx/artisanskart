import React from 'react';
import { CheckCircle2, ShoppingCart, Hammer, Package, Wallet, AlertCircle, PartyPopper } from 'lucide-react';
import { ToastItem } from '../types';

interface ToastProps {
  toasts: ToastItem[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shopping-cart':
        return <ShoppingCart className="w-5 h-5 text-[#8A9A86] shrink-0" />;
      case 'hammer':
        return <Hammer className="w-5 h-5 text-[#C85A32] shrink-0" />;
      case 'package':
        return <Package className="w-5 h-5 text-[#1E293B] shrink-0" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-[#C85A32] shrink-0" />;
      case 'alert-circle':
        return <AlertCircle className="w-5 h-5 text-[#C85A32] shrink-0" />;
      case 'party-popper':
        return <PartyPopper className="w-5 h-5 text-[#8A9A86] shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#8A9A86] shrink-0" />;
    }
  };

  return (
    <div id="toastContainer" className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[70] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast glass-panel bg-white/95 shadow-xl rounded-xl px-5 py-3.5 flex items-center gap-3 max-w-xs pointer-events-auto border border-[#e7e0d8]"
        >
          {getIcon(t.icon)}
          <p className="text-sm font-medium text-[#1E293B]">{t.message}</p>
        </div>
      ))}
    </div>
  );
};
