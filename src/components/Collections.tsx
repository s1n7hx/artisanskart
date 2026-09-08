import React, { useEffect, useRef } from 'react';
import { COLLECTIONS } from '../data';

interface CollectionsProps {
  onShopCollection: (category: string) => void;
}

export const Collections: React.FC<CollectionsProps> = ({ onShopCollection }) => {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const cards = stack.querySelectorAll<HTMLDivElement>('.sticky-card');

    const onScroll = () => {
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const stickyTop = parseFloat(card.style.top) * 16;
        const progress = Math.min(Math.max((stickyTop - rect.top) / 300, 0), 1);
        const scale = 1 - progress * 0.05 * (cards.length - i);
        card.style.transform = `scale(${Math.max(scale, 0.9)})`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="collections"
      className="bg-[#1E293B] rounded-t-[2.5rem] md:rounded-t-[3.75rem] -mt-8 relative z-10 px-4 md:px-10 pt-20 pb-32"
    >
      <h2
        className="fade-in hero-heading font-black uppercase text-center mb-16"
        style={{ fontSize: 'clamp(2.5rem,10vw,120px)' }}
      >
        Collections
      </h2>
      <div ref={stackRef} id="collectionsStack" className="max-w-5xl mx-auto space-y-8">
        {COLLECTIONS.map((c, i) => (
          <div
            key={c.n}
            className="sticky-card"
            style={{ top: `${6 + i * 1.75}rem` }}
          >
            <div className="rounded-[2rem] md:rounded-[2.5rem] border-2 border-white/15 bg-[#1E293B] p-4 md:p-8 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <span
                    className="text-white font-black leading-none"
                    style={{ fontSize: 'clamp(2rem,6vw,60px)' }}
                  >
                    {c.n}
                  </span>
                  <div>
                    <p className="text-[#8A9A86] text-xs uppercase tracking-widest font-semibold">{c.cat}</p>
                    <h3 className="text-white text-xl md:text-3xl font-bold">{c.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => onShopCollection(c.category)}
                  className="border-2 border-white/40 text-white rounded-full px-6 py-2.5 text-xs md:text-sm font-semibold uppercase tracking-widest hover:bg-white/10 transition cursor-pointer"
                >
                  Shop Category
                </button>
              </div>
              <p className="text-white/60 max-w-xl mb-6 text-sm md:text-base">{c.desc}</p>
              <div className="flex gap-3 h-[220px] md:h-[280px]">
                <div className="w-2/5 flex flex-col gap-3">
                  <img
                    src={c.img1}
                    alt={c.title}
                    className="rounded-[1.5rem] object-cover w-full h-[40%]"
                  />
                  <img
                    src={c.img2}
                    alt={c.title}
                    className="rounded-[1.5rem] object-cover w-full h-[60%]"
                  />
                </div>
                <div className="w-3/5">
                  <img
                    src={c.img3}
                    alt={c.title}
                    className="rounded-[1.5rem] object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
