import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { HOW_IT_WORKS } from '../data';
import { useApp } from '../context/AppContext';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, makerEarningPercent } = useApp();

  const faqs = [
    {
      q: 'How long does made-on-demand production take?',
      a: 'Since every item is hand-built by an independent artisan, production typically takes 2 to 4 working days before dispatch. You will receive live photo updates as your craft moves through production.',
    },
    {
      q: 'How do independent creators get paid?',
      a: `Creators receive ${makerEarningPercent}% of the craft value credited directly to their verified bank or UPI ID every Friday once the parcel is handed over to our secure pickup lockers.`,
    },
    {
      q: 'What if a delicate ceramic or clay item arrives broken?',
      a: 'We use professional, shock-resistant protective packaging. In the rare event of damage during transit, we provide an immediate free remake or a 100% hassle-free refund.',
    },
    {
      q: 'Can creators balance their schedule while selling on ArtisansKart?',
      a: 'Yes! Makers set their own maximum monthly order quotas (e.g. 5–15 pieces) and can pause their storefront anytime with one tap in their maker portal.',
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
          From the creator's studio workbench to your doorstep — here is the complete 5-step journey behind every handcrafted creation.
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

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="badge-sage text-xs px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
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
            Explore authentic pieces made with love by independent artisans &amp; creators.
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
              type="button"
              onClick={() => {
                if (!currentUser) {
                  navigate('/login?redirectTo=/become-a-maker');
                } else {
                  navigate('/become-a-maker');
                }
              }}
              className="bg-white border border-[#e7e0d8] text-[#1E293B] hover:border-[#1E293B] text-sm font-semibold px-6 py-3 rounded-full cursor-pointer transition"
            >
              Apply as Maker / Creator
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
