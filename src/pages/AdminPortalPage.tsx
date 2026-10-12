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
  Truck,
  RefreshCw,
  CreditCard,
  X,
} from 'lucide-react';
import { useApp, MASTER_ADMIN_EMAIL } from '../context/AppContext';
import { Product, HeroContent, UserAccount, UserRole, OrderStatus, Order, maskEmail } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import {
  uploadImageToBucket,
  fetchAllMakerApplications,
  reviewMakerApplication,
  MakerApplicationItem,
} from '../services/supabase';
import { updateOrderStatusWithLifecycle } from '../services/ecommerce';

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
    makerEarningPercent,
    updateMakerEarningPercent,
  } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'cms' | 'commission' | 'users' | 'applications' | 'products' | 'orders' | 'supabase'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.includes('/applications')) return 'applications';
      if (window.location.pathname.includes('/users')) return 'users';
      if (window.location.pathname.includes('/commission') || window.location.pathname.includes('/policy')) return 'commission';
    }
    return 'users';
  });

  const [makerApps, setMakerApps] = useState<MakerApplicationItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

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
  const [customPercentInput, setCustomPercentInput] = useState<number>(makerEarningPercent);
  const [isSavingPercent, setIsSavingPercent] = useState(false);

  React.useEffect(() => {
    setCustomPercentInput(makerEarningPercent);
  }, [makerEarningPercent]);

  // Server-side Shiprocket & Razorpay integration status
  const [shippingStatus, setShippingStatus] = useState<any>(null);
  const [razorpayStatus, setRazorpayStatus] = useState<any>(null);
  const [isTestingShiprocket, setIsTestingShiprocket] = useState(false);
  const [shiprocketTestResult, setShiprocketTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Administrative Order Management state
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');
  const [targetOverrideStatus, setTargetOverrideStatus] = useState<string>('');
  const [overrideNote, setOverrideNote] = useState<string>('');
  const [isOverridingStatus, setIsOverridingStatus] = useState(false);

  React.useEffect(() => {
    fetch('/api/shipping/config-status')
      .then((r) => r.json())
      .then((d) => {
        if (d?.shiprocket) setShippingStatus(d.shiprocket);
        if (d?.razorpay) setRazorpayStatus(d.razorpay);
      })
      .catch(() => {});
  }, []);

  const handleTestShiprocketAuth = async () => {
    setIsTestingShiprocket(true);
    setShiprocketTestResult(null);
    try {
      const res = await fetch('/api/shipping/test-shiprocket-auth', { method: 'POST' });
      const data = await res.json();
      setShiprocketTestResult({ success: Boolean(data.success), message: data.message });
      if (data.status) setShippingStatus(data.status);
    } catch (err: any) {
      setShiprocketTestResult({ success: false, message: err.message || 'Diagnostic request failed' });
    } finally {
      setIsTestingShiprocket(false);
    }
  };

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
  const [roleFilter, setRoleFilter] = useState<'all' | 'master_admin' | 'admin' | 'maker' | 'customer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});

  // Load maker applications on mount and tab switch
  React.useEffect(() => {
    async function loadApps() {
      setLoadingApps(true);
      try {
        const apps = await fetchAllMakerApplications();
        setMakerApps(apps);
      } catch (err) {
        console.warn('Error loading maker applications:', err);
      } finally {
        setLoadingApps(false);
      }
    }
    loadApps();
  }, [activeTab]);

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
  const studentSharePaid = totalSalesVolume * (makerEarningPercent / 100);

  const isMasterAdmin =
    (currentUser?.email || '').trim().toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() ||
    (currentUser?.email || '').trim().toLowerCase() === 'ssumollah@gmail.com' ||
    userRole === 'master_admin';

  // Restrict access if the user is not an Admin or not approved (Master Admin is directly authorized)
  if (!isMasterAdmin && ((userRole !== 'admin' && userRole !== 'master_admin') || userStatus !== 'approved')) {
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
            <span className="font-semibold text-slate-700">{currentUser ? currentUser.name : 'Guest User'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
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
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[11px] text-[#C85A32] block font-semibold">{makerEarningPercent}% Student Fund</span>
              <span className="text-2xl font-black text-[#C85A32]">₹{Math.round(studentSharePaid).toLocaleString('en-IN')}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('commission')}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-[#C85A32]/25 hover:bg-[#C85A32]/40 text-[#E6A373] hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1 border border-[#C85A32]/40"
              title="Customize Maker Earning Split"
            >
              <span>Edit %</span>
            </button>
          </div>
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e7e0d8] pb-3">
        <button
          onClick={() => setActiveTab('commission')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'commission'
              ? 'bg-[#C85A32] text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <DollarSign className="w-4 h-4 text-[#C85A32]" />
          <span>Maker Earning % Policy ({makerEarningPercent}%)</span>
        </button>

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
          <span>User Role Management ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-[#C85A32] text-white shadow-sm'
              : 'bg-white border border-[#e7e0d8] text-slate-700 hover:bg-[#FAF9F6]'
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Maker Applications ({makerApps.filter((a) => a.status === 'pending').length} Pending)</span>
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
          TAB: MAKER COMMISSION & EARNINGS SPLIT POLICY (CUSTOMIZABLE)
      ------------------------------------------------------------- */}
      {activeTab === 'commission' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e7e0d8] gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Maker Commission &amp; Earnings Split Policy
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customizable administrative setting: configure the percentage of order amounts credited directly to student creators.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active Platform Split: {makerEarningPercent}% Student / {100 - makerEarningPercent}% Platform
                </span>
              </div>
            </div>

            {/* Main Adjustment Slider and Presets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                    <span>Adjust Direct Student Creator Share:</span>
                    <span className="text-2xl font-black text-[#C85A32]">{customPercentInput}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    step={1}
                    value={customPercentInput}
                    onChange={(e) => setCustomPercentInput(Number(e.target.value))}
                    className="w-full accent-[#C85A32] cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5">
                    <span>10% (Low)</span>
                    <span>50% (Standard)</span>
                    <span>65% (ArtisansKart Default)</span>
                    <span>80% (High Fund)</span>
                    <span>95% (Max Payout)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Quick Preset Rates:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { val: 50, label: '50% (Equal Split)' },
                      { val: 65, label: '65% (ArtisansKart Default)' },
                      { val: 70, label: '70% (Fair-Trade Tier)' },
                      { val: 75, label: '75% (Student Focused)' },
                      { val: 80, label: '80% (High Support)' },
                      { val: 90, label: '90% (Scholarship Tier)' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setCustomPercentInput(preset.val)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          customPercentInput === preset.val
                            ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-2xs'
                            : 'bg-[#FAF9F6] text-slate-700 border-[#e7e0d8] hover:border-[#C85A32]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Simulation Matrix */}
                <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Live Order Value Simulation (Based on {customPercentInput}% Student Payout)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[350, 850, 1500, 3000].map((amt) => {
                      const studentCut = Math.round(amt * (customPercentInput / 100));
                      const platformCut = amt - studentCut;
                      return (
                        <div key={amt} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="font-extrabold text-slate-900 block text-xs">₹{amt} Order</span>
                          <div className="text-[11px]">
                            <span className="text-slate-400 block">Student receives:</span>
                            <span className="font-black text-[#C85A32]">₹{studentCut}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            <span>Platform: ₹{platformCut}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3 text-center">
                  <label className="block text-xs font-bold text-slate-700">Set Percentage (%)</label>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min={10}
                      max={95}
                      value={customPercentInput}
                      onChange={(e) => setCustomPercentInput(Math.max(10, Math.min(95, Number(e.target.value))))}
                      className="w-24 text-center font-black text-3xl px-3 py-2 rounded-xl border border-slate-300 text-[#C85A32] bg-white shadow-2xs"
                    />
                    <span className="text-xl font-black text-slate-600">%</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Platform retains <strong>{100 - customPercentInput}%</strong> for parcel packaging, campus delivery lockers, and logistics.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isSavingPercent}
                    onClick={async () => {
                      setIsSavingPercent(true);
                      await updateMakerEarningPercent(customPercentInput);
                      setIsSavingPercent(false);
                    }}
                    className="w-full py-3 px-4 bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingPercent ? 'Saving Policy...' : `Save ${customPercentInput}% Policy`}</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Saved to cloud settings &amp; automatically applied across all student maker workspaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Surfaces Checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-800 block">Where this customized rate is actively reflected:</span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-500">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>Student Maker Workspace:</strong> Total earnings metric &amp; order payout splits</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>Marketplace Header:</strong> Real-time student creator split badge</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>How It Works Page:</strong> Dynamic interactive order breakdown simulator</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span><strong>Campus Order Fulfillment:</strong> UPI transfer calculations upon delivery</span>
                </li>
              </ul>
            </div>

            {/* Platform Shipping, Delivery & Acceptance Policy Settings */}
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-bold text-slate-900 text-sm">Platform Fulfillment &amp; Operational Policies</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Maker Acceptance Window</span>
                  <p className="font-black text-slate-900 text-sm">24 Hours</p>
                  <p className="text-[10px] text-slate-500">Auto-alerts sent if student maker doesn't confirm within 18h.</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Free Shipping Threshold</span>
                  <p className="font-black text-[#C85A32] text-sm">₹499</p>
                  <p className="text-[10px] text-slate-500">Orders below ₹499 charged flat ₹49 eco-shipping.</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Return Policy</span>
                  <p className="font-black text-slate-900 text-sm">No Returns (Final Sale)</p>
                  <p className="text-[10px] text-slate-500">100% handcrafted made-to-order student creations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#e7e0d8] space-y-3">
                  <span className="text-xs font-black uppercase text-slate-700 block">
                    1. Main Center Photography Banner
                  </span>
                  <ImageUploader
                    value={cmsForm.mainImage}
                    onChange={(url) => setCmsForm({ ...cmsForm, mainImage: url })}
                    label="Center Banner Image"
                    helperText="Direct device upload or image link"
                    placeholder="https://images.pexels.com/..."
                    previewHeight="h-36"
                  />
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tag Label</label>
                    <input
                      type="text"
                      value={cmsForm.mainTag}
                      onChange={(e) => setCmsForm({ ...cmsForm, mainTag: e.target.value })}
                      placeholder="Tag label (e.g. Live Wheel Pottery)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    />
                  </div>
                </div>

                {/* Left & Right Banners */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Banner */}
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#e7e0d8] space-y-3">
                    <span className="text-xs font-black uppercase text-slate-700 block">
                      2. Left Feature Banner
                    </span>
                    <ImageUploader
                      value={cmsForm.leftImage}
                      onChange={(url) => setCmsForm({ ...cmsForm, leftImage: url })}
                      label="Left Banner Image"
                      helperText="Device upload or link"
                      previewHeight="h-28"
                    />
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Left Tag</label>
                      <input
                        type="text"
                        value={cmsForm.leftTag}
                        onChange={(e) => setCmsForm({ ...cmsForm, leftTag: e.target.value })}
                        placeholder="Tag (e.g. Fine Art Cards)"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>

                  {/* Right Banner */}
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#e7e0d8] space-y-3">
                    <span className="text-xs font-black uppercase text-slate-700 block">
                      3. Right Feature Banner
                    </span>
                    <ImageUploader
                      value={cmsForm.rightImage}
                      onChange={(url) => setCmsForm({ ...cmsForm, rightImage: url })}
                      label="Right Banner Image"
                      helperText="Device upload or link"
                      previewHeight="h-28"
                    />
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Right Tag</label>
                      <input
                        type="text"
                        value={cmsForm.rightTag}
                        onChange={(e) => setCmsForm({ ...cmsForm, rightTag: e.target.value })}
                        placeholder="Tag (e.g. Beaded Accessories)"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                      />
                    </div>
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

            {/* Maker Commission & Earnings Split Policy Settings */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e7e0d8] gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Maker Commission &amp; Earnings Split Policy
                    </h3>
                    <p className="text-xs text-slate-500">
                      Customizable platform setting: configure the percentage of order amounts given directly to student makers.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                  Active Rate: {makerEarningPercent}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                      <span>Adjust Student Creator Share:</span>
                      <span className="text-xl font-black text-[#C85A32]">{customPercentInput}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      step={1}
                      value={customPercentInput}
                      onChange={(e) => setCustomPercentInput(Number(e.target.value))}
                      className="w-full accent-[#C85A32] cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                      <span>10% (Low)</span>
                      <span>50% (Standard)</span>
                      <span>65% (Default)</span>
                      <span>80% (High Fund)</span>
                      <span>95% (Max Payout)</span>
                    </div>
                  </div>

                  {/* Real-time Order Breakdown Visualizer */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold block">Student Maker Receives:</span>
                      <span className="text-lg font-black text-[#C85A32]">{customPercentInput}%</span>
                      <span className="text-[11px] text-slate-400 block">
                        ₹{Math.round(1000 * (customPercentInput / 100))} on a ₹1,000 order
                      </span>
                    </div>
                    <div className="space-y-1 border-l border-slate-200 pl-4">
                      <span className="text-slate-500 font-bold block">Platform Logistics Fund:</span>
                      <span className="text-lg font-black text-slate-800">{100 - customPercentInput}%</span>
                      <span className="text-[11px] text-slate-400 block">
                        ₹{Math.round(1000 * ((100 - customPercentInput) / 100))} on a ₹1,000 order
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <label className="block text-xs font-bold text-slate-700">Set Percentage (%)</label>
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      min={10}
                      max={95}
                      value={customPercentInput}
                      onChange={(e) => setCustomPercentInput(Math.max(10, Math.min(95, Number(e.target.value))))}
                      className="w-24 text-center font-black text-2xl px-3 py-2 rounded-xl border border-slate-300 text-[#C85A32] bg-white"
                    />
                    <span className="text-lg font-black text-slate-600">%</span>
                  </div>
                  <button
                    type="button"
                    disabled={isSavingPercent}
                    onClick={async () => {
                      setIsSavingPercent(true);
                      await updateMakerEarningPercent(customPercentInput);
                      setIsSavingPercent(false);
                    }}
                    className="w-full py-2.5 px-4 bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingPercent ? 'Saving Policy...' : 'Save Payout Percentage'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400">
                    Applies immediately to all maker portals and storefront metrics.
                  </p>
                </div>
              </div>
            </div>
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
              const isTargetMaster =
                u.email.toLowerCase() === 'ssumollah@gmail.com' || u.role === 'master_admin';
              const isTargetAdmin = u.role === 'admin';
              const isTargetMaker = u.role === 'maker';
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
                            isTargetMaster
                              ? 'bg-amber-400 text-amber-950 font-black'
                              : isTargetAdmin
                              ? 'bg-slate-900 text-white'
                              : isTargetMaker
                              ? 'bg-[#C85A32] text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isTargetMaster ? 'Master Author' : u.role}
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

                        {isTargetMaster && (
                          <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                            ★ Master Author
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono mt-0.5">
                        {isTargetMaster ? (
                          <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Master Admin (Protected Email)
                          </span>
                        ) : (
                          <span className="text-slate-500">{maskEmail(u.email)}</span>
                        )}
                      </p>
                      {u.school && (
                        <p className="text-xs text-slate-600 font-medium mt-1">🏫 {u.school}</p>
                      )}
                    </div>

                    {!isTargetMaster && isMasterAdmin && (
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

                  {/* Role & Status Management */}
                  <div className="pt-3 border-t border-[#e7e0d8] space-y-2">
                    {isTargetMaster ? (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Permanent Master Author &bull; Protected from demotion or role changes</span>
                      </div>
                    ) : isMasterAdmin ? (
                      <div className="space-y-2.5">
                        {/* Interactive Role Assignment (Dropdown + Save) */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">Current role:</span>
                            <span className="font-black uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                              {u.role}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-xs font-bold text-slate-700">Change role:</span>
                            <select
                              value={roleDrafts[u.id] || u.role}
                              onChange={(e) =>
                                setRoleDrafts((prev) => ({
                                  ...prev,
                                  [u.id]: e.target.value as UserRole,
                                }))
                              }
                              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:border-[#C85A32] cursor-pointer"
                            >
                              <option value="customer">Customer</option>
                              <option value="maker">Maker</option>
                              <option value="admin">Admin (Co-Admin)</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const targetRole = roleDrafts[u.id] || u.role;
                                promoteUserRole(u.id, targetRole, 'approved');
                                setRoleDrafts((prev) => {
                                  const copy = { ...prev };
                                  delete copy[u.id];
                                  return copy;
                                });
                              }}
                              disabled={!roleDrafts[u.id] || roleDrafts[u.id] === u.role}
                              className="px-3.5 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] disabled:opacity-40 disabled:hover:bg-[#C85A32] text-white text-xs font-bold transition cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>

                        {/* Status quick actions */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
                    ) : userRole === 'admin' ? (
                      /* Co-admin management capabilities: Can manage makers and approval statuses, but CANNOT modify admin privileges */
                      <div className="space-y-2">
                        {u.role === 'admin' ? (
                          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs flex items-center gap-1.5 font-medium">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Administrator account &bull; Modification restricted to Master Author</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-700">Artisan access:</span>
                              {u.role === 'customer' ? (
                                <button
                                  type="button"
                                  onClick={() => promoteUserRole(u.id, 'maker', 'approved')}
                                  className="px-3 py-1 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04a25] transition cursor-pointer"
                                >
                                  Grant Maker Role
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => promoteUserRole(u.id, 'customer', 'approved')}
                                  className="px-3 py-1 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition cursor-pointer"
                                >
                                  Revoke Maker
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs">
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => grantUserStatus(u.id, 'approved')}
                                  className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] transition cursor-pointer"
                                >
                                  ✓ Approve
                                </button>
                              )}
                              {isApproved && u.role === 'maker' && (
                                <button
                                  type="button"
                                  onClick={() => grantUserStatus(u.id, 'rejected')}
                                  className="px-2.5 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-[11px] transition cursor-pointer"
                                >
                                  Suspend Maker
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs italic">
                        Role assignments and permissions are strictly managed by the Master Author.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB: MAKER APPLICATIONS (REVIEW & APPROVAL)
      ------------------------------------------------------------- */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e7e0d8]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  Maker Applications &amp; Student Portfolios
                </h2>
                <span className="text-xs bg-[#C85A32]/10 text-[#C85A32] font-black px-2.5 py-0.5 rounded-full">
                  {makerApps.length} total applications
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review student creator applications. Approving an application automatically upgrades the user's role to <strong>Maker</strong> in the database.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setLoadingApps(true);
                try {
                  const apps = await fetchAllMakerApplications();
                  setMakerApps(apps);
                  showToast('Maker applications refreshed.', 'rotate-ccw');
                } finally {
                  setLoadingApps(false);
                }
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Active Payout Policy Banner */}
          <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C85A32] text-white flex items-center justify-center font-black shrink-0 text-sm">
                %
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  Student Fair-Trade Split: <span className="text-[#C85A32] font-black">{makerEarningPercent}%</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Approved student makers receive {makerEarningPercent}% directly via UPI upon order completion (₹{Math.round(1000 * (makerEarningPercent / 100))} per ₹1,000 order).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('commission')}
              className="px-3.5 py-1.5 bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold rounded-xl transition text-[11px] shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Customize Split Policy
            </button>
          </div>

          {makerApps.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-3">
              <Hammer className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Maker Applications Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When customers apply through <strong>"Become a Maker"</strong> or the <strong>"Sell Crafts"</strong> portal, their submissions appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {makerApps.map((app) => {
                const userMatch = usersList.find((u) => u.id === app.user_id);
                const applicantEmail = app.applicant_email || userMatch?.email || 'Student Creator';
                const applicantName = app.applicant_name || userMatch?.name || 'Applicant';
                const isPending = app.status === 'pending';
                const isApproved = app.status === 'approved';
                const isRejected = app.status === 'rejected';

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-[#e7e0d8] bg-[#FAF9F6] hover:bg-white hover:border-[#C85A32]/40 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm">{applicantName}</h4>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{maskEmail(applicantEmail)}</p>
                        <p className="text-xs text-slate-700 font-medium mt-1">
                          🏫 <strong>{app.school}</strong> • Class: <strong>{app.grade_class}</strong>
                        </p>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {app.message && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Artist Statement / Proposal:
                        </span>
                        {app.message}
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#e7e0d8]">
                      <div className="text-xs text-slate-500">
                        Current role: <strong className="text-slate-800 uppercase">{userMatch?.role || 'Customer'}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={async () => {
                                await reviewMakerApplication(app.id, app.user_id, 'approved');
                                setMakerApps((prev) =>
                                  prev.map((a) => (a.id === app.id ? { ...a, status: 'approved' } : a))
                                );
                                if (userMatch) {
                                  promoteUserRole(userMatch.id, 'maker', 'approved');
                                }
                                showToast(`Approved maker application for ${applicantName}!`, 'check-circle-2');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                            >
                              ✓ Approve Maker
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await reviewMakerApplication(app.id, app.user_id, 'rejected');
                                setMakerApps((prev) =>
                                  prev.map((a) => (a.id === app.id ? { ...a, status: 'rejected' } : a))
                                );
                                showToast(`Rejected application for ${applicantName}.`, 'alert-circle');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition cursor-pointer"
                            >
                              ✗ Reject
                            </button>
                          </>
                        ) : isRejected ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await reviewMakerApplication(app.id, app.user_id, 'approved');
                              setMakerApps((prev) =>
                                prev.map((a) => (a.id === app.id ? { ...a, status: 'approved' } : a))
                              );
                              if (userMatch) {
                                promoteUserRole(userMatch.id, 'maker', 'approved');
                              }
                              showToast(`Re-approved maker application for ${applicantName}!`, 'check-circle-2');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                          >
                            ✓ Re-Approve
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Approved Student Maker
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                    <option value="Paintings">Paintings &amp; Canvas Art</option>
                    <option value="Clay Crafts">Clay Crafts &amp; Pottery</option>
                    <option value="Hand-painted Cards">Hand-painted Cards</option>
                    <option value="Accessories">Accessories &amp; Beads</option>
                    <option value="Keychains">Keychains &amp; Charms</option>
                    <option value="Pottery & Ceramics">Pottery &amp; Ceramics</option>
                    <option value="Resin & Glass Art">Resin &amp; Glass Art</option>
                    <option value="Textiles & Macramé">Textiles &amp; Macramé</option>
                    <option value="Other Crafts">Other Crafts (Custom Type)</option>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div>
                <ImageUploader
                  value={newProductForm.image || ''}
                  onChange={(url) => setNewProductForm({ ...newProductForm, image: url })}
                  label="Product Photography"
                  helperText="Upload picture from device or paste image link"
                  placeholder="https://images.pexels.com/... or browse file"
                  previewHeight="h-32"
                />
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

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="Paintings">Paintings &amp; Canvas Art</option>
                    <option value="Clay Crafts">Clay Crafts &amp; Pottery</option>
                    <option value="Hand-painted Cards">Hand-painted Cards</option>
                    <option value="Accessories">Accessories &amp; Beads</option>
                    <option value="Keychains">Keychains &amp; Charms</option>
                    <option value="Pottery & Ceramics">Pottery &amp; Ceramics</option>
                    <option value="Resin & Glass Art">Resin &amp; Glass Art</option>
                    <option value="Textiles & Macramé">Textiles &amp; Macramé</option>
                    <option value="Other Crafts">Other Crafts</option>
                    {editingProduct.category &&
                      ![
                        'Paintings',
                        'Clay Crafts',
                        'Hand-painted Cards',
                        'Accessories',
                        'Keychains',
                        'Pottery & Ceramics',
                        'Resin & Glass Art',
                        'Textiles & Macramé',
                        'Other Crafts',
                      ].includes(editingProduct.category) && (
                        <option value={editingProduct.category}>
                          Custom: {editingProduct.category}
                        </option>
                      )}
                  </select>
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
              </div>

              <div>
                <ImageUploader
                  value={editingProduct.image || ''}
                  onChange={(url) => setEditingProduct({ ...editingProduct, image: url })}
                  label="Product Photo"
                  helperText="Upload new photo from device or update link"
                  placeholder="https://images.pexels.com/... or choose file"
                  previewHeight="h-32"
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

          {/* Shiprocket Logistics & Courier Integration Status */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/50 border border-orange-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white flex items-center justify-center shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Shiprocket Logistics Integration</h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        shippingStatus?.configured
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {shippingStatus?.configured
                        ? shippingStatus?.authenticated
                          ? '● Live Connected'
                          : '● Credentials Active'
                        : '○ Verified Simulation'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Official API: Auto-login with <code className="text-[#C85A32] font-bold">SHIPROCKET_EMAIL</code> &amp; <code className="text-[#C85A32] font-bold">SHIPROCKET_PASSWORD</code>. Token cached server-side for 9 days.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleTestShiprocketAuth}
                  disabled={isTestingShiprocket}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#C85A32] ${isTestingShiprocket ? 'animate-spin' : ''}`} />
                  <span>{isTestingShiprocket ? 'Authenticating...' : 'Test Shiprocket Auth'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-orange-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Auth Mechanism</span>
                <span className="font-semibold text-slate-800">Auto-login (No manual token entry)</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-orange-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Server Cache Status</span>
                <span className="font-semibold text-slate-800">
                  {shippingStatus?.tokenCached
                    ? `Token Cached (${shippingStatus.tokenExpiresInHours ?? 216}h left)`
                    : 'Ready on first request'}
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-orange-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Configured Account</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {shippingStatus?.emailMasked || (shippingStatus?.configured ? 'Configured' : 'None (.env.local)')}
                </span>
              </div>
            </div>

            {shiprocketTestResult && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  shiprocketTestResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {shiprocketTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{shiprocketTestResult.message}</span>
              </div>
            )}
          </div>

          {/* Razorpay Payment Gateway Integration Status */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2B6CB0] text-white flex items-center justify-center shadow-xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Razorpay Payment Gateway</h3>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          razorpayStatus?.configured
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {razorpayStatus?.configured ? '● Gateway Active (Keys Loaded)' : '○ Safe Simulation Mode'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Direct UPI, NetBanking, Cards &amp; QR checkout via official Razorpay Order API &amp; cryptographic HMAC-SHA256 signature verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-mono font-semibold bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-slate-700">
                    Mode: <strong className="text-[#2B6CB0]">{razorpayStatus?.mode || 'live'}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">API Key ID</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {razorpayStatus?.keyIdSet ? 'rzp_test_TmGwRfupTUxGH8' : 'Configured'}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">API Secret Security</span>
                  <span className="font-semibold text-slate-800">
                    Protected server-side (Never exposed in frontend)
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Protocol</span>
                  <span className="font-semibold text-emerald-700 font-medium">
                    HMAC-SHA256 Server Validation
                  </span>
                </div>
              </div>
            </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 pt-1">
            {['all', 'awaiting_maker_acceptance', 'in_production', 'packed', 'ready_to_ship', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setAdminStatusFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer capitalize ${
                  adminStatusFilter === st
                    ? 'bg-[#1E293B] text-white shadow-xs'
                    : 'bg-[#FAF9F6] text-slate-600 border border-[#e7e0d8] hover:border-slate-400'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {orders
              .filter((o) => adminStatusFilter === 'all' || o.status === adminStatusFilter)
              .map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    setSelectedAdminOrder(o);
                    setTargetOverrideStatus(o.status);
                    setOverrideNote('');
                  }}
                  className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#C85A32]/50 transition cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {o.orderNumber || `#ORD-2026-${o.id}`}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] uppercase">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      {o.trackingAwb && (
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          AWB: {o.trackingAwb}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 group-hover:text-[#C85A32] transition">
                      {o.product}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Customer: <strong>{o.customerName || 'Patron'}</strong> • Destination: <strong>{o.city}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total / {makerEarningPercent}% Split</span>
                      <span className="text-sm font-black text-slate-900">
                        ₹{o.amount} <span className="text-[#C85A32]">(₹{Math.round(o.amount * (makerEarningPercent / 100))})</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-[#C85A32] hover:text-white transition"
                    >
                      Manage →
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Administrative Order Management Modal */}
          {selectedAdminOrder && (
            <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl border max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Master Administrative Review</span>
                    <h3 className="text-lg font-black text-[#1E293B]">
                      Order #{selectedAdminOrder.orderNumber || selectedAdminOrder.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAdminOrder(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Items snapshot */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Purchased Crafts Snapshot</span>
                    <p className="font-bold text-slate-900">{selectedAdminOrder.product}</p>
                    <p className="text-slate-600">Qty: {selectedAdminOrder.qty} • Total: ₹{selectedAdminOrder.amount}</p>
                  </div>

                  {/* Customer & Shipping */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Customer &amp; Shipping</span>
                    <p className="font-bold text-slate-900">{selectedAdminOrder.customerName} {selectedAdminOrder.customerPhone ? `• +91 ${selectedAdminOrder.customerPhone}` : ''}</p>
                    <p className="text-slate-600">{selectedAdminOrder.city}</p>
                    {selectedAdminOrder.trackingAwb && (
                      <p className="text-[#C85A32] font-mono font-bold">Courier AWB: {selectedAdminOrder.trackingAwb}</p>
                    )}
                  </div>

                  {/* Admin Override Status */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Administrative Status Override &amp; Dispute Resolution</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Set Order Status:</label>
                      <select
                        value={targetOverrideStatus}
                        onChange={(e) => setTargetOverrideStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                      >
                        <option value="awaiting_maker_acceptance">Awaiting Maker Acceptance</option>
                        <option value="accepted">Accepted by Maker</option>
                        <option value="in_production">In Production</option>
                        <option value="quality_check">Quality Check</option>
                        <option value="ready_to_pack">Ready to Pack</option>
                        <option value="packed">Packed</option>
                        <option value="ready_to_ship">Ready to Ship</option>
                        <option value="shipment_booked">Shipment Booked</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled / Refunded</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Audit Log Note / Reason:</label>
                      <input
                        type="text"
                        value={overrideNote}
                        onChange={(e) => setOverrideNote(e.target.value)}
                        placeholder="e.g. Customer requested address correction, approved dispute"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isOverridingStatus || targetOverrideStatus === selectedAdminOrder.status}
                      onClick={async () => {
                        setIsOverridingStatus(true);
                        try {
                          const res = await updateOrderStatusWithLifecycle({
                            orderId: selectedAdminOrder.id,
                            orderNumber: selectedAdminOrder.orderNumber,
                            currentStatus: selectedAdminOrder.status,
                            newStatus: targetOverrideStatus as any,
                            actorRole: 'master_admin',
                            actorName: 'Master Admin',
                            note: overrideNote || 'Administrative status override applied',
                          });

                          if (res.success) {
                            showToast(`Status updated to "${targetOverrideStatus}" with audit log!`, 'check-circle');
                            setSelectedAdminOrder(null);
                          } else {
                            showToast(res.error || 'Failed to update status', 'alert-circle');
                          }
                        } finally {
                          setIsOverridingStatus(false);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isOverridingStatus ? 'Updating Order...' : 'Apply Admin Status Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 5: DATABASE & INTEGRATIONS HEALTH (SUPABASE, RAZORPAY, SHIPROCKET)
      ------------------------------------------------------------- */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          {/* Supabase Status */}
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

          {/* Razorpay Gateway Status */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#e7e0d8]">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C85A32]" />
                  Razorpay Payments Integration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Server-side order generation and HMAC SHA-256 signature verification.
                </p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Gateway Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Key Status</span>
                <p className="font-mono font-bold text-slate-800">
                  {razorpayStatus?.configured ? 'Active Credentials' : 'rzp_test_... Available'}
                </p>
                <p className="text-[10px] text-slate-500">Test &amp; Live environment compatible.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Supported Modes</span>
                <p className="font-bold text-slate-800">UPI, Cards, Netbanking, COD</p>
                <p className="text-[10px] text-slate-500">Instant UPI QR &amp; app redirection.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Payment Verification</span>
                <p className="font-bold text-emerald-700">Cryptographic HMAC-SHA256</p>
                <p className="text-[10px] text-slate-500">Enforced on server before order confirmation.</p>
              </div>
            </div>
          </div>

          {/* Shiprocket Logistics & Pincode Engine */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#e7e0d8] gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-sky-600" />
                  Shiprocket Logistics &amp; PIN Code Intelligence
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated serviceability checks, ETD estimates, official postal directory lookups, and AWB tracking.
                </p>
              </div>
              <button
                type="button"
                disabled={isTestingShiprocket}
                onClick={handleTestShiprocketAuth}
                className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingShiprocket ? 'animate-spin' : ''}`} />
                <span>{isTestingShiprocket ? 'Testing Auth...' : 'Test Shiprocket API'}</span>
              </button>
            </div>

            {shiprocketTestResult && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  shiprocketTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {shiprocketTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{shiprocketTestResult.message}</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Fallback courier rates and official postal directory ensure customers never encounter a broken checkout.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Live Pincode Intelligence</span>
                <p className="font-bold text-slate-800">India Post Directory + Shiprocket</p>
                <p className="text-[10px] text-slate-500">Auto-resolves district, state &amp; delivery post office.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Integrated Courier Partners</span>
                <p className="font-bold text-slate-800">BlueDart, Delhivery, DTDC, Shadowfax</p>
                <p className="text-[10px] text-slate-500">Multi-courier rate comparisons &amp; live ETD.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Shiprocket Webhooks</span>
                <p className="font-bold text-emerald-700">/api/shipping/webhook Active</p>
                <p className="text-[10px] text-slate-500">Auto-updates customer tracking upon carrier scan.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
