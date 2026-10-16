import React from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircle2, Clock, Truck, Package, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'order_placed', label: 'Order Confirmed', icon: <CheckCircle2 className="w-5 h-5" /> },
  { status: 'awaiting_maker_acceptance', label: 'Processing', icon: <Clock className="w-5 h-5" /> },
  { status: 'accepted', label: 'Maker Accepted', icon: <CheckCircle2 className="w-5 h-5" /> },
  { status: 'in_production', label: 'Preparing', icon: <Clock className="w-5 h-5" /> },
  { status: 'ready_to_ship', label: 'Ready to Ship', icon: <Package className="w-5 h-5" /> },
  { status: 'in_transit', label: 'Shipped', icon: <Truck className="w-5 h-5" /> },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="w-5 h-5" /> },
  { status: 'delivered', label: 'Delivered', icon: <CheckCircle2 className="w-5 h-5" /> },
  { status: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-5 h-5" /> },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const currentStatusIndex = statusSteps.findIndex(s => s.status === order.status);

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200" />
        {statusSteps.map((step, index) => {
          if (step.status === 'cancelled' && order.status !== 'cancelled') return null;
          if (order.status === 'cancelled' && step.status !== 'order_placed' && step.status !== 'cancelled') return null;

          const isActive = index <= currentStatusIndex;
          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`p-2 rounded-full ${isActive ? 'bg-[#C85A32] text-white' : 'bg-slate-300 text-slate-500'}`}>
                {step.icon}
              </div>
              <span className={`text-xs font-bold ${isActive ? 'text-[#1E293B]' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {order.trackingAwb && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-600">
            <strong>Courier:</strong> {order.courierName || 'Partner'}
          </p>
          <p className="text-sm text-slate-600">
            <strong>Tracking Number:</strong> {order.trackingAwb}
          </p>
          {order.estimatedDelivery && (
            <p className="text-sm text-slate-600">
              <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
