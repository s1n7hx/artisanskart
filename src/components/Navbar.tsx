import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ShoppingBag, Search, Hammer, ShieldCheck, Menu, X, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    cartCount,
    setIsCartOpen,
    setIsMakerSignupOpen,
    searchTerm,
    setSearchTerm,
    currentUser,
    userRole,
    setIsAuthModalOpen,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu automatically whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (location.pathname !== '/marketplace' && e.target.value.trim().length > 0) {
      navigate('/marketplace');
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
      isActive
        ? 'bg-[#C85A32] text-white shadow-xs'
        : 'text-[#1E293B] hover:text-[#C85A32] hover:bg-black/5'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-3 rounded-xl text-sm font-semibold text-left transition flex items-center justify-between touch-manipulation cursor-pointer ${
      isActive
        ? 'bg-[#C85A32] text-white shadow-xs'
        : 'bg-white border border-[#e7e0d8] text-[#1E293B] hover:border-[#C85A32] active:bg-[#FAF9F6]'
    }`;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/60 bg-[#FAF9F6]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Brand Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 shrink-0 text-left cursor-pointer group touch-manipulation"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#C85A32] flex items-center justify-center text-white font-black text-lg transition-transform duration-300 group-hover:scale-105 shadow-sm">
            AK
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-lg tracking-tight">
              ArtisansKart<span className="text-[#C85A32]">.in</span>
            </p>
            <span className="hidden sm:inline-block badge-sage text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide">
              Handcrafted by Student Artisans
            </span>
          </div>
        </NavLink>

        {/* Center Search Bar (Desktop) */}
        <div className="flex-1 max-w-xs xl:max-w-sm hidden md:block relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A86]" />
          <input
            id="searchInput"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search crafts, makers, schools..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white/80 border border-[#e7e0d8] text-sm placeholder:text-slate-400 transition focus:bg-white focus:border-[#C85A32] focus:outline-hidden"
          />
        </div>

        {/* TOP RIGHT NAVIGATION & ACTIONS */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/70 border border-[#e7e0d8] p-1 rounded-full shadow-xs">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About Us
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClass}>
              How It Works
            </NavLink>
            <NavLink to="/collections" className={navLinkClass}>
              Collections
            </NavLink>
            <NavLink to="/marketplace" className={navLinkClass}>
              Marketplace
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
            <NavLink to="/login" className={navLinkClass}>
              Sign In
            </NavLink>
            {(userRole === 'maker' || userRole === 'admin') && (
              <NavLink
                to="/maker"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#1E293B] text-white shadow-xs'
                      : 'text-[#1E293B] hover:text-[#C85A32] hover:bg-black/5'
                  }`
                }
              >
                <Hammer className="w-3.5 h-3.5 text-[#C85A32]" />
                Maker Portal
              </NavLink>
            )}
            {userRole === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'text-slate-700 hover:text-[#C85A32] hover:bg-black/5'
                  }`
                }
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Medium Screen Nav Quick Links */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `px-3 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'text-[#1E293B] hover:text-[#C85A32]'
                }`
              }
            >
              Marketplace
            </NavLink>
            {(userRole === 'maker' || userRole === 'admin') && (
              <NavLink
                to="/maker"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-[#1E293B] text-white shadow-xs'
                      : 'text-[#1E293B] hover:text-[#C85A32]'
                  }`
                }
              >
                <Hammer className="w-3.5 h-3.5 text-[#C85A32]" /> Maker
              </NavLink>
            )}
            {userRole === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'text-slate-800 hover:text-[#C85A32]'
                  }`
                }
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" /> Admin
              </NavLink>
            )}
          </div>

          {/* Sell Your Crafts Action Button */}
          <button
            id="sellCraftsBtn"
            onClick={() => setIsMakerSignupOpen(true)}
            className="hidden sm:flex items-center gap-1.5 btn-terracotta text-xs md:text-sm font-semibold px-4 py-2.5 rounded-full cursor-pointer shadow-xs touch-manipulation"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sell Crafts</span>
          </button>

          {/* User Profile / Google Sign-In Trigger */}
          <button
            id="authProfileBtn"
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e7e0d8] hover:border-[#C85A32] transition cursor-pointer shadow-xs touch-manipulation text-xs font-bold text-slate-700"
            title="User Account & Google Sign In"
          >
            {userRole === 'admin' ? (
              <span className="w-2 h-2 rounded-full bg-slate-900 ring-2 ring-slate-300" />
            ) : userRole === 'maker' ? (
              <span className="w-2 h-2 rounded-full bg-[#C85A32] ring-2 ring-orange-200" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            )}
            <span className="hidden sm:inline">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full uppercase font-black bg-slate-100 text-slate-600">
              {userRole}
            </span>
          </button>

          {/* Cart Button */}
          <button
            id="cartBtn"
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/80 border border-[#e7e0d8] flex items-center justify-center hover:bg-white active:scale-95 transition cursor-pointer shadow-xs touch-manipulation"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#1E293B]" />
            <span
              id="cartCount"
              className="absolute -top-1.5 -right-1.5 bg-[#C85A32] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs"
            >
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            id="mobileMenuToggleBtn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen((prev) => !prev);
            }}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`lg:hidden min-w-[44px] min-h-[44px] w-11 h-11 rounded-full border flex items-center justify-center transition cursor-pointer touch-manipulation shadow-xs active:scale-95 ${
              mobileMenuOpen
                ? 'bg-[#C85A32] border-[#C85A32] text-white shadow-md'
                : 'bg-white/90 border-[#e7e0d8] text-[#1E293B] hover:bg-white'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="md:hidden px-4 pb-3 relative">
        <Search className="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 text-[#8A9A86]" />
        <input
          id="searchInputMobile"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search products, makers, schools..."
          className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-[#e7e0d8] text-sm placeholder:text-slate-400 focus:outline-hidden focus:border-[#C85A32] shadow-xs"
        />
      </div>

      {/* Mobile Slide-down Navigation Menu */}
      {mobileMenuOpen && (
        <div
          id="mobileNavDrawer"
          className="lg:hidden border-t border-[#e7e0d8] bg-[#FAF9F6] px-4 py-5 shadow-2xl animate-[fadeIn_0.2s_ease-out] max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Pages
            </p>
            <span className="text-[10px] bg-[#8A9A86]/20 text-[#43513f] px-2 py-0.5 rounded-full font-bold">
              ArtisansKart Menu
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <span>About Us</span>
            </NavLink>
            <NavLink
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <span>How It Works</span>
            </NavLink>
            <NavLink
              to="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <span>Collections</span>
            </NavLink>
            <NavLink
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <span>Marketplace</span>
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              <span>Contact</span>
            </NavLink>
            <NavLink
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-xl text-sm font-semibold text-left transition flex items-center justify-between touch-manipulation cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-[#e7e0d8] text-slate-700 hover:border-[#C85A32] active:bg-[#FAF9F6]'
                }`
              }
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                <span>{currentUser ? `Account (${currentUser.name.split(' ')[0]})` : 'Sign In with Google'}</span>
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {userRole}
              </span>
            </NavLink>
            {(userRole === 'maker' || userRole === 'admin') && (
              <NavLink
                to="/maker"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-semibold text-left transition flex items-center justify-between touch-manipulation cursor-pointer ${
                    isActive
                      ? 'bg-[#1E293B] text-white shadow-xs'
                      : 'bg-white border border-[#e7e0d8] text-[#1E293B] hover:border-[#1E293B] active:bg-[#FAF9F6]'
                  }`
                }
              >
                <span className="flex items-center gap-1.5">
                  <Hammer className="w-4 h-4 text-[#C85A32]" />
                  Maker Portal
                </span>
                <span className="text-xs text-[#C85A32] font-bold">65%</span>
              </NavLink>
            )}
            {userRole === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-bold text-left transition flex items-center justify-between touch-manipulation cursor-pointer ${
                    isActive
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'bg-white border border-[#e7e0d8] text-slate-800 hover:border-[#C85A32] active:bg-[#FAF9F6]'
                  }`
                }
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                  Admin CMS
                </span>
                <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-bold">RBAC</span>
              </NavLink>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t border-[#e7e0d8]">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsMakerSignupOpen(true);
              }}
              className="flex-1 btn-terracotta text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.98] transition shadow-xs"
            >
              <Sparkles className="w-4 h-4" /> Sell Your Crafts
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="px-4 bg-white border border-[#e7e0d8] text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 text-[#1E293B] cursor-pointer touch-manipulation active:scale-[0.98] transition shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#C85A32]" /> Cart ({cartCount})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
