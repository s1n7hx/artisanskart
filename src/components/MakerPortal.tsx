import React from 'react';
import { Wallet, CheckCircle2, Hammer, Radio, MapPin, CalendarClock, Package, Check, BadgeCheck } from 'lucide-react';
import { Order } from '../types';

interface MakerPortalProps {
  orders: Order[];
  onAcceptOrder: (id: number) => void;
  onMarkReady: (id: number) => void;
  onMarkCompleted: (id: number) => void;
}

export const MakerPortal: React.FC<MakerPortalProps> = ({
  orders,
  onAcceptOrder,
  onMarkReady,
  onMarkCompleted,
}) => {
  const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

  const completed = orders.filter((o) => o.status === 'completed');
  const active = orders.filter((o) => o.status !== 'completed');
  const totalEarnings = completed.reduce((s, o) => s + o.amount * 0.65, 0);

  const statusMeta = {
    new: { label: 'New Order', cls: 'badge-sage' },
    in_production: { label: 'In Production', cls: 'bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/30' },
    ready: { label: 'Ready for Dispatch', cls: 'bg-[#1E293B]/10 text-[#1E293B] border border-[#1E293B]/30' },
    completed: { label: 'Completed', cls: 'bg-[#8A9A86]/20 text-[#5c6a58] border border-[#8A9A86]/40' },
  };

  return (
    <main id="makerPortal" className="px-4 md:px-10 py-10 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#1E293B]">Student Maker Portal</h1>
        <p className="text-slate-500 mt-1">Manage your incoming orders and track your craft earnings.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="glass-panel bg-white rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Total Earnings (65% share)</p>
            <Wallet className="w-5 h-5 text-[#C85A32]" />
          </div>
          <p id="earningsTotal" className="text-3xl font-black mt-2 text-[#C85A32]">
            {formatINR(totalEarnings)}
          </p>
        </div>
        <div className="glass-panel bg-white rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Completed Orders</p>
            <CheckCircle2 className="w-5 h-5 text-[#8A9A86]" />
          </div>
          <p id="earningsCompleted" className="text-3xl font-black mt-2 text-[#1E293B]">
            {completed.length}
          </p>
        </div>
        <div className="glass-panel bg-white rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm font-medium">Active Builds</p>
            <Hammer className="w-5 h-5 text-[#1E293B]" />
          </div>
          <p id="earningsActive" className="text-3xl font-black mt-2 text-[#1E293B]">
            {active.length}
          </p>
        </div>
      </div>

      {/* Live Orders Feed */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1E293B]">
        <Radio className="w-5 h-5 text-[#C85A32]" /> Live Orders Feed
      </h2>
      <div id="ordersFeed" className="grid md:grid-cols-2 gap-5">
        {orders.map((o) => {
          const meta = statusMeta[o.status];
          return (
            <div key={o.id} className="bg-white rounded-2xl p-5 border border-[#f0ebe3] card-hover flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-base text-[#1E293B]">{o.product}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {o.city}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${meta.cls}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mb-4">
                  <span>Qty: {o.qty}</span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5" /> Deadline: {o.deadline}
                  </span>
                  <span className="font-semibold text-[#1E293B]">{formatINR(o.amount)}</span>
                </div>
              </div>

              <div>
                {o.status === 'new' && (
                  <button
                    onClick={() => onAcceptOrder(o.id)}
                    className="btn-terracotta text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer"
                  >
                    <Hammer className="w-3.5 h-3.5" /> Accept &amp; Start Crafting
                  </button>
                )}
                {o.status === 'in_production' && (
                  <button
                    onClick={() => onMarkReady(o.id)}
                    className="bg-[#1E293B] text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#1E293B]/80 transition cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" /> Mark Ready for Pickup
                  </button>
                )}
                {o.status === 'ready' && (
                  <button
                    onClick={() => onMarkCompleted(o.id)}
                    className="bg-[#8A9A86] text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#8A9A86]/80 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}
                {o.status === 'completed' && (
                  <span className="text-xs font-semibold text-[#8A9A86] flex items-center gap-1 py-1">
                    <BadgeCheck className="w-4 h-4" /> Order Completed &amp; Paid
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
