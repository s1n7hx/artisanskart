import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Order, OrderStatus, maskEmail } from '../types';
import { MultiImageUploader } from '../components/MultiImageUploader';
import { updateOrderStatusWithLifecycle } from '../services/ecommerce';

export const MakerPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    products,
    currentUser,
    userRole,
    userStatus,
    showToast,
    setIsAuthModalOpen,
    makerEarningPercent,
    refreshOrders,
  } = useApp();



  const [orderFilterTab, setOrderFilterTab] = useState<'all' | 'awaiting' | 'production' | 'completed'>('all');

  // Filter orders assigned to this maker, awaiting studio acceptance, or all studio orders
  const makerOrders = useMemo(() => {
    const currentName = (currentUser?.name || '').trim().toLowerCase();
    const currentId = currentUser?.id;
    const isPlatformAdmin = userRole === 'admin' || userRole === 'master_admin';

    if (isPlatformAdmin) {
      return orders;
    }

    return orders.filter((o) => {
      // 1. Any order awaiting acceptance is open for any artisan in the collective to claim
      if (
        o.status === 'awaiting_maker_acceptance' ||
        o.status === 'new' ||
        o.status === 'order_placed'
      ) {
        return true;
      }
      // 2. Orders accepted by or crafted by this maker
      if (currentId && o.makerId === currentId) return true;
      if (currentName && o.makerName?.toLowerCase().includes(currentName)) return true;
      if (o.items && Array.isArray(o.items)) {
        if (
          o.items.some(
            (i) =>
              (currentId && i.makerId === currentId) ||
              (currentName && i.makerName?.toLowerCase().includes(currentName))
          )
        ) {
          return true;
        }
      }
      // 3. Collective Studio: Allow verified makers to view studio workflow
      return true;
    });
  }, [orders, currentUser, userRole]);

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

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const completed = makerOrders.filter((o) => o.status === 'completed' || o.status === 'delivered');
  const activeOrders = makerOrders.filter((o) => o.status !== 'completed' && o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'maker_rejected');
  const awaitingAcceptance = makerOrders.filter((o) => o.status === 'awaiting_maker_acceptance' || o.status === 'new' || o.status === 'order_placed');
  const totalEarnings = completed.reduce((s, o) => s + o.amount * (makerEarningPercent / 100), 0);
  const pendingEarnings = activeOrders.reduce((s, o) => s + o.amount * (makerEarningPercent / 100), 0);

  const displayedOrders = useMemo(() => {
    if (orderFilterTab === 'awaiting') {
      return awaitingAcceptance;
    }
    if (orderFilterTab === 'production') {
      return activeOrders.filter((o) => o.status !== 'awaiting_maker_acceptance' && o.status !== 'new' && o.status !== 'order_placed');
    }
    if (orderFilterTab === 'completed') {
      return completed;
    }
    return makerOrders;
  }, [makerOrders, orderFilterTab, awaitingAcceptance, activeOrders, completed]);

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
        actorName: currentUser?.name || 'Independent Maker',
        note: note || `Artisan moved order to ${newStatus}`,
        ...extra,
      });

      if (res.success) {
        showToast(`Order #${order.orderNumber || order.id} moved to "${getStatusBadge(newStatus).label}"!`, 'check-circle');
        setActionModalType(null);
        setSelectedOrderForAction(null);
        refreshOrders().catch(() => {});
      } else {
        showToast(res.error || 'Status transition not permitted.', 'alert-circle');
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed.', 'alert-circle');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e7e0d8] pb-6">
        <div>
          <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-block mb-1">
            Independent Creator Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            Artisan Production &amp; Order Dashboard
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage your handmade creations, accept customer orders, and track Shiprocket courier logistics.
          </p>
        </div>


      </div>

      {/* Platform Role Security Policy Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase tracking-wide text-amber-950">Administrative Catalog Control Policy</span>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            Product listings, pricing, and photography are exclusively managed by platform administrators. Approved makers have dedicated authority to view and accept customer orders, adjust preparation timelines, and dispatch handcrafted parcels.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#e7e0d8] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Verified Creator Earnings</span>
            <Wallet className="w-4 h-4 text-[#C85A32]" />
          </div>
          <div className="text-2xl font-black text-[#1E293B]">{formatINR(totalEarnings)}</div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {makerEarningPercent}% direct creator share on delivered orders
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
            <span>Completed Orders</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completed.length} Delivered</div>
          <p className="text-[11px] text-slate-500">
            Successfully fulfilled by your artisan studio
          </p>
        </div>
      </div>

      {/* TAB 1: 13-STAGE ORDER LIFECYCLE WORKFLOW */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#1E293B]">
                Handcrafted Order Lifecycle ({makerOrders.length})
              </h2>
              <span className="text-xs text-slate-500">
                Manage incoming patron orders, accept preparation timelines, and dispatch parcels with courier.
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOrderFilterTab('all')}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition ${
                  orderFilterTab === 'all'
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-white border border-[#e7e0d8] text-slate-600 hover:bg-[#FAF9F6]'
                }`}
              >
                All ({makerOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilterTab('awaiting')}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition ${
                  orderFilterTab === 'awaiting'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-50'
                }`}
              >
                Awaiting Acceptance ({awaitingAcceptance.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilterTab('production')}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition ${
                  orderFilterTab === 'production'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-50'
                }`}
              >
                In Production ({Math.max(0, activeOrders.length - awaitingAcceptance.length)})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilterTab('completed')}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition ${
                  orderFilterTab === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                Delivered ({completed.length})
              </button>
            </div>
          </div>

          {displayedOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#e7e0d8] space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {orderFilterTab === 'awaiting'
                  ? 'No Orders Awaiting Acceptance'
                  : orderFilterTab === 'production'
                  ? 'No Orders in Production'
                  : orderFilterTab === 'completed'
                  ? 'No Delivered Orders Yet'
                  : 'No Orders in Studio'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {orderFilterTab === 'awaiting'
                  ? 'As soon as patrons place new orders on ArtisansKart, they appear here instantly for studio acceptance.'
                  : 'Check the other filters or wait for incoming patron requests.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {displayedOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const isAwaitingAcceptance =
                  order.status === 'awaiting_maker_acceptance' ||
                  order.status === 'new' ||
                  order.status === 'order_placed';
                const isAccepted = order.status === 'accepted';
                const isInProduction = order.status === 'in_production';
                const isQualityCheck = order.status === 'quality_check';
                const isReadyToPack = order.status === 'ready_to_pack' || order.status === 'ready';
                const isPacked = order.status === 'packed';
                const isReadyToShip = order.status === 'ready_to_ship';
                const isInTransit =
                  order.status === 'shipment_booked' ||
                  order.status === 'picked_up' ||
                  order.status === 'in_transit';
                const isOutForDelivery = order.status === 'out_for_delivery';
                const isDelivered = order.status === 'delivered' || order.status === 'completed';

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

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>
                          Placed on{' '}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                        <Link
                          to={`/track/${order.orderNumber || order.id}`}
                          target="_blank"
                          className="text-[#C85A32] hover:underline font-bold inline-flex items-center gap-1"
                        >
                          Track Live <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                      {/* Products */}
                      <div className="sm:col-span-5 space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Craft Pieces</span>
                        <p className="font-bold text-slate-900 text-sm leading-snug">{order.product}</p>
                        <p className="text-slate-500">
                          Qty: {order.qty} items • Total: {formatINR(order.amount)}
                        </p>
                        <p className="text-[#C85A32] font-semibold">
                          Your Studio Share: {formatINR(order.amount * (makerEarningPercent / 100))}
                        </p>
                      </div>

                      {/* Customer Destination */}
                      <div className="sm:col-span-4 space-y-1">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Patron &amp; Destination</span>
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-slate-500 truncate">{order.city}</p>
                        <p className="text-slate-400">
                          Carrier: {order.courierName || 'NimbusPost Express Partner'}
                        </p>
                        {order.trackingAwb && (
                          <p className="font-mono text-[11px] text-[#C85A32]">
                            AWB: {order.trackingAwb}
                          </p>
                        )}
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
                              className="w-full py-2.5 px-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
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

                        {isAccepted && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTransitionStatus(
                                order,
                                'in_production',
                                'Artisan commenced handcrafted studio crafting',
                                { makerId: currentUser?.id, makerName: currentUser?.name }
                              )
                            }
                            className="w-full py-2.5 px-3 rounded-xl bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Hammer className="w-3.5 h-3.5" /> Start Crafting
                          </button>
                        )}

                        {isInProduction && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTransitionStatus(order, 'quality_check', 'Craft completed, moving to inspection')
                            }
                            className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Inspection Ready
                          </button>
                        )}

                        {isQualityCheck && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTransitionStatus(
                                order,
                                'ready_to_pack',
                                'Quality check passed, ready for parcel packaging'
                              )
                            }
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
                            onClick={() =>
                              handleTransitionStatus(
                                order,
                                'in_transit',
                                'Parcel dispatched with NimbusPost partner carrier',
                                { courierName: 'NimbusPost Express Partner' }
                              )
                            }
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" /> Dispatch Courier
                          </button>
                        )}

                        {isInTransit && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTransitionStatus(
                                order,
                                'out_for_delivery',
                                'Courier out for delivery to customer destination'
                              )
                            }
                            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" /> Out for Delivery
                          </button>
                        )}

                        {isOutForDelivery && (
                          <button
                            type="button"
                            onClick={() =>
                              handleTransitionStatus(
                                order,
                                'delivered',
                                'Parcel delivered safely to customer patron'
                              )
                            }
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                          </button>
                        )}

                        {isDelivered && (
                          <div className="text-center py-1 px-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            Completed &amp; Settled
                          </div>
                        )}

                        {/* Status history audit trail trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForAction(order);
                            setActionModalType('history');
                          }}
                          className="text-[11px] text-slate-500 hover:text-[#C85A32] font-semibold text-center cursor-pointer pt-1"
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

    </div>
  );
};
