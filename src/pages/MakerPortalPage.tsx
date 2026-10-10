import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  CheckCircle2,
  Hammer,
  Radio,
  MapPin,
  CalendarClock,
  Package,
  Check,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  Lock,
  ShieldAlert,
  ArrowLeft,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, maskEmail } from '../types';
import { ImageUploader } from '../components/ImageUploader';

export const MakerPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    acceptOrder,
    markReady,
    markCompleted,
    setIsMakerSignupOpen,
    currentUser,
    userRole,
    userStatus,
    addNewProduct,
    showToast,
    setIsAuthModalOpen,
    makerEarningPercent,
  } = useApp();

  const [isAddingCraft, setIsAddingCraft] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [craftForm, setCraftForm] = useState({
    title: '',
    category: 'Clay Crafts',
    price: 299,
    description: '',
    image: 'https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&w=800',
    stock: 'In Stock • Made to order',
  });

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const completed = orders.filter((o) => o.status === 'completed');
  const active = orders.filter((o) => o.status !== 'completed');
  const totalEarnings = completed.reduce((s, o) => s + o.amount * (makerEarningPercent / 100), 0);

  const statusMeta = {
    new: { label: 'New Order', cls: 'badge-sage' },
    in_production: { label: 'In Production', cls: 'bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/30' },
    ready: { label: 'Ready for Dispatch', cls: 'bg-[#1E293B]/10 text-[#1E293B] border border-[#1E293B]/30' },
    completed: { label: 'Completed', cls: 'bg-[#8A9A86]/20 text-[#5c6a58] border border-[#8A9A86]/40' },
  };

  const handleCreateCraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!craftForm.title || !craftForm.price) {
      alert('Please provide a craft title and price.');
      return;
    }

    const resolvedCategory =
      craftForm.category === 'Other'
        ? customCategory.trim() || 'Other Crafts'
        : craftForm.category;

    const newCraft: Product = {
      id: Date.now(),
      title: craftForm.title,
      category: resolvedCategory,
      price: Number(craftForm.price),
      rating: 5.0,
      reviews: 1,
      maker: currentUser?.name || 'Student Maker',
      cls: currentUser?.grade || 'Class 10',
      school: currentUser?.school || 'Fine Arts Studio',
      image: craftForm.image || 'https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&w=800',
      stock: craftForm.stock,
      description: craftForm.description || 'Authentic handcrafted student piece.',
      source: 'custom',
    };

    addNewProduct(newCraft);
    showToast(`Your craft "${newCraft.title}" (${resolvedCategory}) is published on the storefront!`, 'sparkles');
    setIsAddingCraft(false);
    setCustomCategory('');
    setCraftForm({
      title: '',
      category: 'Clay Crafts',
      price: 299,
      description: '',
      image: 'https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&w=800',
      stock: 'In Stock • Made to order',
    });
  };

  const isMakerOrAdmin = (userRole === 'maker' || userRole === 'admin') && userStatus === 'approved';

  // Strict Route Guard: If user is pending or unapproved maker, direct to pending approval
  if ((userRole === 'maker' || userRole === 'admin') && userStatus !== 'approved') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Application Under Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Maker Access Awaiting Approval
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your account ({maskEmail(currentUser?.email) || currentUser?.name || 'User'}) is registered as a Student Maker, but access is pending verification by the Master Admin.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/pending-approval')}
            className="bg-[#C85A32] text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#b04a25]"
          >
            View Approval Status Details
          </button>
        </div>
      </div>
    );
  }

  // Strict Route Guard: If the user is a customer/visitor, display the Restricted Maker Portal banner
  if (!isMakerOrAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Hammer className="w-8 h-8 text-[#C85A32]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32] bg-[#C85A32]/10 px-3 py-1 rounded-full">
            Student Artisan Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
            Maker Permission Required
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            The Student Maker Workspace is reserved for enrolled student artisans to accept custom orders, mark production milestones, and receive UPI payouts.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e7e0d8] shadow-sm text-left max-w-md mx-auto space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Current Status:</span>
            <span className="font-bold text-slate-700 capitalize">{userRole} Account</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Logged in User:</span>
            <span className="font-semibold text-slate-700">{currentUser ? currentUser.name : 'Guest / Not Signed In'}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-slate-500 text-[11px] leading-relaxed">
            💡 <strong>Need Maker Access?</strong> Sign in with your registered Google account, or have the Master Admin grant you Maker permission from the Admin Portal.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Storefront
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full btn-terracotta text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" /> Sign In with Google
          </button>
          <button
            onClick={() => setIsMakerSignupOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Apply as Student Maker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e7e0d8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sage text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Student Artisan Workspace
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentUser ? `Active: ${currentUser.name}` : 'Live Feed'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1E293B]">
            Student Maker Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track student earnings, fulfill campus orders, and publish new handmade creations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingCraft(true)}
            disabled={!isMakerOrAdmin}
            className="bg-[#C85A32] text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 cursor-pointer shadow-sm hover:bg-[#b04a25] transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product to Store</span>
          </button>
          <button
            onClick={() => setIsMakerSignupOpen(true)}
            className="bg-white border border-[#e7e0d8] text-slate-700 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 transition"
          >
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Craft Submission Form Modal / Drawer */}
      {isAddingCraft && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C85A32]/30 shadow-xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-extrabold uppercase text-[#C85A32] tracking-wider">
                Publishing to Storefront
              </span>
              <h2 className="text-2xl font-black text-slate-900">Add New Student Handcrafted Item</h2>
            </div>
            <button
              onClick={() => setIsAddingCraft(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold px-3 py-1 rounded-xl bg-slate-100"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateCraft} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Craft Title</label>
                <input
                  type="text"
                  required
                  value={craftForm.title}
                  onChange={(e) => setCraftForm({ ...craftForm, title: e.target.value })}
                  placeholder="e.g. Handmade Terracotta Floral Planter"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Type / Category
                    </label>
                    <select
                      value={craftForm.category}
                      onChange={(e) => setCraftForm({ ...craftForm, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-hidden focus:border-[#C85A32] font-medium"
                    >
                      <option value="Paintings">Paintings &amp; Canvas Art</option>
                      <option value="Clay Crafts">Clay Crafts &amp; Pottery</option>
                      <option value="Hand-painted Cards">Hand-painted Cards</option>
                      <option value="Accessories">Accessories &amp; Beads</option>
                      <option value="Keychains">Keychains &amp; Charms</option>
                      <option value="Pottery & Ceramics">Pottery &amp; Ceramics</option>
                      <option value="Resin & Glass Art">Resin &amp; Glass Art</option>
                      <option value="Textiles & Macramé">Textiles &amp; Macramé</option>
                      <option value="Other">Other (Custom Craft Type...)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR)</label>
                    <input
                      type="number"
                      required
                      min={49}
                      value={craftForm.price}
                      onChange={(e) => setCraftForm({ ...craftForm, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-[#C85A32] focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                {/* Quick Category Selection Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { id: 'Paintings', label: '🎨 Paintings & Art' },
                    { id: 'Clay Crafts', label: '🏺 Clay Crafts' },
                    { id: 'Hand-painted Cards', label: '💌 Hand-painted Cards' },
                    { id: 'Accessories', label: '📿 Accessories' },
                    { id: 'Keychains', label: '🔑 Keychains' },
                    { id: 'Other', label: '✨ Other (Custom Type)' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setCraftForm({ ...craftForm, category: chip.id })}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
                        craftForm.category === chip.id
                          ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#C85A32] hover:bg-orange-50/50'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {craftForm.category === 'Other' && (
                <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-[#C85A32]">
                      Specify Custom Craft / Product Type *
                    </label>
                    <span className="text-[10px] text-orange-700 font-bold bg-orange-200/60 px-2 py-0.5 rounded-full">
                      Custom Category
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Acrylic Painting, Woodcarving, Resin Coasters, Scented Candle..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-orange-300 text-sm bg-white focus:outline-hidden focus:border-[#C85A32] font-medium shadow-2xs"
                  />
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                      Quick suggestions (tap to fill):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Paintings',
                        'Watercolor Canvas',
                        'Resin Coasters',
                        'Handmade Candles',
                        'Crochet Stuffed Toy',
                        'Woodcarving',
                        'Paper Origami',
                        'Beaded Jewelry',
                        'Embroidery Art',
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCustomCategory(item)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                            customCategory === item
                              ? 'bg-[#C85A32] text-white border-[#C85A32]'
                              : 'bg-white text-slate-700 border-orange-200 hover:bg-orange-100/70'
                          }`}
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This custom craft type will appear on storefront cards and become an active marketplace filter.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description &amp; Technique</label>
                <textarea
                  rows={3}
                  value={craftForm.description}
                  onChange={(e) => setCraftForm({ ...craftForm, description: e.target.value })}
                  placeholder="Describe the materials used (e.g., natural riverbed clay, organic acrylics, varnished finish)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <ImageUploader
                value={craftForm.image}
                onChange={(url) => setCraftForm({ ...craftForm, image: url })}
                label="Product Photography"
                helperText="Upload photo from device or paste link"
                placeholder="https://images.pexels.com/..."
                previewHeight="h-44"
              />

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCraft(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04a25] transition shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish to Marketplace</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Total Earnings ({makerEarningPercent}%)
            </p>
            <Wallet className="w-5 h-5 text-[#C85A32]" />
          </div>
          <p id="earningsTotal" className="text-3xl font-black mt-2 text-[#C85A32]">
            {formatINR(totalEarnings)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Transferred every Friday via UPI
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Completed Orders
            </p>
            <CheckCircle2 className="w-5 h-5 text-[#8A9A86]" />
          </div>
          <p id="earningsCompleted" className="text-3xl font-black mt-2 text-[#1E293B]">
            {completed.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Successfully delivered to buyers
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Active in Studio
            </p>
            <Radio className="w-5 h-5 text-[#C85A32]" />
          </div>
          <p id="activeOrdersCount" className="text-3xl font-black mt-2 text-[#C85A32]">
            {active.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Orders currently being crafted
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Student Maker Split
            </p>
            <Hammer className="w-5 h-5 text-[#1E293B]" />
          </div>
          <p className="text-3xl font-black mt-2 text-[#1E293B]">{makerEarningPercent}%</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {100 - makerEarningPercent}% funds platform logistics &amp; campus studio tools
          </span>
        </div>
      </div>

      {/* Production Pipeline */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">Live Production Pipeline</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Advance orders as you sculpt, paint, package, and drop off at campus lockers.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-[#FAF9F6] border border-[#e7e0d8] px-3 py-1.5 rounded-full self-start sm:self-auto">
            {orders.length} total orders recorded
          </span>
        </div>

        <div className="space-y-4">
          {orders.map((o) => {
            const meta = statusMeta[o.status] || statusMeta.new;
            const makerShare = o.amount * (makerEarningPercent / 100);

            return (
              <div
                key={o.id}
                className="bg-[#FAF9F6] rounded-2xl p-5 md:p-6 border border-[#e7e0d8] hover:border-[#C85A32]/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#e7e0d8] flex items-center justify-center shrink-0 text-[#C85A32]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        #ORD-2026-{o.id}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {o.deadline}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#1E293B] text-base">{o.product}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Qty: <strong className="text-slate-700">{o.qty} pcs</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C85A32]" /> {o.city}
                      </span>
                      <span>•</span>
                      <span>
                        Order Value: <strong className="text-slate-700 font-semibold">{formatINR(o.amount)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Your {makerEarningPercent}% Split: <strong className="text-[#C85A32] font-bold">{formatINR(makerShare)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Action Workflow Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {o.status === 'new' && (
                    <button
                      onClick={() => acceptOrder(o.id)}
                      className="btn-terracotta text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Accept Order</span>
                    </button>
                  )}

                  {o.status === 'in_production' && (
                    <button
                      onClick={() => markReady(o.id)}
                      className="bg-[#1E293B] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#C85A32] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {o.status === 'ready' && (
                    <button
                      onClick={() => markCompleted(o.id)}
                      className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete &amp; Payout</span>
                    </button>
                  )}

                  {o.status === 'completed' && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" /> Settled to UPI
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
