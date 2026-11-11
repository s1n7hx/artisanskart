import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, ShoppingBag, Layers, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SEO
        title="404 — Page Not Found | ArtisansKart"
        description="The artisan craft or page you are looking for cannot be found. Browse our marketplace for authentic handcrafted products."
        canonicalPath="/404"
      />

      <div className="max-w-xl w-full text-center space-y-6 bg-white rounded-3xl p-8 sm:p-12 border border-[#e7e0d8] shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto text-2xl font-black">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            Page Not Found
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
            The handmade piece, studio link, or page you were looking for is not here. It might have been moved, updated, or the craft edition is finished.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs font-bold">
          <Link
            to="/"
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-[#C85A32]" />
            <span>Storefront Home</span>
          </Link>
          <Link
            to="/marketplace"
            className="p-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white transition flex items-center justify-center gap-2 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Marketplace</span>
          </Link>
          <Link
            to="/collections"
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-2 sm:col-span-2"
          >
            <Layers className="w-4 h-4 text-[#5c6a58]" />
            <span>Explore Curated Collections &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
