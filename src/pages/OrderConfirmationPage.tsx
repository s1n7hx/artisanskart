import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Home,
} from 'lucide-react';
import { Order } from '../types';
import { OrderTimeline } from '../components/OrderTimeline';
import { getStoredOrders } from '../services/ecommerce';
import { supabase } from '../services/supabase';
import { SEO } from '../components/SEO';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const fetchConfirmedOrder = async (ref: string) => {
    const cleanRef = ref.trim();
    if (!cleanRef) {
      setIsLoading(false);
      setErrorMsg('No order reference provided.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Try central server endpoint
      const serverRes = await fetch(`/api/orders/${encodeURIComponent(cleanRef)}`);
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.order) {
          setOrder(serverData.order);
          setIsLoading(false);
          return;
        }
      }

      // 2. Query Supabase directly
      const isNum = !isNaN(Number(cleanRef)) && Number(cleanRef) > 0;
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `);

      if (isNum) {
        query = query.or(`id.eq.${cleanRef},order_number.ilike.${cleanRef},tracking_awb.ilike.${cleanRef}`);
      } else {
        query = query.or(`order_number.ilike.${cleanRef},tracking_awb.ilike.${cleanRef}`);
      }

      const { data: dbOrders, error: dbErr } = await query;

      if (!dbErr && dbOrders && dbOrders.length > 0) {
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
          : [];

        const mappedOrder: Order = {
          id: d.id,
          orderNumber: d.order_number,
          city: d.shipping_address ? `${d.shipping_address.city || ''}, ${d.shipping_address.state || ''}` : 'India',
          product: mappedItems.map((i: any) => i.title).join(', ') || 'Handmade Creation',
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

        setOrder(mappedOrder);
        setIsLoading(false);
        return;
      }

      // 3. Check local storage fallback
      const localOrders = getStoredOrders();
      const localMatch = localOrders.find(
        (o) =>
          o.orderNumber?.toLowerCase() === cleanRef.toLowerCase() ||
          String(o.trackingAwb || '').toLowerCase() === cleanRef.toLowerCase() ||
          String(o.id) === cleanRef
      );

      if (localMatch) {
        setOrder(localMatch);
        setIsLoading(false);
        return;
      }

      setErrorMsg(`Order matching "${cleanRef}" was not found. Please check your order number.`);
    } catch (err: any) {
      setErrorMsg('Could not load order confirmation. Please refresh or check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderNumber) {
      fetchConfirmedOrder(paramOrderNumber);
    } else {
      setIsLoading(false);
      setErrorMsg('No order specified.');
    }
  }, [paramOrderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#1E293B]">Loading Order Confirmation...</h2>
          <p className="text-sm text-slate-500">
            Retrieving persistent order records and maker studio queue status.
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#1E293B]">Order Confirmation Not Found</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {errorMsg || 'We could not locate this order. Please verify your order number.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/track"
            className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#C85A32] text-white hover:bg-[#b04a25] transition shadow-md"
          >
            Track Order
          </Link>
          <Link
            to="/marketplace"
            className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16 space-y-8">
      <SEO
        title={`Order Confirmation #${order.orderNumber} | ArtisansKart`}
        description={`Thank you for your order! Your purchase of ${order.product} has been placed and routed to independent artisans.`}
        canonicalPath={`/order-confirmation/${order.orderNumber}`}
      />

      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider inline-block">
          Order Confirmed &amp; Dispatched to Studio Queue
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1E293B]">
          Thank You for Supporting Independent Artisans!
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Your order has been routed directly to the artisan creator. Crafting will begin as soon as the studio accepts the request.
        </p>
      </div>

      {/* Main Order Confirmation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e0d8] shadow-xs space-y-6">
        {/* Order Reference & AWB */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e0d8]">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Reference</span>
            <p className="text-2xl font-black text-[#1E293B] font-mono">{order.orderNumber}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courier Tracking AWB (NimbusPost)</span>
            <p className="text-sm font-bold text-[#C85A32] font-mono">{order.trackingAwb || 'Generating AWB...'}</p>
            <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              Payment: {order.paymentStatus || 'PAID'}
            </span>
          </div>
        </div>

        {/* Live Production Timeline */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Live Production &amp; Delivery Progress</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px]">
              {order.status ? order.status.replace(/_/g, ' ').toUpperCase() : 'AWAITING MAKER'}
            </span>
          </h2>
          <OrderTimeline order={order} />
        </div>

        {/* Ordered Items List */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#C85A32]" />
              <span>Purchased Handcrafted Creations ({order.items.length})</span>
            </h3>
            <div className="divide-y divide-slate-100 border border-[#e7e0d8] rounded-2xl overflow-hidden bg-white">
              {order.items.map((it, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    {it.imageUrl && (
                      <img
                        src={it.imageUrl}
                        alt={it.title}
                        className="w-14 h-14 rounded-xl object-cover border bg-slate-50 shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{it.title}</p>
                      <p className="text-slate-500 text-[11px]">Crafted by {it.makerName || 'Studio Creator'}</p>
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

        {/* Address and Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          {/* Delivery Address */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32] inline mr-1" />
              Delivery Destination
            </span>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            {order.customerPhone && <p className="text-slate-600">Phone: {order.customerPhone}</p>}
            {order.shippingAddress ? (
              <p className="text-slate-600 leading-relaxed">
                {order.shippingAddress.buildingHouse}, {order.shippingAddress.streetAddress ? `${order.shippingAddress.streetAddress}, ` : ''}
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            ) : (
              <p className="text-slate-600">{order.city}</p>
            )}
          </div>

          {/* Payment Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              <CreditCard className="w-3.5 h-3.5 text-[#C85A32] inline mr-1" />
              Payment Details
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-slate-800">{formatINR(order.itemsTotal || order.amount)}</span>
            </div>
            {order.discountAmount ? (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Savings:</span>
                <span>-{formatINR(order.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-600">
              <span>Packaging &amp; Delivery:</span>
              <span className="text-emerald-700 font-semibold">
                {order.shippingFee ? formatINR(order.shippingFee) : 'FREE'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
              <span>Final Total Paid:</span>
              <span className="text-[#C85A32]">{formatINR(order.amount)}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            to={`/track/${order.orderNumber}`}
            className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-[#C85A32] text-white hover:bg-[#b04a25] text-center transition shadow-md flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Delivery Live ({order.orderNumber})</span>
          </Link>
          <Link
            to="/marketplace"
            className="flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-[#1E293B] text-white hover:bg-slate-800 text-center transition shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore More Creations</span>
          </Link>
          <Link
            to="/"
            className="py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 text-center transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
