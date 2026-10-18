import React from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircle2, Clock, Truck, Package, XCircle, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

const statusSteps: { key: string; label: string; icon: React.ReactNode; matchingStatuses: OrderStatus[] }[] = [
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    icon: <CheckCircle2 className="w-4 h-4" />,
    matchingStatuses: ['order_placed', 'new'],
  },
  {
    key: 'processing',
    label: 'Studio Assigned',
    icon: <Clock className="w-4 h-4" />,
    matchingStatuses: ['awaiting_maker_acceptance'],
  },
  {
    key: 'accepted',
    label: 'Maker Accepted',
    icon: <CheckCircle2 className="w-4 h-4" />,
    matchingStatuses: ['accepted'],
  },
  {
    key: 'preparing',
    label: 'Crafting in Studio',
    icon: <Clock className="w-4 h-4" />,
    matchingStatuses: ['in_production', 'quality_check', 'ready_to_pack'],
  },
  {
    key: 'ready_to_ship',
    label: 'Ready for Courier',
    icon: <Package className="w-4 h-4" />,
    matchingStatuses: ['packed', 'ready', 'ready_to_ship', 'shipment_booked'],
  },
  {
    key: 'in_transit',
    label: 'Shipped (In Transit)',
    icon: <Truck className="w-4 h-4" />,
    matchingStatuses: ['picked_up', 'in_transit'],
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    icon: <Truck className="w-4 h-4" />,
    matchingStatuses: ['out_for_delivery'],
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: <CheckCircle2 className="w-4 h-4" />,
    matchingStatuses: ['delivered', 'completed'],
  },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const [copied, setCopied] = React.useState(false);

  const isCancelled = order.status === 'cancelled' || order.status === 'maker_rejected';
  const isDeliveryException = order.status === 'delivery_exception' || order.status === 'shipment_failed';

  // Determine current active step index
  const currentStatusIndex = statusSteps.findIndex((step) =>
    step.matchingStatuses.includes(order.status)
  );

  const activeIndex = currentStatusIndex >= 0 ? currentStatusIndex : 0;

  const handleCopyAwb = () => {
    if (order.trackingAwb) {
      navigator.clipboard.writeText(order.trackingAwb);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full py-4 space-y-5">
      {/* Failure / Exception Banners */}
      {isCancelled && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs font-medium">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">Order Cancelled</p>
            <p className="text-red-700">
              {order.rejectionReason || 'This order has been cancelled. Any pre-paid payments have been credited.'}
            </p>
          </div>
        </div>
      )}

      {isDeliveryException && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs font-medium">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold text-amber-900">Delivery Exception</p>
            <p className="text-amber-700">
              Courier reported an exception. Re-attempt will be scheduled with partner carrier.
            </p>
          </div>
        </div>
      )}

      {/* Responsive Horizontal Stepper */}
      {!isCancelled && (
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[640px] px-2 py-4">
            <div className="relative flex justify-between items-center">
              {/* Progress Line */}
              <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0">
                <div
                  className="h-full bg-[#C85A32] transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (activeIndex / (statusSteps.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {statusSteps.map((step, idx) => {
                const isPassed = idx < activeIndex;
                const isCurrent = idx === activeIndex;
                const isPending = idx > activeIndex;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 text-center w-20">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-[#C85A32] text-white ring-4 ring-[#C85A32]/20 shadow-md scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.icon}
                    </div>
                    <span
                      className={`text-[11px] leading-tight font-bold ${
                        isCurrent
                          ? 'text-[#C85A32]'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Courier & Tracking Info Card */}
      {order.trackingAwb && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF9F6] to-orange-50/40 rounded-2xl border border-[#e7e0d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Courier Dispatch</span>
              <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                {order.courierName || 'NimbusPost Express Partner'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">AWB Tracking:</span>
              <span className="font-mono text-sm font-bold text-[#C85A32]">{order.trackingAwb}</span>
              <button
                type="button"
                onClick={handleCopyAwb}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                title="Copy AWB Tracking Number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            {order.estimatedDelivery && (
              <p className="text-xs text-slate-600">
                <strong>Est. Delivery:</strong> {order.estimatedDelivery}
              </p>
            )}
          </div>

          <a
            href={`https://nimbuspost.com/shipping-tracking?awb=${order.trackingAwb}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-2xs transition shrink-0"
          >
            <span>Live Carrier Tracking</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C85A32]" />
          </a>
        </div>
      )}
    </div>
  );
};
