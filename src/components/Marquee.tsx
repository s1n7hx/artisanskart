import React from 'react';
import { useApp } from '../context/AppContext';

export const Marquee: React.FC = () => {
  const { products, animationSettings } = useApp();
  
  // Use current products images (supports live edits) or fallback to available
  const imgs = products.map((p) => p.image);
  const row1Imgs = imgs.slice(0, Math.ceil(imgs.length / 2));
  const row2Imgs = imgs.slice(Math.ceil(imgs.length / 2));
  
  // Quadruple sets for seamless infinite loop on any screen width
  const seamlessRow1 = [...row1Imgs, ...row1Imgs, ...row1Imgs, ...row1Imgs];
  const seamlessRow2 = [...row2Imgs, ...row2Imgs, ...row2Imgs, ...row2Imgs];

  // Dynamic animation duration based on user preference
  const durationMap = {
    slow: '50s',
    normal: '30s',
    fast: '16s',
    paused: '0s'
  };
  const duration = durationMap[animationSettings.marqueeSpeed] || '30s';
  const isPaused = animationSettings.marqueeSpeed === 'paused';

  return (
    <section id="marqueeSection" className="bg-[#FAF9F6] pt-6 pb-16 overflow-hidden select-none">
      <div className="marquee-row mb-3.5">
        <div
          className="animate-marquee-left gap-3.5"
          style={{
            animationDuration: duration,
            animationPlayState: isPaused ? 'paused' : undefined,
          }}
        >
          {seamlessRow1.map((src, i) => (
            <div key={`row1-${i}`} className="marquee-tile overflow-hidden shadow-xs border border-[#E7E0D8]/80 bg-white">
              <img
                src={src}
                loading="lazy"
                alt="Student craft showcase"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="marquee-row">
        <div
          className="animate-marquee-right gap-3.5"
          style={{
            animationDuration: duration,
            animationPlayState: isPaused ? 'paused' : undefined,
          }}
        >
          {seamlessRow2.map((src, i) => (
            <div key={`row2-${i}`} className="marquee-tile overflow-hidden shadow-xs border border-[#E7E0D8]/80 bg-white">
              <img
                src={src}
                loading="lazy"
                alt="Student craft showcase"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


