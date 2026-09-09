import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Heart, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveCategory, setIsMakerSignupOpen, userRole } = useApp();

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <footer className="bg-[#1E293B] text-white/80 px-6 md:px-10 py-14 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand info */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C85A32] flex items-center justify-center text-white font-black text-sm">
              AK
            </div>
            <p className="text-xl font-extrabold text-white tracking-tight">
              ArtisansKart<span className="text-[#C85A32]">.in</span>
            </p>
          </Link>
          <p className="text-sm mt-3 text-white/60 max-w-sm leading-relaxed">
            A conscious marketplace empowering high school & university craft makers with a fair 65% earnings model, eco-friendly delivery, and campus recognition.
          </p>
          <div className="flex gap-3 mt-5 text-white/70">
            <a
              href="#instagram"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C85A32] hover:text-white transition"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#facebook"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C85A32] hover:text-white transition"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#youtube"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C85A32] hover:text-white transition"
              aria-label="Youtube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shop Collections */}
        <div>
          <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
            Shop Craft
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link
                to="/marketplace"
                onClick={() => handleCategoryClick('Clay Crafts')}
                className="hover:text-white transition"
              >
                Clay Crafts
              </Link>
            </li>
            <li>
              <Link
                to="/marketplace"
                onClick={() => handleCategoryClick('Hand-painted Cards')}
                className="hover:text-white transition"
              >
                Hand-painted Cards
              </Link>
            </li>
            <li>
              <Link
                to="/marketplace"
                onClick={() => handleCategoryClick('Accessories')}
                className="hover:text-white transition"
              >
                Accessories
              </Link>
            </li>
            <li>
              <Link
                to="/marketplace"
                onClick={() => handleCategoryClick('Keychains')}
                className="hover:text-white transition"
              >
                Keychains
              </Link>
            </li>
            <li>
              <Link
                to="/collections"
                className="text-[#E6A373] hover:text-white font-medium transition"
              >
                Browse Curated Sets &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* For Student Makers */}
        <div>
          <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
            Student Makers
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link to="/how-it-works" className="hover:text-white transition">
                How Payouts Work
              </Link>
            </li>
            <li>
              <button
                onClick={() => setIsMakerSignupOpen(true)}
                className="hover:text-white transition text-left cursor-pointer flex items-center gap-1 text-[#E6A373]"
              >
                <Sparkles className="w-3.5 h-3.5" /> Sell Your Crafts
              </button>
            </li>
            {(userRole === 'maker' || userRole === 'admin') && (
              <li>
                <Link to="/maker" className="hover:text-white transition">
                  Maker Portal Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link to="/about" className="hover:text-white transition">
                Our Fair-Trade Pledge
              </Link>
            </li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">
            Connect
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-white transition">
                The 5-Step Process
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact &amp; Support
              </Link>
            </li>
            {userRole === 'admin' && (
              <li>
                <Link
                  to="/admin"
                  className="text-left text-[#E6A373] hover:text-white transition flex items-center gap-1.5 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Admin Portal &amp; CMS</span>
                </Link>
              </li>
            )}
            <li className="pt-2 text-xs text-white/50">
              <span className="block text-white/80 font-medium">Student Support:</span>
              hello@artisanskart.in
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
        <p>© 2026 ArtisansKart.in — Empowering youth creativity across campuses.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-[#C85A32] fill-[#C85A32]" /> for student artisans
        </p>
      </div>
    </footer>
  );
};
