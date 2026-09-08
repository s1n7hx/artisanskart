import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Package, ShieldCheck, Truck, HelpCircle } from 'lucide-react';
import { HOW_IT_WORKS } from '../data';
import { useApp } from '../context/AppContext';

export const HowItWorksPage: React.FC = () => {
  const { setIsMakerSignupOpen } = useApp();
  const [examplePrice, setExamplePrice] = useState<number>(850);

  const studentEarnings = Math.round(examplePrice * 0.65);
  const platformFee = Math.round(examplePrice * 0.20);
  const packagingDelivery = examplePrice - studentEarnings - platformFee;

  const faqs = [
    {
      q: 'How long does made-on-demand production take?',
      a: 'Since every item is hand-built by a student artisan on campus, production typically takes 2 to 4 working days before dispatch. You will receive live photo updates as your craft moves through production.',
    },
    {
      q: 'How do student artisans get paid?',
      a: 'Students receive 65% of the craft value credited directly to their verified bank or UPI ID every Friday once the parcel is handed over to our campus pickup lockers.',
    },
    {
      q: 'What if a delicate ceramic or clay item arrives broken?',
      a: 'We use double-layered honeycomb paper wrap and heavy-duty corrugated cartons. In the rare event of damage during transit, we provide an immediate free remake or a 100% hassle-free refund.',
    },
    {
      q: 'Can students balance coursework while selling on ArtisansKart?',
      a: 'Yes! Makers set their own maximum monthly order quotas (e.g. 5–15 pieces) and can pause their storefront anytime during exam weeks with one tap in their maker portal.',
    },
  ];

  return (
    <div className="space-y-20 py-8">
      {/* Page Header */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 text-center pt-8">
        <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
          Transparent Process
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-[#1E293B] mt-4 tracking-tight">
          How ArtisansKart Works
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
          From the student's studio workbench to your doorstep — here is the complete 5-step journey behind every handcrafted creation.
        </p>
      </section>

      {/* The 5 Steps */}
      <section className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-[2.5rem] border border-[#e7e0d8] p-6 md:p-14 shadow-sm">
          <div className="space-y-10">
            {HOW_IT_WORKS.map((item, idx) => (
              <div
                key={item.n}
                className="flex flex-col sm:flex-row items-start gap-6 pb-10 border-b border-[#f0eae1] last:border-b-0 last:pb-0"
              >
                <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#FAF9F6] border border-[#e7e0d8] flex items-center justify-center">
                  <span
                    className="font-black text-[#C85A32] select-none text-4xl md:text-5xl"
                    style={{ lineHeight: 0.9 }}
                  >
                    {item.n}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#8A9A86]">
                      Stage {idx + 1}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-2">{item.t}</h2>
                  <p className="text-slate-500 font-light leading-relaxed text-sm md:text-base max-w-2xl">
                    {item.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Transparent Price Split Calculator */}
      <section className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="bg-linear-to-br from-[#1E293B] to-[#283548] text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="bg-[#C85A32]/20 text-[#E6A373] border border-[#C85A32]/30 text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
              Financial Transparency
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-3">
              Where Does Every Rupee Go?
            </h2>
            <p className="text-white/70 text-sm mt-2">
              Move the slider to see how order values are split fairly between the student creator, packaging, and platform.
            </p>
          </div>

          {/* Slider Control */}
          <div className="max-w-md mx-auto mb-10 text-center">
            <label htmlFor="priceSlider" className="text-xs font-semibold uppercase tracking-wider text-white/60 block mb-2">
              Test Order Amount: <span className="text-white font-bold text-lg">₹{examplePrice}</span>
            </label>
            <input
              id="priceSlider"
              type="range"
              min="200"
              max="3000"
              step="50"
              value={examplePrice}
              onChange={(e) => setExamplePrice(Number(e.target.value))}
              className="w-full accent-[#C85A32] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>₹200</span>
              <span>₹1,500</span>
              <span>₹3,000</span>
            </div>
          </div>

          {/* 3 Split Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-bold text-[#E6A373]">65% Direct to Student</span>
                <Sparkles className="w-4 h-4 text-[#E6A373]" />
              </div>
              <p className="text-3xl font-black text-white">₹{studentEarnings.toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Direct creator compensation for materials, studio time, tuition assistance, and craft talent.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-bold text-[#8A9A86]">15% Eco Dispatch</span>
                <Truck className="w-4 h-4 text-[#8A9A86]" />
              </div>
              <p className="text-3xl font-black text-white">₹{packagingDelivery.toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Zero-plastic biodegradable honeycomb wrapping, rigid carton boxes, and doorstep tracked courier.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-bold text-white/80">20% Platform &amp; Support</span>
                <ShieldCheck className="w-4 h-4 text-white/80" />
              </div>
              <p className="text-3xl font-black text-white">₹{platformFee.toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                Hosting, payment gateway charges, campus drop-off locker maintenance, and quality check assurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="badge-sage text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Common Questions
          </span>
          <h2 className="text-3xl font-black text-[#1E293B] mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#e7e0d8] shadow-xs"
            >
              <h3 className="text-base md:text-lg font-bold text-[#1E293B] flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#C85A32] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-slate-500 text-sm mt-3 ml-8 leading-relaxed font-light">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Action Banner */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 text-center pb-8">
        <div className="bg-[#FAF9F6] border border-[#e7e0d8] rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1E293B] mb-3">
            Ready to Experience Handcrafted Goodness?
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto mb-6">
            Explore authentic pieces made with love by university &amp; art school students.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/marketplace"
              className="btn-terracotta text-sm font-semibold px-6 py-3 rounded-full flex items-center gap-2"
            >
              <span>Shop All Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsMakerSignupOpen(true)}
              className="bg-white border border-[#e7e0d8] text-[#1E293B] hover:border-[#1E293B] text-sm font-semibold px-6 py-3 rounded-full cursor-pointer transition"
            >
              Apply as Student Maker
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
