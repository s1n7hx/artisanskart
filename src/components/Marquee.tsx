import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const Marquee: React.FC = () => {
  const { products, setQuickViewId, animationSettings } = useApp();

  // Distribute all real platform products across 2 horizontal rows.
  // When a new product is added to the platform, it is prepended to `products`,
  // immediately appearing in the stream and cycling through the marquee.
  const { row1, row2 } = useMemo(() => {
    const r1: Product[] = [];
    const r2: Product[] = [];

    products.forEach((p, idx) => {
      if (idx % 2 === 0) {
        r1.push(p);
      } else {
        r2.push(p);
      }
    });

    if (r2.length === 0 && r1.length > 0) {
      r2.push(...r1);
    }

    // Helper to ensure infinite horizontal loop is seamless and smooth on all screen sizes:
    // Base set repeated until at least 8 items, then duplicated once for 0% to -50% keyframe.
    const makeSeamlessTrack = (list: Product[]) => {
      if (list.length === 0) return [];
      let base = [...list];
      while (base.length < 8) {
        base = [...base, ...list];
      }
      return [...base, ...base];
    };

    return {
      row1: makeSeamlessTrack(r1),
      row2: makeSeamlessTrack(r2),
    };
  }, [products]);

  // Dynamic animation duration based on speed setting
  const durationMap: Record<string, string> = {
    slow: '55s',
    normal: '32s',
    fast: '18s',
    paused: '0s',
  };
  const duration = durationMap[animationSettings.marqueeSpeed] || '32s';
  const isPaused = animationSettings.marqueeSpeed === 'paused';

  const renderProductPicture = (product: Product, keySuffix: string | number) => {
    return (
      <div
        key={`${product.id}-${keySuffix}`}
        onClick={() => setQuickViewId(product.id)}
        title={product.title}
        className="group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 mr-3.5 sm:mr-4 border border-[#e7e0d8]/60 bg-white"
        style={{ width: '270px', height: '185px' }}
      >
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
        />
      </div>
    );
  };

  return (
    <section
      id="marqueeSection"
      aria-label="Student Craft Showcase"
      className="relative bg-[#FAF9F6] py-4 sm:py-6 overflow-hidden select-none border-y border-[#e7e0d8]/80"
    >
      {/* Edge gradient fade masks */}
      <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent z-20 pointer-events-none" />

      {/* Dual Horizontal Picture Tracks */}
      <div className="space-y-3.5 sm:space-y-4">
        {/* Row 1: Gliding Left */}
        <div className="overflow-hidden flex">
          <div
            className="animate-marquee-left flex py-0.5"
            style={{
              animationDuration: duration,
              animationPlayState: isPaused ? 'paused' : undefined,
            }}
          >
            {row1.map((prod, idx) => renderProductPicture(prod, `r1-${idx}`))}
          </div>
        </div>

        {/* Row 2: Gliding Right (Reverse Direction) */}
        <div className="overflow-hidden flex">
          <div
            className="animate-marquee-right flex py-0.5"
            style={{
              animationDuration: `calc(${duration} * 1.1)`,
              animationPlayState: isPaused ? 'paused' : undefined,
            }}
          >
            {row2.map((prod, idx) => renderProductPicture(prod, `r2-${idx}`))}
          </div>
        </div>
      </div>
    </section>
  );
};
