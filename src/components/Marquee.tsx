import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const Marquee: React.FC = () => {
  const navigate = useNavigate();
  const { products, animationSettings } = useApp();

  const { row1, row2 } = useMemo(() => {
    if (products.length === 0) return { row1: [], row2: [] };

    const r1Base: Product[] = [];
    const r2Base: Product[] = [];

    products.forEach((p, idx) => {
      if (idx % 2 === 0) {
        r1Base.push(p);
      } else {
        r2Base.push(p);
      }
    });

    if (r2Base.length === 0) r2Base.push(...r1Base);
    if (r1Base.length === 0) r1Base.push(...r2Base);

    const generateRow = (baseList: Product[], offset: number) => {
      const list = [...baseList];
      const rotated = [...list.slice(offset), ...list.slice(0, offset)];
      let extended: Product[] = [];
      while (extended.length < 16) {
        extended = [...extended, ...rotated];
      }
      return [...extended, ...extended];
    };

    return {
      row1: generateRow(r1Base, 0),
      row2: generateRow(r2Base, 1),
    };
  }, [products]);

  const durationMap: Record<string, string> = {
    slow: '55s',
    normal: '35s',
    fast: '18s',
    paused: '0s',
  };
  const duration = durationMap[animationSettings.marqueeSpeed] || '35s';
  const isPaused = animationSettings.marqueeSpeed === 'paused';

  const renderProductCard = (product: Product, keySuffix: string | number) => {
    return (
      <div
        key={`${product.id}-${keySuffix}`}
        onClick={() => navigate(`/product/${product.id}`)}
        title={product.title}
        className="group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 mr-3.5 sm:mr-4 relative overflow-hidden aspect-[3/4] rounded-2xl bg-neutral-900/5"
        style={{ width: '190px', height: '253px' }}
      >
        {/* Blurred Backdrop Layer (Fills Whitespace) */}
        <img
          src={product.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-40 select-none pointer-events-none"
        />
        {/* Foreground Image Layer (Zero Cropping) */}
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="relative z-10 w-full h-full object-contain p-2 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  };

  return (
    <section
      id="marqueeSection"
      aria-label="Artisan Craft Showcase"
      className="relative bg-[#FAF9F6] py-5 sm:py-6 overflow-hidden select-none border-y border-[#e7e0d8]/60"
    >
      <div className="space-y-3.5 sm:space-y-4">
        {/* Row 1 */}
        <div className="overflow-hidden flex">
          <div
            className="animate-marquee-left flex py-1"
            style={{
              animationDuration: duration,
              animationPlayState: isPaused ? 'paused' : undefined,
            }}
          >
            {row1.map((prod, idx) => renderProductCard(prod, `r1-${idx}`))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="overflow-hidden flex">
          <div
            className="animate-marquee-right flex py-1"
            style={{
              animationDuration: `calc(${duration} * 1.15)`,
              animationPlayState: isPaused ? 'paused' : undefined,
            }}
          >
            {row2.map((prod, idx) => renderProductCard(prod, `r2-${idx}`))}
          </div>
        </div>
      </div>
    </section>
  );
};
