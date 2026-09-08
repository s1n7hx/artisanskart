import React from 'react';
import { HOW_IT_WORKS } from '../data';

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="how-it-works"
      className="bg-white rounded-t-[2.5rem] md:rounded-t-[3.75rem] px-5 md:px-10 py-20 md:py-28"
    >
      <h2
        className="fade-in font-black uppercase text-center mb-16"
        style={{ fontSize: 'clamp(2.5rem,10vw,120px)', color: '#1E293B' }}
      >
        How It Works
      </h2>
      <div className="max-w-4xl mx-auto" id="howItWorksList">
        {HOW_IT_WORKS.map((item, i) => (
          <div
            key={item.n}
            className="fade-in flex items-start gap-6 py-8 border-b border-black/10"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <span
              className="font-black text-[#C85A32] shrink-0 select-none"
              style={{ fontSize: 'clamp(2.5rem,8vw,90px)', lineHeight: 0.9 }}
            >
              {item.n}
            </span>
            <div>
              <h3 className="font-semibold uppercase text-lg md:text-2xl mb-2 text-[#1E293B]">{item.t}</h3>
              <p className="text-slate-500 font-light leading-relaxed max-w-xl">{item.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
