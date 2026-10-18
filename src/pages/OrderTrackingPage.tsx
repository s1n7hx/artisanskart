import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Search,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  CreditCard,
  ExternalLink,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { Order } from '../types';
import { OrderTimeline } from '../components/OrderTimeline';
import { getStoredOrders } from '../services/ecommerce';
import { supabase } from '../services/supabase';
import { useApp } from '../context/AppContext';

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [searchInput, setSearchInput] = useState(paramOrderNumber || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const loadOrder = async (queryRef: string) => {
    const cleanRef = queryRef.trim();
    if (!cleanRef) return;

    setIsLoading(true);
    setErrorMessage('');

    let localMatch: Order | undefined;

    try {
      // 1. Check local storage first for instant feedback
      const localOrders = getStoredOrders();
      localMatch = localOrders.find(
        (o) => o.orderNumber?.toLowerCase() === cleanRef.toLowerCase() || String(o.id) === cleanRef
      );

      // 2. Fetch from Supabase
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .or(`order_number.ilike.${cleanRef},tracking_awb.ilike.${cleanRef}`);

      if (dbOrders && dbOrders.length > 0) {
        const d = dbOrders[0];
        const mappedItems = Array.isArray(d.order_items)
          ? d.order_items.map((i: any) => ({
              productId: i.product_id,
              title: i.title,
              imageUrl: i.image_url,
              unitPrice: Number(i.unit_price),
              quantity: i.quantity,
              subtotal: Number(i.subtotal),
              makerName: i.maker_name,
              makerId: i.maker_id,
              productionStatus: i.production_status,
            }))
          : localMatch?.items || [];

        const mapped: Order = {
          id: d.id,
          orderNumber: d.order_number,
          city: d.shipping_address ? `${d.shipping_address.city || ''}, ${d.shipping_address.state || ''}` : 'India',
          product: mappedItems.map((i: any) => i.title).join(', ') || 'Handmade Craft',
          qty: mappedItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0),
          deadline: d.estimated_delivery ? new Date(d.estimated_delivery).toLocaleDateString('en-IN') : '3-5 business days',
          status: d.status,
          amount: Number(d.total_amount || d.amount || 0),
          itemsTotal: Number(d.items_total || 0),
          shippingFee: Number(d.shipping_fee || 0),
          discountAmount: Number(d.discount_amount || 0),
          customerName: d.customer_name,
          customerEmail: d.customer_email,
          customerPhone: d.customer_phone,
          shippingAddress: d.shipping_address,
          paymentStatus: d.payment_status,
          paymentMethod: d.payment_method,
          trackingAwb: d.tracking_awb,
          courierName: d.courier_name || 'NimbusPost Express Partner',
          estimatedDelivery: d.estimated_delivery,
          createdAt: d.created_at,
          items: mappedItems,
        };

        setSelectedOrder(mapped);
        return;
      }

      if (localMatch) {
        setSelectedOrder(localMatch);
        return;
      }

      setSelectedOrder(null);
      setErrorMessage(`No order found matching "${cleanRef}". Please verify your Order Reference or Tracking AWB.`);
    } catch (err: any) {
      if (localMatch) {
        setSelectedOrder(localMatch);
      } else {
        setErrorMessage('Unable to look up order. Please check connection and retry.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load order on mount or param change
  useEffect(() => {
    if (paramOrderNumber) {
      setSearchInput(paramOrderNumber);
      loadOrder(paramOrderNumber);
    } else {
      // If user has local stored orders, pick latest
      const local = getStoredOrders();
      if (local.length > 0) {
        setSelectedOrder(local[0]);
      }
    }
  }, [paramOrderNumber]);

  // Load list of user's past orders
  useEffect(() => {
    const local = getStoredOrders();
    setUserOrders(local);

    if (currentUser?.id) {
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            const mappedList: Order[] = data.map((d: any) => ({
              id: d.id,
              orderNumber: d.order_number,
              city: d.shipping_address ? `${d.shipping_address.city || ''}, ${d.shipping_address.state || ''}` : 'India',
              product: d.customer_name ? `Craft order for ${d.customer_name}` : 'Handcrafted item',
              qty: 1,
              deadline: '3-5 days',
              status: d.status,
              amount: Number(d.total_amount),
              itemsTotal: Number(d.items_total || d.total_amount),
              shippingFee: Number(d.shipping_fee || 0),
              discountAmount: Number(d.discount_amount || 0),
              customerName: d.customer_name,
              paymentStatus: d.payment_status,
              paymentMethod: d.payment_method,
              trackingAwb: d.tracking_awb,
              courierName: d.courier_name,
              createdAt: d.created_at,
            }));
            setUserOrders(mappedList);
          }
        });
    }
  }, [currentUser?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track/${encodeURIComponent(searchInput.trim())}`);
      loadOrder(searchInput.trim());
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e7e0d8] pb-6">
        <div>
          <button
            onClick={() => navigate('/marketplace')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#C85A32] transition cursor-pointer mb-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
            Track Order &amp; Delivery Status
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status updates directly from independent creator studios and courier logistics.
          </p>
        </div>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. AK-2026-12345 or AWB"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:border-[#C85A32] bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="px-4 py-2 bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Track</span>
          </button>
        </form>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Order Tracking View */}
      {selectedOrder ? (
        <div className="space-y-6">
          {/* Main Tracking Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Reference</span>
                <p className="text-xl font-black text-[#1E293B] font-mono">{selectedOrder.orderNumber}</p>
                <p className="text-xs text-slate-400">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 uppercase tracking-wider">
                  Payment: {selectedOrder.paymentStatus}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full border bg-[#C85A32]/10 text-[#C85A32] border-[#C85A32]/30 uppercase tracking-wider">
                  Status: {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <OrderTimeline order={selectedOrder} />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Delivery Address */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#C85A32]" />
                  <span>Delivery Address</span>
                </h3>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-xs space-y-1">
                  <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                  {selectedOrder.customerPhone && <p className="text-slate-600">Phone: {selectedOrder.customerPhone}</p>}
                  {selectedOrder.shippingAddress ? (
                    <p className="text-slate-600">
                      {selectedOrder.shippingAddress.buildingHouse}, {selectedOrder.shippingAddress.streetAddress},{' '}
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                  ) : (
                    <p className="text-slate-600">{selectedOrder.city}</p>
                  )}
                </div>
              </div>

              {/* Payment & Charges Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#C85A32]" />
                  <span>Payment Breakdown</span>
                </h3>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Method:</span>
                    <span className="font-bold text-slate-900 uppercase">{selectedOrder.paymentMethod || 'Prepaid'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-slate-800">{formatINR(selectedOrder.itemsTotal || selectedOrder.amount)}</span>
                  </div>
                  {selectedOrder.discountAmount ? (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount Applied:</span>
                      <span>-{formatINR(selectedOrder.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-600">
                    <span>Packaging &amp; Handling:</span>
                    <span className="text-slate-800 font-medium">Included</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                    <span>Total Paid:</span>
                    <span className="text-[#C85A32]">{formatINR(selectedOrder.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#C85A32]" />
                  <span>Ordered Handcrafted Items ({selectedOrder.items.length})</span>
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {it.imageUrl && (
                          <img
                            src={it.imageUrl}
                            alt={it.title}
                            className="w-12 h-12 rounded-xl object-cover border bg-slate-50 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{it.title}</p>
                          <p className="text-slate-500 text-[11px]">Artisan: {it.makerName || 'Studio Creator'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">{formatINR(it.subtotal || it.unitPrice * it.quantity)}</p>
                        <p className="text-slate-400 text-[11px]">Qty: {it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-[#e7e0d8] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#C85A32] flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Enter Your Order Reference to Track</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You can find your order reference (e.g. <code>AK-2026-12345</code>) or courier AWB number in your checkout confirmation or SMS receipt.
          </p>
        </div>
      )}

      {/* User's Previous Orders (if any) */}
      {userOrders.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
            <span>Recent Orders on This Device ({userOrders.length})</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userOrders.map((o) => (
              <div
                key={o.orderNumber || o.id}
                onClick={() => {
                  setSelectedOrder(o);
                  setSearchInput(o.orderNumber || '');
                  navigate(`/track/${o.orderNumber}`);
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedOrder?.orderNumber === o.orderNumber
                    ? 'bg-orange-50/50 border-[#C85A32] shadow-xs'
                    : 'bg-white border-[#e7e0d8] hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono font-bold text-xs text-[#1E293B]">{o.orderNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 line-clamp-1">{o.product}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>{formatINR(o.amount)}</span>
                  <span className="text-[#C85A32] font-semibold">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
