import React from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MakerPortalPage: React.FC = () => {
  const {
    orders,
    acceptOrder,
    markReady,
    markCompleted,
    setIsMakerSignupOpen,
  } = useApp();

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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-screen space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e7e0d8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-sage text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Student Artisan Workspace
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1E293B]">
            Student Maker Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track student earnings, fulfill campus orders, and manage craft production stages.
          </p>
        </div>

        <button
          onClick={() => setIsMakerSignupOpen(true)}
          className="btn-terracotta text-xs md:text-sm font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>List New Craft / Update Profile</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Total Earnings (65%)
            </p>
            <Wallet className="w-5 h-5 text-[#C85A32]" />
          </div>
          <p id="earningsTotal" className="text-3xl font-black mt-2 text-[#C85A32]">
            {formatINR(totalEarnings)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Transferred every Friday via UPI
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Completed Orders
            </p>
            <CheckCircle2 className="w-5 h-5 text-[#8A9A86]" />
          </div>
          <p id="earningsCompleted" className="text-3xl font-black mt-2 text-[#1E293B]">
            {completed.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Successfully delivered to buyers
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Active Builds
            </p>
            <Hammer className="w-5 h-5 text-[#E6A373]" />
          </div>
          <p id="earningsActive" className="text-3xl font-black mt-2 text-[#1E293B]">
            {active.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Currently on student workbenches
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Customer Satisfaction
            </p>
            <BadgeCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black mt-2 text-[#1E293B]">
            4.9 <span className="text-base font-normal text-amber-500">★</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Based on 98 verified campus reviews
          </span>
        </div>
      </div>

      {/* Orders Management Feed */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e7e0d8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e7e0d8]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#C85A32] animate-pulse" />
            <h2 className="text-xl font-bold text-[#1E293B]">Live Campus Order Queue</h2>
          </div>
          <p className="text-xs text-slate-400">
            Click status progression buttons to advance your build status.
          </p>
        </div>

        <div id="ordersFeed" className="space-y-4">
          {orders.map((o) => {
            const meta = statusMeta[o.status] || statusMeta.new;
            const makerShare = o.amount * 0.65;

            return (
              <div
                key={o.id}
                className="bg-[#FAF9F6] rounded-2xl p-5 md:p-6 border border-[#e7e0d8] hover:border-[#C85A32]/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#e7e0d8] flex items-center justify-center shrink-0 text-[#C85A32]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        #ORD-2026-{o.id}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {o.deadline}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#1E293B] text-base">{o.product}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Qty: <strong className="text-slate-700">{o.qty} pcs</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C85A32]" /> {o.city}
                      </span>
                      <span>•</span>
                      <span>
                        Order Value: <strong className="text-slate-700 font-semibold">{formatINR(o.amount)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Your 65% Split: <strong className="text-[#C85A32] font-bold">{formatINR(makerShare)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Action Workflow Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {o.status === 'new' && (
                    <button
                      onClick={() => acceptOrder(o.id)}
                      className="btn-terracotta text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Accept Order</span>
                    </button>
                  )}

                  {o.status === 'in_production' && (
                    <button
                      onClick={() => markReady(o.id)}
                      className="bg-[#1E293B] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#C85A32] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {o.status === 'ready' && (
                    <button
                      onClick={() => markCompleted(o.id)}
                      className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete &amp; Payout</span>
                    </button>
                  )}

                  {o.status === 'completed' && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" /> Settled to UPI
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maker Toolkit & Campus Guidelines */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8]">
          <h3 className="font-bold text-[#1E293B] text-base mb-2">Campus Locker Drop-off</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Drop packaged pieces at your campus student union locker before 3:00 PM on weekdays for same-day courier pickup.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8]">
          <h3 className="font-bold text-[#1E293B] text-base mb-2">Free Packaging Restock</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Order free biodegradable honeycomb wrap, paper mailers, and cardboard boxes from the campus coordinator desk anytime.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#e7e0d8]">
          <h3 className="font-bold text-[#1E293B] text-base mb-2">Exam Mode Sleep Switch</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Midterms coming up? Pause incoming orders with one toggle to prioritize coursework without hurting your artisan rating.
          </p>
        </div>
      </div>
    </div>
  );
};
