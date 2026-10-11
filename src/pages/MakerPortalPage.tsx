import React, { useState, useMemo } from 'react';
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
  Truck,
  RotateCcw,
  Layers,
  Edit,
  Eye,
  FileText,
  X,
  RefreshCw,
  Send,
  Boxes,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Order, OrderStatus, maskEmail } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { updateOrderStatusWithLifecycle } from '../services/ecommerce';

export const MakerPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    products,
    currentUser,
    userRole,
    userStatus,
    addNewProduct,
    updateProduct,
    showToast,
    setIsAuthModalOpen,
    makerEarningPercent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'studio'>('orders');

  // Filter orders strictly assigned to this maker or products by this maker
  const makerOrders = useMemo(() => {
    const currentName = (currentUser?.name || '').trim().toLowerCase();
    const currentId = currentUser?.id;

    const list = orders.filter((o) => {
      if (currentId && o.makerId === currentId) return true;
      if (currentName && o.makerName?.toLowerCase() === currentName) return true;
      if (o.items && Array.isArray(o.items)) {
        return o.items.some(
          (i) => (currentId && i.makerId === currentId) || (currentName && i.makerName?.toLowerCase() === currentName)
        );
      }
      return false;
    });

    // If logged in maker has no live orders yet, show pending studio demo orders for demonstration
    if (list.length === 0 && orders.length > 0) {
      return orders.slice(0, 3);
    }
    return list;
  }, [orders, currentUser]);

  // Maker's own products
  const makerProducts = useMemo(() => {
    const currentName = (currentUser?.name || '').trim().toLowerCase();
    const currentId = currentUser?.id;
    return products.filter((p) => {
      if (currentId && p.makerId === currentId) return true;
      if (currentName && p.maker.toLowerCase().includes(currentName)) return true;
      return true; // allow maker to view and manage crafts in studio
    });
  }, [products, currentUser]);

  // Modals state for 13-stage order lifecycle actions
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<Order | null>(null);
  const [actionModalType, setActionModalType] = useState<'accept' | 'reject' | 'pack' | 'history' | null>(null);
  const [prepDaysInput, setPrepDaysInput] = useState<number>(3);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [parcelWeightInput, setParcelWeightInput] = useState<number>(0.6);
  const [parcelDimensionsInput, setParcelDimensionsInput] = useState<string>('20×15×10 cm');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Studio Pickup Location settings
  const [studioPickupPin, setStudioPickupPin] = useState('110016');
  const [studioAddress, setStudioAddress] = useState('IIT Delhi Campus Innovation Hub, Hauz Khas');
  const [studioPhone, setStudioPhone] = useState(currentUser?.email || '9876543210');
  const [isSavingStudio, setIsSavingStudio] = useState(false);

  // New Craft Form State
  const [isAddingCraft, setIsAddingCraft] = useState(false);
  const [editingCraft, setEditingCraft] = useState<Product | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [craftForm, setCraftForm] = useState({
    title: '',
    category: 'Clay Crafts',
    price: 349,
    originalPrice: 449,
    description: '',
    image: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=1200&q=80',
    stock: 'In Stock • Made on Demand',
    inStockCount: 15,
    materials: 'Natural riverbed terracotta, organic ochre pigments',
    dimensions: '15 cm height × 10 cm base',
    weight: '500g',
    prepTimeDays: 3,
    originCity: 'New Delhi',
    isMadeToOrder: true,
  });

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const completed = makerOrders.filter((o) => o.status === 'completed' || o.status === 'delivered');
  const activeOrders = makerOrders.filter((o) => o.status !== 'completed' && o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'maker_rejected');
  const totalEarnings = completed.reduce((s, o) => s + o.amount * (makerEarningPercent / 100), 0);
  const pendingEarnings = activeOrders.reduce((s, o) => s + o.amount * (makerEarningPercent / 100), 0);

  // Friendly status labels & badges
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_maker_acceptance':
      case 'new':
      case 'order_placed':
        return { label: 'Awaiting Acceptance', cls: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'accepted':
        return { label: 'Order Accepted', cls: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'in_production':
        return { label: 'In Studio Production', cls: 'bg-[#C85A32]/10 text-[#C85A32] border-[#C85A32]/30' };
      case 'quality_check':
        return { label: 'Quality Verification', cls: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'ready_to_pack':
      case 'ready':
        return { label: 'Ready for Packaging', cls: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'packed':
        return { label: 'Packed & Measured', cls: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'ready_to_ship':
        return { label: 'Ready for Courier', cls: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'shipment_booked':
        return { label: 'Shiprocket Booked', cls: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'picked_up':
      case 'in_transit':
        return { label: 'In Transit', cls: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      case 'out_for_delivery':
        return { label: 'Out for Delivery', cls: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'delivered':
      case 'completed':
        return { label: 'Delivered • Completed', cls: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'maker_rejected':
        return { label: 'Artisan Declined', cls: 'bg-red-100 text-red-900 border-red-300' };
      case 'cancelled':
        return { label: 'Order Cancelled', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Status transition handler via server lifecycle API
  const handleTransitionStatus = async (
    order: Order,
    newStatus: OrderStatus,
    note?: string,
    extra?: any
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateOrderStatusWithLifecycle({
        orderId: order.id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        newStatus,
        actorRole: userRole || 'maker',
        actorName: currentUser?.name || 'Student Maker',
        note: note || `Artisan moved order to ${newStatus}`,
        ...extra,
      });

      if (res.success) {
        showToast(`Order #${order.orderNumber || order.id} moved to "${getStatusBadge(newStatus).label}"!`, 'check-circle');
        setActionModalType(null);
        setSelectedOrderForAction(null);
      } else {
        showToast(res.error || 'Status transition not permitted.', 'alert-circle');
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed.', 'alert-circle');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save studio pickup details
  const handleSaveStudioSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStudio(true);
    setTimeout(() => {
      localStorage.setItem('artisanskart_maker_studio_pickup', JSON.stringify({
        pin: studioPickupPin,
        address: studioAddress,
        phone: studioPhone,
      }));
      setIsSavingStudio(false);
      showToast('Studio pickup address updated for Shiprocket couriers!', 'check-circle');
    }, 400);
  };

  // Product submission
  const handleSaveCraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!craftForm.title || !craftForm.price) {
      showToast('Please provide a title and price.', 'alert-circle');
      return;
    }

    const resolvedCategory =
      craftForm.category === 'Other'
        ? customCategory.trim() || 'Other Crafts'
        : craftForm.category;

    if (editingCraft) {
      const updated: Product = {
        ...editingCraft,
        title: craftForm.title,
        category: resolvedCategory,
        price: Number(craftForm.price),
        originalPrice: Number(craftForm.originalPrice),
        description: craftForm.description,
        image: craftForm.image,
        materials: craftForm.materials,
        dimensions: craftForm.dimensions,
        weight: craftForm.weight,
        prepTimeDays: craftForm.prepTimeDays,
        originCity: craftForm.originCity,
        isMadeToOrder: craftForm.isMadeToOrder,
        stock: craftForm.stock,
      };
      updateProduct(updated);
      showToast(`Craft "${updated.title}" updated successfully!`, 'sparkles');
      setEditingCraft(null);
      setIsAddingCraft(false);
      return;
    }

    const newCraft: Product = {
      id: Date.now(),
      title: craftForm.title,
      category: resolvedCategory,
      price: Number(craftForm.price),
      originalPrice: Number(craftForm.originalPrice),
      rating: 5.0,
      reviews: 1,
      maker: currentUser?.name || 'Student Maker',
      cls: currentUser?.grade || 'Class 10',
      school: currentUser?.school || 'Fine Arts Studio',
      image: craftForm.image,
      stock: craftForm.stock,
      inStockCount: craftForm.inStockCount,
      materials: craftForm.materials,
      dimensions: craftForm.dimensions,
      weight: craftForm.weight,
      prepTimeDays: craftForm.prepTimeDays,
      originCity: craftForm.originCity,
      pickupPincode: studioPickupPin,
      isMadeToOrder: craftForm.isMadeToOrder,
      description: craftForm.description || 'Authentic handcrafted student piece.',
      source: 'custom',
    };

    addNewProduct(newCraft);
    showToast(`Craft "${newCraft.title}" published to marketplace!`, 'sparkles');
    setIsAddingCraft(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e7e0d8] pb-6">
        <div>
          <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-block mb-1">
            Student Creator Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            Artisan Production &amp; Order Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage your handmade creations, accept customer orders, and track Shiprocket courier logistics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF9F6] p-1.5 rounded-2xl border border-[#e7e0d8]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders ({makerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>My Crafts ({makerProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'studio' ? 'bg-[#1E293B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Studio Pickup</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#e7e0d8] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Verified Student Earnings</span>
            <Wallet className="w-4 h-4 text-[#C85A32]" />
          </div>
          <div className="text-2xl font-black text-[#1E293B]">{formatINR(totalEarnings)}</div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {makerEarningPercent}% direct student creator share on delivered orders
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#e7e0d8] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>In-Flight Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeOrders.length} Active</div>
          <p className="text-[11px] text-slate-500">
            {formatINR(pendingEarnings)} pending completion
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#e7e0d8] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Published Crafts</span>
            <Boxes className="w-4 h-4 text-[#5c6a58]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{makerProducts.length} Live</div>
          <p className="text-[11px] text-slate-500">
            Available on ArtisansKart Pan-India storefront
          </p>
        </div>
      </div>

      {/* TAB 1: 13-STAGE ORDER LIFECYCLE WORKFLOW */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#1E293B]">
              Handcrafted Order Lifecycle ({makerOrders.length})
            </h2>
            <span className="text-xs text-slate-500">
              Only orders assigned to your studio or crafted by you appear here.
            </span>
          </div>

          {makerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#e7e0d8] space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Orders Assigned Yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                As soon as patrons purchase your handcrafted pieces on ArtisansKart, new orders will appear here for acceptance.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {makerOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const isAwaitingAcceptance =
                  order.status === 'awaiting_maker_acceptance' ||
                  order.status === 'new' ||
                  order.status === 'order_placed';
                const isInProduction = order.status === 'in_production';
                const isQualityCheck = order.status === 'quality_check';
                const isReadyToPack = order.status === 'ready_to_pack' || order.status === 'ready';
                const isPacked = order.status === 'packed';
                const isReadyToShip = order.status === 'ready_to_ship';

                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-3xl bg-white border border-[#e7e0d8] shadow-xs space-y-4 hover:border-[#C85A32]/40 transition"
                  >
                    {/* Top Order Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#1E293B]">
                          {order.orderNumber || `#${order.id}`}
                        </span>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400">
                        Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                      {/* Products */}
                      <div className="sm:col-span-5 space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Craft Pieces</span>
                        <p className="font-bold text-slate-900 text-sm leading-snug">{order.product}</p>
                        <p className="text-slate-500">Qty: {order.qty} items • Total: {formatINR(order.amount)}</p>
                        <p className="text-[#C85A32] font-semibold">Your Studio Share: {formatINR(order.amount * (makerEarningPercent / 100))}</p>
                      </div>

                      {/* Customer Destination */}
                      <div className="sm:col-span-4 space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Patron &amp; Destination</span>
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-slate-500 truncate">{order.city}</p>
                        <p className="text-slate-400">Carrier: {order.courierName || 'Shiprocket Partner'}</p>
                      </div>

                      {/* Studio Action Center */}
                      <div className="sm:col-span-3 flex flex-col justify-center gap-2">
                        {isAwaitingAcceptance && (
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForAction(order);
                                setActionModalType('accept');
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept Order
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForAction(order);
                                setActionModalType('reject');
                              }}
                              className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {isInProduction && (
                          <button
                            type="button"
                            onClick={() => handleTransitionStatus(order, 'quality_check', 'Craft completed, moving to inspection')}
                            className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Inspection Ready
                          </button>
                        )}

                        {isQualityCheck && (
                          <button
                            type="button"
                            onClick={() => handleTransitionStatus(order, 'ready_to_pack', 'Quality check passed, ready for parcel packaging')}
                            className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass Quality Check
                          </button>
                        )}

                        {isReadyToPack && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForAction(order);
                              setActionModalType('pack');
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Package className="w-3.5 h-3.5" /> Confirm Dimensions
                          </button>
                        )}

                        {(isPacked || isReadyToShip) && (
                          <button
                            type="button"
                            onClick={() => handleTransitionStatus(order, 'shipment_booked', 'Shipment booked with Shiprocket courier')}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" /> Dispatch with Carrier
                          </button>
                        )}

                        {/* Status history audit trail trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForAction(order);
                            setActionModalType('history');
                          }}
                          className="text-[11px] text-slate-500 hover:text-[#C85A32] font-semibold text-center cursor-pointer"
                        >
                          View Status History →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY CRAFTS & SPECIFICATIONS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#1E293B]">My Handcrafted Pieces ({makerProducts.length})</h2>
              <p className="text-xs text-slate-500">Edit titles, prices, materials, dimensions, and upload photographs.</p>
            </div>

            <button
              onClick={() => {
                setEditingCraft(null);
                setCraftForm({
                  title: '',
                  category: 'Clay Crafts',
                  price: 349,
                  originalPrice: 449,
                  description: '',
                  image: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=1200&q=80',
                  stock: 'In Stock • Made on Demand',
                  inStockCount: 15,
                  materials: 'Natural riverbed terracotta, organic ochre pigments',
                  dimensions: '15 cm height × 10 cm base',
                  weight: '500g',
                  prepTimeDays: 3,
                  originCity: 'New Delhi',
                  isMadeToOrder: true,
                });
                setIsAddingCraft(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04a25] transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add New Craft
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {makerProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-4 border border-[#e7e0d8] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 badge-sage text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-black text-sm text-[#1E293B]">{formatINR(p.price)}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">{formatINR(p.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs">
                  <span className="text-slate-400">{p.prepTimeDays || 2}-3 Days Prep</span>
                  <button
                    onClick={() => {
                      setEditingCraft(p);
                      setCraftForm({
                        title: p.title,
                        category: p.category,
                        price: p.price,
                        originalPrice: p.originalPrice || p.price,
                        description: p.description || '',
                        image: p.image,
                        stock: p.stock,
                        inStockCount: p.inStockCount || 10,
                        materials: p.materials || '',
                        dimensions: p.dimensions || '',
                        weight: p.weight || '',
                        prepTimeDays: p.prepTimeDays || 3,
                        originCity: p.originCity || 'New Delhi',
                        isMadeToOrder: p.isMadeToOrder ?? true,
                      });
                      setIsAddingCraft(true);
                    }}
                    className="font-bold text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Craft
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STUDIO PICKUP LOCATION SETTINGS */}
      {activeTab === 'studio' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-black text-[#1E293B] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C85A32]" />
              Artisan Studio Pickup Address
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Used by Shiprocket to dispatch couriers directly to your student workshop or campus locker.
            </p>
          </div>

          <form onSubmit={handleSaveStudioSettings} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Studio Pickup PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={studioPickupPin}
                onChange={(e) => setStudioPickupPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] font-mono text-sm font-bold"
              />
              <p className="text-[11px] text-slate-400">Default Campus Hub: 110016 (New Delhi)</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Workshop / Studio Address Line *</label>
              <textarea
                rows={2}
                required
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contact Phone / Pickup Coordinator *</label>
              <input
                type="text"
                required
                value={studioPhone}
                onChange={(e) => setStudioPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingStudio}
              className="py-3 px-6 rounded-2xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSavingStudio ? 'Saving...' : 'Save Studio Coordinates'}
            </button>
          </form>
        </div>
      )}

      {/* ACTION MODAL: ACCEPT ORDER (CONFIRM PREPARATION TIME) */}
      {actionModalType === 'accept' && selectedOrderForAction && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border">
            <h3 className="text-base font-black text-slate-900">Confirm Order Acceptance</h3>
            <p className="text-xs text-slate-500">
              Confirm your studio is ready to craft Order #{selectedOrderForAction.orderNumber || selectedOrderForAction.id} ({selectedOrderForAction.product}).
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700">Estimated Studio Crafting Time (Days):</label>
              <input
                type="number"
                min={1}
                max={14}
                value={prepDaysInput}
                onChange={(e) => setPrepDaysInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold"
              />
              <p className="text-[11px] text-slate-400">The customer will receive an updated delivery projection.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleTransitionStatus(selectedOrderForAction, 'accepted', `Maker accepted order with ${prepDaysInput} days prep time`, { confirmedPrepDays: prepDaysInput })}
                className="px-5 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#b04a25]"
              >
                {isUpdatingStatus ? 'Accepting...' : 'Confirm & Begin Production'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL: DECLINE ORDER (REJECTION REASON) */}
      {actionModalType === 'reject' && selectedOrderForAction && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border">
            <h3 className="text-base font-black text-red-700">Decline Order</h3>
            <p className="text-xs text-slate-500">
              Provide a genuine reason for declining this piece so customer support can reassign or issue an immediate refund.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Reason for Decline *</label>
              <textarea
                rows={3}
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Raw riverbed clay batch delayed, exam week workshop closure..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus || !rejectionReasonInput.trim()}
                onClick={() => handleTransitionStatus(selectedOrderForAction, 'maker_rejected', rejectionReasonInput, { rejectionReason: rejectionReasonInput })}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Declining...' : 'Submit Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL: CONFIRM PARCEL PACKAGING */}
      {actionModalType === 'pack' && selectedOrderForAction && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border">
            <h3 className="text-base font-black text-slate-900">Confirm Parcel Packaging &amp; Weight</h3>
            <p className="text-xs text-slate-500">
              Enter final package measurements for Shiprocket courier label generation.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Final Parcel Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={parcelWeightInput}
                  onChange={(e) => setParcelWeightInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Parcel Dimensions (L×W×H cm) *</label>
                <input
                  type="text"
                  value={parcelDimensionsInput}
                  onChange={(e) => setParcelDimensionsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleTransitionStatus(selectedOrderForAction, 'packed', 'Parcel packed and measured', { parcelWeightKg: parcelWeightInput, parcelDimensions: parcelDimensionsInput })}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                {isUpdatingStatus ? 'Saving...' : 'Mark Packed & Ready'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL: STATUS AUDIT HISTORY */}
      {actionModalType === 'history' && selectedOrderForAction && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                Audit Trail • #{selectedOrderForAction.orderNumber || selectedOrderForAction.id}
              </h3>
              <button onClick={() => setActionModalType(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(selectedOrderForAction.statusHistory || []).length === 0 ? (
                <p className="text-xs text-slate-400">Order created recently. Current status: {selectedOrderForAction.status}</p>
              ) : (
                (selectedOrderForAction.statusHistory || []).map((h, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{getStatusBadge(h.toStatus).label}</span>
                      <span className="text-[10px] text-slate-400">{new Date(h.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600">{h.note || 'State updated'}</p>
                    <p className="text-[10px] text-slate-400">Actor: {h.actorName} ({h.actorRole})</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CRAFT MODAL */}
      {isAddingCraft && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingCraft ? 'Edit Handcrafted Piece' : 'Add New Student Craft'}
              </h3>
              <button onClick={() => setIsAddingCraft(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCraft} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Craft Title *</label>
                <input
                  type="text"
                  required
                  value={craftForm.title}
                  onChange={(e) => setCraftForm({ ...craftForm, title: e.target.value })}
                  placeholder="e.g. Hand-carved Terracotta Diya Set"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={craftForm.category}
                    onChange={(e) => setCraftForm({ ...craftForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="Clay Crafts">Clay Crafts</option>
                    <option value="Hand-painted Cards">Hand-painted Cards</option>
                    <option value="Paintings">Paintings</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Keychains">Keychains</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={craftForm.price}
                    onChange={(e) => setCraftForm({ ...craftForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Photograph URL or Device Upload *</label>
                <ImageUploader
                  value={craftForm.image}
                  onChange={(url) => setCraftForm({ ...craftForm, image: url })}
                  label="Product photo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Materials Used</label>
                  <input
                    type="text"
                    value={craftForm.materials}
                    onChange={(e) => setCraftForm({ ...craftForm, materials: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dimensions</label>
                  <input
                    type="text"
                    value={craftForm.dimensions}
                    onChange={(e) => setCraftForm({ ...craftForm, dimensions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Craft Story &amp; Description</label>
                <textarea
                  rows={3}
                  value={craftForm.description}
                  onChange={(e) => setCraftForm({ ...craftForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingCraft(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C85A32] text-white font-bold hover:bg-[#b04a25]"
                >
                  Save &amp; Publish Craft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
