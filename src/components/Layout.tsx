import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Store, Hammer, ShieldCheck } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { Modals } from './Modals';
import { Toast } from './Toast';
import { ScrollToTop } from './ScrollToTop';
import { AuthModal } from './AuthModal';
import { useApp } from '../context/AppContext';

export const Layout: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    changeQty,
    removeFromCart,
    quickViewProduct,
    setQuickViewId,
    isCartOpen,
    setIsCartOpen,
    isMakerSignupOpen,
    setIsMakerSignupOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    toasts,
    showToast,
    confirmCheckout,
    userRole,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const isMakerPage = location.pathname.startsWith('/maker');
  const isAdminPage = location.pathname.startsWith('/admin');

  // IntersectionObserver to smoothly trigger .fade-in on scroll and route changes
  useEffect(() => {
    const fadeEls = document.querySelectorAll('.fade-in');
    
    // Check if browser supports IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      fadeEls.forEach((el) => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    fadeEls.forEach((el) => observer.observe(el));

    // Fallback: force reveal after 100ms in case elements are already in viewport
    const timer = setTimeout(() => {
      fadeEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('in-view');
        }
      });
    }, 120);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [location.pathname]);

  const handleSubmitMakerSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMakerSignupOpen(false);
    showToast("Application submitted! We'll review and get back within 48 hours.", 'party-popper');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E293B] flex flex-col font-sans">
      <ScrollToTop />

      {/* Persistent Header with Route Navigation */}
      <Navbar />

      {/* Main Page Route Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Persistent Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Persistent Modals */}
      <Modals
        quickViewProduct={quickViewProduct}
        onCloseQuickView={() => setQuickViewId(null)}
        onAddToCart={addToCart}
        isMakerSignupOpen={isMakerSignupOpen}
        onCloseMakerSignup={() => setIsMakerSignupOpen(false)}
        onSubmitMakerSignup={handleSubmitMakerSignup}
        isCheckoutOpen={isCheckoutOpen}
        onCloseCheckout={() => setIsCheckoutOpen(false)}
        onConfirmCheckout={confirmCheckout}
        cart={cart}
        products={products}
      />

      {/* Persistent Auth & Role Switcher Modal */}
      <AuthModal />

      {/* Persistent Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
};
