import React, { useEffect, useRef } from 'react';
import { Flower2, Scissors, Paintbrush, Gift } from 'lucide-react';
import { ABOUT_TEXT } from '../data';

interface AboutProps {
  onMeetMakers: () => void;
}

export const About: React.FC<AboutProps> = ({ onMeetMakers }) => {
  const pRef = useRef<HTMLParagraphElement>(null);
  const chars = ABOUT_TEXT.split('');

  useEffect(() => {
    const p = pRef.current;
    if (!p) return;
    const spans = p.querySelectorAll<HTMLSpanElement>('span');

    const onScroll = () => {
      const rect = p.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.2;
      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      const revealCount = Math.floor(progress * spans.length);
      spans.forEach((s, i) => {
        s.style.opacity = i < revealCount ? '1' : '0.2';
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="about"
      className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-5 md:px-10 py-24 overflow-hidden"
    >
      {/* Floating Decorative Icons */}
      <div
        className="fade-in floating-icon absolute top-[6%] left-[3%] md:left-[6%] text-[#C85A32]"
        style={{ transitionDelay: '100ms' }}
      >
        <Flower2 className="w-16 h-16 md:w-24 md:h-24 stroke-[1.5]" />
      </div>
      <div
        className="fade-in floating-icon absolute bottom-[10%] left-[4%] md:left-[10%] text-[#8A9A86]"
        style={{ transitionDelay: '250ms' }}
      >
        <Scissors className="w-12 h-12 md:w-20 md:h-20 stroke-[1.5]" />
      </div>
      <div
        className="fade-in floating-icon absolute top-[6%] right-[3%] md:right-[6%] text-[#8A9A86]"
        style={{ transitionDelay: '150ms' }}
      >
        <Paintbrush className="w-16 h-16 md:w-24 md:h-24 stroke-[1.5]" />
      </div>
      <div
        className="fade-in floating-icon absolute bottom-[10%] right-[4%] md:right-[10%] text-[#C85A32]"
        style={{ transitionDelay: '300ms' }}
      >
        <Gift className="w-14 h-14 md:w-20 md:h-20 stroke-[1.5]" />
      </div>

      <h2
        className="fade-in about-heading font-black uppercase leading-none tracking-tight"
        style={{ fontSize: 'clamp(2.5rem,10vw,120px)' }}
      >
        About Us
      </h2>

      <p
        ref={pRef}
        id="animatedAbout"
        className="char-anim mt-8 max-w-xl mx-auto font-medium leading-relaxed text-slate-600"
        style={{ fontSize: 'clamp(1rem,2vw,1.3rem)' }}
      >
        {chars.map((ch, i) => (
          <span key={i} style={{ opacity: 0.2, transition: 'opacity .15s linear' }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </p>

      <button
        onClick={onMeetMakers}
        className="fade-in mt-10 btn-terracotta font-semibold px-8 py-3.5 rounded-full text-sm md:text-base cursor-pointer"
        style={{ transitionDelay: '200ms' }}
      >
        Meet the Makers
      </button>
    </section>
  );
};
