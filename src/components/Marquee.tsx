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
    slow: '50s',
    normal: '30s',
    fast: '16s',
    paused: '0s',
  };
  const duration = durationMap[animationSettings.marqueeSpeed] || '30s';
  const isPaused = animationSettings.marqueeSpeed === 'paused';

  const renderProductCard = (product: Product, keySuffix: string | number) => {
    return (
      <div
        key={`${product.id}-${keySuffix}`}
        onClick={() => navigate(`/product/${product.id}`)}
        title={product.title}
        className="group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 mr-3.5 sm:mr-4 border border-[#e7e0d8]/80 bg-white flex items-center justify-center p-2"
        style={{ width: '230px', height: '145px' }}
      >
        <div className="w-full h-full flex items-center justify-center p-1">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>
    );
  };

  return (
    <section
      id="marqueeSection"
      aria-label="Artisan Craft Showcase"
      className="relative bg-[#FAF9F6] py-5 sm:py-6 overflow-hidden select-none border-y border-[#e7e0d8]/60"
    >
      {/* Subtle edge fade masks */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAF9F6] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAF9F6] to-transparent z-20 pointer-events-none" />

      <div className="space-y-3 sm:space-y-3.5">
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
