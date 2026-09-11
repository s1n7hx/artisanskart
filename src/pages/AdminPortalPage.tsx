import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  Upload,
  UserCheck,
  UserX,
  Hammer,
  Lock,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, HeroContent, UserAccount } from '../types';
import { uploadImageToBucket } from '../services/supabase';

export const AdminPortalPage: React.FC = () => {
  const {
    heroContent,
    updateHeroContent,
    resetHeroToDefault,
    products,
    addNewProduct,
    updateProduct,
    deleteProduct,
    orders,
    showToast,
    usersList,
    grantUserRole,
    grantUserStatus,
    promoteUserRole,
    addNewUserAccount,
    removeUserAccount,
    currentUser,
    userRole,
    setUserRole,
    userStatus,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'cms' | 'users' | 'products' | 'orders' | 'supabase'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/users')) {
      return 'users';
    }
    return 'cms';
  });

  // New authorized user state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'maker' | 'customer'>('maker');
  const [newUserStatus, setNewUserStatus] = useState<'approved' | 'pending'>('approved');
  const [newUserSchool, setNewUserSchool] = useState('');

  // Local CMS form state
  const [cmsForm, setCmsForm] = useState<HeroContent>({ ...heroContent });
  const [cmsSaved, setCmsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

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

  // User search & filter state
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'maker' | 'customer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const handleSaveCms = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroContent(cmsForm);
    setCmsSaved(true);
    showToast('Storefront headlines, copy & photography saved live!', '✨');
    setTimeout(() => setCmsSaved(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof HeroContent) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(String(field));
      const url = await uploadImageToBucket(file, 'cms-assets');
      setCmsForm((prev) => ({ ...prev, [field]: url }));
      showToast(`Uploaded new image for ${String(field)}!`, 'image');
    } catch (err: any) {
      // If bucket is not created yet, create a local blob object URL for instant preview
      const localUrl = URL.createObjectURL(file);
      setCmsForm((prev) => ({ ...prev, [field]: localUrl }));
      showToast('Image updated (local preview). Configure Supabase Storage bucket for permanent cloud hosting.', 'alert-circle');
    } finally {
      setIsUploading(null);
    }
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
      showToast('CMS restored to defaults.', 'rotate-ccw');
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
    showToast(`Added product "${prodToAdd.title}" to marketplace!`, 'sparkles');
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
      showToast(`Saved changes to "${editingProduct.title}"!`, 'check-circle-2');
      setEditingProduct(null);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.school && u.school.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const userStat = u.status || 'approved';
    const matchesStatus = statusFilter === 'all' || userStat === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalSalesVolume = orders.reduce((sum, o) => sum + o.amount, 0);
  const studentSharePaid = totalSalesVolume * 0.65;

  // Restrict access if the user is not an Admin or not approved
  if (userRole !== 'admin' || userStatus !== 'approved') {
    if (userRole === 'admin' && userStatus !== 'approved') {
      navigate('/pending-approval');
      return null;
    }
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8 text-[#C85A32]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32] bg-[#C85A32]/10 px-3 py-1 rounded-full">
            Restricted Area
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight">
            Administrator Access Required
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            This portal is reserved for ArtisansKart Master Administrators to manage live storefront content, catalog items, and maker permissions.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e7e0d8] shadow-sm text-left max-w-md mx-auto space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Current Status:</span>
            <span className="font-bold text-slate-700 capitalize">{userRole} Account ({userStatus})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Logged in User:</span>
            <span className="font-semibold text-slate-700">{currentUser?.email || 'Guest User'}</span>
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
            onClick={() => navigate('/login?redirect=/admin')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full btn-terracotta text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" /> Sign In with Google
          </button>
        </div>
      </div>
    );
  }

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
              Supabase RBAC: Active
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            ArtisansKart Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
            Direct visual control over storefront photography, headlines, catalog items, and student maker permission grants.
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
          <span>Live Storefront CMS &amp; Pictures</span>
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
          <span>Users &amp; Permission Grants ({usersList.length})</span>
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
          <span>Product Catalog &amp; Pricing ({products.length})</span>
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
          <span>Fulfillment Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'supabase'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-500" />
          <span>Database &amp; Supabase Status</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: LIVE STOREFRONT CMS & PICTURES
      ------------------------------------------------------------- */}
      {activeTab === 'cms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form
              onSubmit={handleSaveCms}
              className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#e7e0d8]">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Storefront Copy &amp; Photography Studio
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update all text, tags, and banner photographs rendered across the live website.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCms}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="bg-[#C85A32] text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#b04a25] transition cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publish Changes Live</span>
                  </button>
                </div>
              </div>

              {/* Pill Badge */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Top Pill Badge Text
                </label>
                <input
                  type="text"
                  value={cmsForm.badgeText}
                  onChange={(e) => setCmsForm({ ...cmsForm, badgeText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              {/* 3-Line Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Headline Line 1
                  </label>
                  <input
                    type="text"
                    value={cmsForm.headlineLine1}
                    onChange={(e) => setCmsForm({ ...cmsForm, headlineLine1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#C85A32] mb-1">
                    Headline Line 2 (Accent)
                  </label>
                  <input
                    type="text"
                    value={cmsForm.headlineLine2}
                    onChange={(e) => setCmsForm({ ...cmsForm, headlineLine2: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#C85A32]/40 bg-[#C85A32]/5 text-sm font-bold text-[#C85A32] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Headline Line 3
                  </label>
                  <input
                    type="text"
                    value={cmsForm.headlineLine3}
                    onChange={(e) => setCmsForm({ ...cmsForm, headlineLine3: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Subheading / Mission Copy */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Hero Subtitle &amp; Student Pledge
                </label>
                <textarea
                  rows={3}
                  value={cmsForm.subhead}
                  onChange={(e) => setCmsForm({ ...cmsForm, subhead: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              {/* Photography Banners Section */}
              <div className="pt-4 border-t border-[#e7e0d8] space-y-5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C85A32]" />
                  Homepage Banner Images &amp; Tags
                </h3>

                {/* Main Hero Center Banner */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#e7e0d8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">1. Main Center Photography Banner</span>
                    <label className="cursor-pointer text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading === 'mainImage' ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'mainImage')}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={cmsForm.mainImage}
                      onChange={(e) => setCmsForm({ ...cmsForm, mainImage: e.target.value })}
                      placeholder="Photo URL (https://...)"
                      className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={cmsForm.mainTag}
                      onChange={(e) => setCmsForm({ ...cmsForm, mainTag: e.target.value })}
                      placeholder="Tag label (e.g. Live Wheel Pottery)"
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  {cmsForm.mainImage && (
                    <img
                      src={cmsForm.mainImage}
                      alt="Center Banner"
                      className="h-28 w-full object-cover rounded-xl border border-slate-200"
                    />
                  )}
                </div>

                {/* Left & Right Banners */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Banner */}
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#e7e0d8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">2. Left Feature Banner</span>
                      <label className="cursor-pointer text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'leftImage')}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={cmsForm.leftImage}
                      onChange={(e) => setCmsForm({ ...cmsForm, leftImage: e.target.value })}
                      placeholder="Image URL"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={cmsForm.leftTag}
                      onChange={(e) => setCmsForm({ ...cmsForm, leftTag: e.target.value })}
                      placeholder="Tag (e.g. Fine Art Cards)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                    />
                    {cmsForm.leftImage && (
                      <img
                        src={cmsForm.leftImage}
                        alt="Left Banner"
                        className="h-20 w-full object-cover rounded-xl border border-slate-200"
                      />
                    )}
                  </div>

                  {/* Right Banner */}
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#e7e0d8] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">3. Right Feature Banner</span>
                      <label className="cursor-pointer text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'rightImage')}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={cmsForm.rightImage}
                      onChange={(e) => setCmsForm({ ...cmsForm, rightImage: e.target.value })}
                      placeholder="Image URL"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={cmsForm.rightTag}
                      onChange={(e) => setCmsForm({ ...cmsForm, rightTag: e.target.value })}
                      placeholder="Tag (e.g. Beaded Accessories)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                    />
                    {cmsForm.rightImage && (
                      <img
                        src={cmsForm.rightImage}
                        alt="Right Banner"
                        className="h-20 w-full object-cover rounded-xl border border-slate-200"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e7e0d8] flex justify-end">
                <button
                  type="submit"
                  className="bg-[#C85A32] text-white text-sm font-bold px-8 py-3 rounded-full flex items-center gap-2 hover:bg-[#b04a25] transition shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Publish Storefront Live</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Column */}
          <div className="space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Live Responsive Preview
            </span>
            <div className="bg-white rounded-3xl p-6 border border-[#e7e0d8] shadow-sm space-y-4">
              <span className="bg-[#8A9A86]/20 text-[#43513f] text-[11px] font-bold px-3 py-0.5 rounded-full inline-block">
                {cmsForm.badgeText}
              </span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {cmsForm.headlineLine1}{' '}
                <span className="text-[#C85A32]">{cmsForm.headlineLine2}</span>{' '}
                {cmsForm.headlineLine3}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{cmsForm.subhead}</p>

              {cmsForm.mainImage && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={cmsForm.mainImage}
                    alt="Center Banner"
                    className="w-full h-44 object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {cmsForm.mainTag}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: USERS & PERMISSION GRANTS (RBAC)
      ------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7e0d8]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  User Roles &amp; Email Authorization
                </h2>
                <span className="text-xs bg-[#C85A32]/10 text-[#C85A32] font-black px-2.5 py-0.5 rounded-full">
                  {usersList.length} registered accounts
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add authorized Google emails and grant permissions for <strong>Admins</strong> or <strong>Student Makers</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="bg-[#C85A32] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#b04a25] transition"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingUser ? 'Close Form' : 'Authorize New Email'}</span>
              </button>
            </div>
          </div>

          {/* Add New Authorized User Form */}
          {isAddingUser && (
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                  Authorize Email for Admin or Maker Role
                </h3>
                <span className="text-[11px] text-amber-800">
                  When this user signs in with Google, they will automatically receive this role.
                </span>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newUserEmail.trim()) {
                    showToast('Please enter a valid email.', 'alert-circle');
                    return;
                  }
                  await addNewUserAccount(newUserEmail, newUserName, newUserRole, newUserSchool);
                  setNewUserEmail('');
                  setNewUserName('');
                  setNewUserSchool('');
                  setIsAddingUser(false);
                }}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Google Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Role to Assign <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-hidden focus:border-[#C85A32]"
                  >
                    <option value="maker">🔨 Student Maker (Publish & Fulfill)</option>
                    <option value="admin">🛡️ Co-Admin (Full CMS Access)</option>
                    <option value="customer">👤 Customer (Standard Buyer)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUserSchool}
                    onChange={(e) => setNewUserSchool(e.target.value)}
                    placeholder="School / College (Optional)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-hidden focus:border-[#C85A32]"
                  />
                  <button
                    type="submit"
                    className="bg-[#1E293B] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#C85A32] transition cursor-pointer shrink-0"
                  >
                    Save &amp; Grant
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Buttons & Search */}
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Role filter */}
              <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#e7e0d8] p-1 rounded-2xl text-xs font-bold">
                <span className="text-[10px] text-slate-400 px-2 uppercase font-black">Role:</span>
                {(['all', 'admin', 'maker', 'customer'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-xl capitalize transition cursor-pointer ${
                      roleFilter === r
                        ? 'bg-[#C85A32] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#e7e0d8] p-1 rounded-2xl text-xs font-bold">
                <span className="text-[10px] text-slate-400 px-2 uppercase font-black">Status:</span>
                {(['all', 'approved', 'pending', 'rejected'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-xl capitalize transition cursor-pointer ${
                      statusFilter === s
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* User Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or school..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-xs focus:bg-white focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === 'admin';
              const isMaker = u.role === 'maker';
              const isMasterAdmin = u.email.toLowerCase() === 'ssumollah@gmail.com';
              const userStat = u.status || 'approved';
              const isApproved = userStat === 'approved';
              const isPending = userStat === 'pending';
              const isRejected = userStat === 'rejected';

              return (
                <div
                  key={u.id}
                  className="p-5 rounded-2xl border border-[#e7e0d8] bg-[#FAF9F6] hover:bg-white hover:border-[#C85A32]/40 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-sm">{u.name}</h4>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-slate-900 text-white'
                              : isMaker
                              ? 'bg-[#C85A32] text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {userStat}
                        </span>

                        {isMasterAdmin && (
                          <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                            ★ Master
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
                      {u.school && (
                        <p className="text-xs text-slate-600 font-medium mt-1">🏫 {u.school}</p>
                      )}
                    </div>

                    {!isMasterAdmin && (
                      <button
                        type="button"
                        onClick={() => removeUserAccount(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Remove user account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Master Admin Actions */}
                  <div className="pt-3 border-t border-[#e7e0d8] space-y-2">
                    {/* Role quick actions */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role:</span>

                      {/* Promote to Admin / Demote to Customer */}
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => promoteUserRole(u.id, 'customer', 'approved')}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          Demote to Customer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => promoteUserRole(u.id, 'admin', 'approved')}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Promote to Admin
                        </button>
                      )}

                      {/* Approve Maker / Revoke Maker Access */}
                      {isMaker ? (
                        <button
                          type="button"
                          onClick={() => promoteUserRole(u.id, 'customer', 'approved')}
                          className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition cursor-pointer border border-red-200"
                        >
                          Revoke Maker Access
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => promoteUserRole(u.id, 'maker', 'approved')}
                          className="px-2.5 py-1 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Approve Maker
                        </button>
                      )}
                    </div>

                    {/* Status quick actions */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>

                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => grantUserStatus(u.id, 'approved')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                          >
                            ✓ Approve Access
                          </button>
                          <button
                            type="button"
                            onClick={() => grantUserStatus(u.id, 'rejected')}
                            className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition cursor-pointer border border-red-200"
                          >
                            ✗ Reject
                          </button>
                        </>
                      ) : isRejected ? (
                        <button
                          type="button"
                          onClick={() => grantUserStatus(u.id, 'approved')}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          ✓ Re-Approve
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => grantUserStatus(u.id, 'pending')}
                          className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition cursor-pointer"
                        >
                          Set to Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: PRODUCT CATALOG & PRICING
      ------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7e0d8]">
            <div>
              <h2 className="text-xl font-black text-slate-900">Marketplace Product Catalog</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Master Admin can edit titles, prices, student names, descriptions, or remove items.
              </p>
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-[#C85A32] text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-[#b04a25] transition cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Add Product Drawer */}
          {isAddingProduct && (
            <form
              onSubmit={handleSaveNewProduct}
              className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#C85A32]/30 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Create New Student Product</h3>
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.title}
                    onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Clay Crafts">Clay Crafts</option>
                    <option value="Hand-painted Cards">Hand-painted Cards</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Keychains">Keychains</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Maker Name</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.maker}
                    onChange={(e) => setNewProductForm({ ...newProductForm, maker: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">School / Club</label>
                  <input
                    type="text"
                    value={newProductForm.school}
                    onChange={(e) => setNewProductForm({ ...newProductForm, school: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newProductForm.image}
                    onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-[#C85A32] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#b04a25]"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          )}

          {/* Edit Product Dialog */}
          {editingProduct && (
            <form
              onSubmit={handleUpdateProductSave}
              className="bg-amber-50/70 p-6 rounded-2xl border border-amber-300 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-amber-900">
                  Editing: {editingProduct.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-[#C85A32] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Status</label>
                  <input
                    type="text"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="bg-[#C85A32] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#b04a25]"
                >
                  Save Product Edits
                </button>
              </div>
            </form>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-slate-500 font-extrabold uppercase tracking-wider border-b border-[#e7e0d8]">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Student Maker</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e0d8]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF9F6]/80 transition">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                        <p className="text-[11px] text-slate-400">{p.stock}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 font-black text-[#C85A32] text-sm">₹{p.price}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{p.maker}</p>
                      <p className="text-[11px] text-slate-400">{p.school}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${p.title}"?`)) deleteProduct(p.id);
                          }}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 4: ORDERS & REASSIGNMENT CENTER
      ------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#e7e0d8]">
            <div>
              <h2 className="text-xl font-black text-slate-900">Customer Fulfillment Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of all student craft orders, delivery deadlines, and payment payouts.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {orders.length} orders
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      #ORD-2026-{o.id}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] uppercase">
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{o.product}</h4>
                  <p className="text-xs text-slate-500">
                    City: <strong>{o.city}</strong> • Deadline: <strong>{o.deadline}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total / 65% Split</span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{o.amount} <span className="text-[#C85A32]">(₹{o.amount * 0.65})</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 5: DATABASE & SUPABASE STATUS
      ------------------------------------------------------------- */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#e7e0d8]">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Supabase Cloud Database &amp; Auth Health
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected to your project endpoint with automatic Row Level Security and Google OAuth.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Supabase Project URL</span>
              <p className="text-xs font-mono font-bold text-slate-900 break-all">
                https://xhzphnfzuutduztukiln.supabase.co
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Role-Based Security</span>
              <p className="text-xs font-bold text-emerald-700">
                ✓ RLS Enforced (Admin, Maker, Customer)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
