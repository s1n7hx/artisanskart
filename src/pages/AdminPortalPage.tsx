import React, { useState } from 'react';
import {
  Sliders,
  Package,
  ShoppingBag,
  Users,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Eye,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon,
  Key,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, HeroContent } from '../types';

export const AdminPortalPage: React.FC = () => {
  const {
    heroContent,
    updateHeroContent,
    resetHeroToDefault,
    products,
    addNewProduct,
    updateProduct,
    orders,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cms' | 'products' | 'orders' | 'users' | 'supabase'>('cms');

  // Local CMS form state
  const [cmsForm, setCmsForm] = useState<HeroContent>({ ...heroContent });
  const [cmsSaved, setCmsSaved] = useState(false);

  // New Product state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    title: '',
    category: 'Clay Crafts',
    price: 349,
    maker: '',
    cls: 'Class 10',
    school: '',
    image: 'https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&w=800',
    stock: 'In Stock • Made to order',
    description: '',
  });

  // Mock Users Role Management state
  const [usersList, setUsersList] = useState([
    { id: 'usr_1', email: 'admin@artisanskart.in', name: 'Master Admin', role: 'admin', school: 'Headquarters' },
    { id: 'usr_2', email: 'sakib.maker@delhischool.edu', name: 'Sakib Ansari', role: 'maker', school: 'DPS RK Puram (Class 10)' },
    { id: 'usr_3', email: 'meera.pottery@punecampus.in', name: 'Meera Nair', role: 'maker', school: 'Bishop Cotton Pune (Class 12)' },
    { id: 'usr_4', email: 'arjun.crafts@jaipur.edu', name: 'Arjun Verma', role: 'maker', school: 'Maharaja Sawai Man Jaipur (Class 9)' },
    { id: 'usr_5', email: 'priya.customer@gmail.com', name: 'Priya Sharma', role: 'customer', school: 'Customer' },
    { id: 'usr_6', email: 'rohit.buyer@yahoo.com', name: 'Rohit Mehta', role: 'customer', school: 'Customer' },
  ]);

  const handleSaveCms = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroContent(cmsForm);
    setCmsSaved(true);
    showToast('Site CMS settings updated successfully!', '✨');
    setTimeout(() => setCmsSaved(false), 3000);
  };

  const handleResetCms = () => {
    if (confirm('Reset CMS headlines and banners to default?')) {
      resetHeroToDefault();
      setCmsForm({
        badgeText: '✨ Handcrafted by Student Artisans',
        headlineLine1: 'Crafted by',
        headlineLine2: 'Students,',
        headlineLine3: 'Loved by You',
        subhead:
          'Discover one-of-a-kind clay crafts, hand-painted cards, accessories & keychains — every purchase directly funds a student creator’s education.',
        mainImage:
          'https://images.pexels.com/photos/7559739/pexels-photo-7559739.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800',
        leftImage:
          'https://images.pexels.com/photos/4006576/pexels-photo-4006576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        rightImage:
          'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        mainTag: 'Live Wheel Pottery',
        leftTag: 'Fine Art Cards',
        rightTag: 'Beaded Accessories',
      });
      showToast('CMS restored to factory defaults.', '🔄');
    }
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.title || !newProductForm.maker || !newProductForm.price) {
      alert('Please fill in product title, maker, and price.');
      return;
    }

    const prodToAdd: Product = {
      id: Date.now(),
      title: newProductForm.title || 'Handmade Craft',
      category: newProductForm.category || 'Clay Crafts',
      price: Number(newProductForm.price) || 299,
      rating: 5.0,
      reviews: 1,
      maker: newProductForm.maker || 'Student Maker',
      cls: newProductForm.cls || 'Class 10',
      school: newProductForm.school || 'Campus Fine Arts Club',
      image: newProductForm.image || 'https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&w=800',
      stock: newProductForm.stock || 'In Stock • Made to order',
      description: newProductForm.description || 'Authentic handcrafted student artwork.',
      source: 'custom',
    };

    addNewProduct(prodToAdd);
    showToast(`Added product "${prodToAdd.title}" to marketplace!`, '🎨');
    setIsAddingProduct(false);
    setNewProductForm({
      title: '',
      category: 'Clay Crafts',
      price: 349,
      maker: '',
      cls: 'Class 10',
      school: '',
      image: 'https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&w=800',
      stock: 'In Stock • Made to order',
      description: '',
    });
  };

  const handleUpdateProductSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct);
      showToast(`Updated product "${editingProduct.title}"!`, '✅');
      setEditingProduct(null);
    }
  };

  const toggleUserRole = (id: string, newRole: 'admin' | 'maker' | 'customer') => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    showToast(`User role updated to ${newRole.toUpperCase()}`, '🛡️');
  };

  const totalSalesVolume = orders.reduce((sum, o) => sum + o.amount, 0);
  const studentSharePaid = totalSalesVolume * 0.65;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-screen space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#C85A32] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Master Admin Portal
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Supabase RBAC: Role = Admin
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            ArtisansKart Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
            Direct real-time control over public storefront copy, banners, product catalogs, customer orders, and user role elevation.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Total Revenue (₹)</span>
            <span className="text-2xl font-black text-white">₹{Math.round(totalSalesVolume).toLocaleString('en-IN')}</span>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <span className="text-[11px] text-[#C85A32] block font-semibold">65% Student Fund</span>
            <span className="text-2xl font-black text-[#C85A32]">₹{Math.round(studentSharePaid).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e7e0d8] pb-3">
        <button
          onClick={() => setActiveTab('cms')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'cms'
              ? 'bg-[#C85A32] text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Live CMS &amp; Site Copy Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#C85A32] text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products &amp; Inventory ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#C85A32] text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders &amp; Reassignment ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#C85A32] text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Role Management (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <Key className="w-4 h-4 text-emerald-500" />
          <span>Supabase &amp; Next.js Architecture</span>
        </button>
      </div>

      {/* TAB 1: LIVE CMS & SITE COPY EDITOR */}
      {activeTab === 'cms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#e7e0d8]">
              <div>
                <h2 className="text-xl font-bold text-[#1E293B]">Home Storefront CMS Content</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Edits made here instantly reflect on the public homepage and persist to the database.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCms}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveCms} className="space-y-6">
              {/* Badge Text */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Top Pill Badge Text
                </label>
                <input
                  type="text"
                  value={cmsForm.badgeText}
                  onChange={(e) => setCmsForm({ ...cmsForm, badgeText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e7e0d8] bg-[#FAF9F6] text-sm focus:bg-white focus:border-[#C85A32] focus:outline-hidden"
                  placeholder="e.g., ✨ Handcrafted by Student Artisans"
                />
              </div>

              {/* 3-Line Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Headline Line 1
                  </label>
                  <input
                    type="text"
                    value={cmsForm.headlineLine1}
                    onChange={(e) => setCmsForm({ ...cmsForm, headlineLine1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e7e0d8] bg-[#FAF9F6] text-sm focus:bg-white focus:border-[#C85A32] focus:outline-hidden"
                    placeholder="Crafted by"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Headline Line 2 (Accent)
                  </label>
                  <input
                    type="text"
                    value={cmsForm.headlineLine2}
                    onChange={(e) => setCmsForm({ ...cmsForm, headlineLine2: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e7e0d8] bg-[#FAF9F6] text-sm font-bold text-[#C85A32] focus:bg-white focus:border-[#C85A32] focus:outline-hidden"
                    placeholder="Students,"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Headline Line 3
                  </label>
                  <input
                    type="text"
                    value={cmsForm.headlineLine3}
                    onChange={(e) => setCmsForm({ ...cmsForm, headlineLine3: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e7e0d8] bg-[#FAF9F6] text-sm focus:bg-white focus:border-[#C85A32] focus:outline-hidden"
                    placeholder="Loved by You"
                  />
                </div>
              </div>

              {/* Subheading */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subheading Description
                </label>
                <textarea
                  rows={3}
                  value={cmsForm.subhead}
                  onChange={(e) => setCmsForm({ ...cmsForm, subhead: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e7e0d8] bg-[#FAF9F6] text-sm leading-relaxed focus:bg-white focus:border-[#C85A32] focus:outline-hidden"
                  placeholder="Describe your student marketplace mission..."
                />
              </div>

              {/* Banner Image URLs */}
              <div className="pt-4 border-t border-[#e7e0d8] space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#1E293B] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                  Photography Collage &amp; Banner Assets
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Center Feature Image URL
                  </label>
                  <input
                    type="url"
                    value={cmsForm.mainImage}
                    onChange={(e) => setCmsForm({ ...cmsForm, mainImage: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-[#e7e0d8] text-xs font-mono bg-[#FAF9F6]"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Badge overlay label:</span>
                    <input
                      type="text"
                      value={cmsForm.mainTag}
                      onChange={(e) => setCmsForm({ ...cmsForm, mainTag: e.target.value })}
                      className="px-2 py-0.5 rounded border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Left Angled Card Image
                    </label>
                    <input
                      type="url"
                      value={cmsForm.leftImage}
                      onChange={(e) => setCmsForm({ ...cmsForm, leftImage: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-[#e7e0d8] text-xs font-mono bg-[#FAF9F6]"
                    />
                    <input
                      type="text"
                      value={cmsForm.leftTag}
                      onChange={(e) => setCmsForm({ ...cmsForm, leftTag: e.target.value })}
                      className="mt-1 w-full px-2 py-0.5 rounded border border-slate-200 text-xs"
                      placeholder="Tag label"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Right Angled Card Image
                    </label>
                    <input
                      type="url"
                      value={cmsForm.rightImage}
                      onChange={(e) => setCmsForm({ ...cmsForm, rightImage: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-[#e7e0d8] text-xs font-mono bg-[#FAF9F6]"
                    />
                    <input
                      type="text"
                      value={cmsForm.rightTag}
                      onChange={(e) => setCmsForm({ ...cmsForm, rightTag: e.target.value })}
                      className="mt-1 w-full px-2 py-0.5 rounded border border-slate-200 text-xs"
                      placeholder="Tag label"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#e7e0d8] flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {cmsSaved ? '✨ Published changes live!' : 'Ready to deploy to Supabase site_settings'}
                </span>
                <button
                  type="submit"
                  className="btn-terracotta text-sm font-bold px-6 py-2.5 rounded-full flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish CMS Updates</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Mobile/Desktop Visual Preview Card */}
          <div className="bg-[#FAF9F6] rounded-3xl p-6 border border-[#e7e0d8] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Live Preview Card
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Realtime Reactive
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#e7e0d8] shadow-xs space-y-4">
                <span className="badge-sage text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  {cmsForm.badgeText}
                </span>
                <h3 className="text-2xl font-black text-[#1E293B] leading-tight">
                  {cmsForm.headlineLine1} <span className="text-[#C85A32]">{cmsForm.headlineLine2}</span>{' '}
                  {cmsForm.headlineLine3}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cmsForm.subhead}
                </p>

                <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#e7e0d8] relative">
                  <img
                    src={cmsForm.mainImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cmsForm.mainTag}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-white border border-[#e7e0d8] text-xs text-slate-500 space-y-2">
              <span className="font-extrabold text-[#1E293B] block">Supabase Storage Target:</span>
              <p className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                bucket: cms-assets/banners/hero_2026.webp
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e7e0d8]">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Live Product Catalog ({products.length} items)</h2>
              <p className="text-xs text-slate-500">Manage student craft listings, price points, and inventory states.</p>
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="btn-terracotta text-xs md:text-sm font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student Craft</span>
            </button>
          </div>

          {/* Add Product Modal / Drawer */}
          {isAddingProduct && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#C85A32] shadow-lg animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e7e0d8]">
                <h3 className="text-lg font-black text-[#1E293B]">Add New Handcrafted Product</h3>
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveNewProduct} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.title}
                    onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
                    placeholder="e.g., Terracotta Tea Light Holder"
                    className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-sm bg-white"
                  >
                    <option>Clay Crafts</option>
                    <option>Hand-painted Cards</option>
                    <option>Accessories</option>
                    <option>Keychains</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-sm font-bold text-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Maker Name</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.maker}
                    onChange={(e) => setNewProductForm({ ...newProductForm, maker: e.target.value })}
                    placeholder="e.g., Ananya Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade &amp; School</label>
                  <input
                    type="text"
                    value={newProductForm.school}
                    onChange={(e) => setNewProductForm({ ...newProductForm, school: e.target.value })}
                    placeholder="e.g., DPS RK Puram"
                    className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProductForm.image}
                    onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e7e0d8] text-xs"
                    placeholder="Artisan materials, clay technique, etc."
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="px-4 py-2 rounded-full border border-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-terracotta px-5 py-2 rounded-full text-xs font-bold"
                  >
                    Save &amp; Publish Craft
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Edit Modal */}
          {editingProduct && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4">
                <h3 className="text-lg font-black text-[#1E293B]">Edit Product #{editingProduct.id}</h3>
                <form onSubmit={handleUpdateProductSave} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Title</label>
                    <input
                      type="text"
                      value={editingProduct.title}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-[#C85A32]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Stock Status</label>
                      <input
                        type="text"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-full border border-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-terracotta px-5 py-2 rounded-full text-xs font-bold">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 border border-[#e7e0d8] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 relative">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#C85A32] mb-1">
                    <span>{p.maker} ({p.cls})</span>
                    <span className="text-slate-400">★ {p.rating}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1E293B] line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#e7e0d8] flex items-center justify-between">
                  <span className="text-base font-black text-[#1E293B]">₹{p.price}</span>
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS & REASSIGNMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#e7e0d8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Master Order Ledger</h2>
              <p className="text-xs text-slate-500">Live order queue with student payout splits and maker reassignment.</p>
            </div>
            <span className="badge-sage text-xs font-bold px-3 py-1 rounded-full">
              {orders.length} Active Platform Orders
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-[#e7e0d8] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9F6] border-b border-[#e7e0d8] text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-5">Order #</th>
                    <th className="py-3.5 px-4">Craft Item</th>
                    <th className="py-3.5 px-4">Delivery City</th>
                    <th className="py-3.5 px-4">Total (₹)</th>
                    <th className="py-3.5 px-4">Maker 65% Share</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e0d8]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-5 font-mono text-xs font-bold text-slate-800">
                        #AK-2026-{o.id}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {o.product} <span className="text-xs text-slate-400">×{o.qty}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">{o.city}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">₹{o.amount}</td>
                      <td className="py-4 px-4 font-bold text-[#C85A32]">₹{Math.round(o.amount * 0.65)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                            o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'in_production'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => showToast(`Reassignment ticket created for Order #${o.id}`, '📦')}
                          className="text-xs font-bold text-[#C85A32] hover:underline cursor-pointer"
                        >
                          Reassign Maker
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USER ROLE MANAGEMENT (RBAC) */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#e7e0d8] flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Role-Based Access Control (RBAC)</h2>
              <p className="text-xs text-slate-500">Elevate registered accounts to Maker or Admin permissions.</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-600">
              Table: public.profiles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {usersList.map((usr) => (
              <div key={usr.id} className="bg-white rounded-2xl p-5 border border-[#e7e0d8] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">{usr.id}</span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      usr.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : usr.role === 'maker'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {usr.role}
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">{usr.name}</h4>
                  <p className="text-xs text-slate-500">{usr.email}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{usr.school}</p>
                </div>

                <div className="pt-3 border-t border-[#e7e0d8] flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-500">Change Role:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleUserRole(usr.id, 'maker')}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer ${
                        usr.role === 'maker' ? 'bg-amber-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      Maker
                    </button>
                    <button
                      onClick={() => toggleUserRole(usr.id, 'admin')}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer ${
                        usr.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => toggleUserRole(usr.id, 'customer')}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer ${
                        usr.role === 'customer' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      Customer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUPABASE & NEXT.JS ARCHITECTURE GUIDE */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e7e0d8]">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Next.js (App Router) + Supabase Setup</h2>
              <p className="text-xs text-slate-500">Production SQL schema, RLS policies, and middleware ready for deployment.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
              <h3 className="text-sm font-extrabold text-[#1E293B] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Row Level Security (RLS) Matrix
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li><strong>profiles:</strong> Users read own profile; Admins full access (`ALL`).</li>
                <li><strong>site_settings:</strong> Public `SELECT`; Admin only `INSERT/UPDATE`.</li>
                <li><strong>products:</strong> Public reads published; Admin full CRUD; Makers view/edit assigned craft.</li>
                <li><strong>orders:</strong> Makers only `SELECT` assigned orders and `UPDATE` status field.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-2">
              <h3 className="text-sm font-extrabold text-[#1E293B] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C85A32]" />
                Next.js Edge Middleware Protection
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>`/admin/*` &rarr; Strict `role === 'admin'` check via `@supabase/ssr`.</li>
                <li>`/maker/*` &rarr; Strict `role in ('maker', 'admin')` check.</li>
                <li>Unauthorized attempts auto-redirect to `/login` with friendly toast errors.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
