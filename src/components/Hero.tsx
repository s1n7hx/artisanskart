import React, { useEffect, useRef, useState } from 'react';
import { BadgeCheck, ShoppingBasket, PencilRuler, Flame, Edit2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeroProps {
  onExploreMarketplace: () => void;
  onOpenMakerSignup: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMarketplace, onOpenMakerSignup }) => {
  const { heroContent, animationSettings, setIsWpModalOpen, userRole } = useApp();
  const stageRef = useRef<HTMLDivElement>(null);
  const mainElRef = useRef<HTMLDivElement>(null);
  const leftElRef = useRef<HTMLDivElement>(null);
  const rightElRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  const [statEarnings, setStatEarnings] = useState(0);
  const [statHandmade, setStatHandmade] = useState(0);
  const [statVerified, setStatVerified] = useState(0);

  // Magnet effect - respects animationSettings.enableMagnet
  useEffect(() => {
    if (!animationSettings.enableMagnet) return;

    const stage = stageRef.current;
    const mainEl = mainElRef.current;
    const leftEl = leftElRef.current;
    const rightEl = rightElRef.current;
    if (!stage || !mainEl) return;

    const padding = 140;
    let active = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(rect.width, rect.height) / 2 + padding;

      if (dist < maxDist) {
        active = true;
        mainEl.style.transition = 'transform .25s ease-out';
        mainEl.style.transform = `translate3d(${dx / 18}px, ${dy / 18}px, 0)`;

        if (leftEl) {
          leftEl.style.transition = 'transform .3s ease-out';
          leftEl.style.transform = `translate3d(${-dx / 12}px, ${-dy / 12}px, 0) rotate(-5deg)`;
        }
        if (rightEl) {
          rightEl.style.transition = 'transform .3s ease-out';
          rightEl.style.transform = `translate3d(${dx / 10}px, ${-dy / 14}px, 0) rotate(5deg)`;
        }
      } else if (active) {
        active = false;
        mainEl.style.transition = 'transform .6s ease-in-out';
        mainEl.style.transform = 'translate3d(0,0,0)';
        if (leftEl) {
          leftEl.style.transition = 'transform .6s ease-in-out';
          leftEl.style.transform = 'translate3d(0,0,0) rotate(-6deg)';
        }
        if (rightEl) {
          rightEl.style.transition = 'transform .6s ease-in-out';
          rightEl.style.transform = 'translate3d(0,0,0) rotate(6deg)';
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [animationSettings.enableMagnet]);

  // Stat counters animation
  useEffect(() => {
    let animated = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;

            // Direct Maker Share count up to 65%
            let curEarnings = 0;
            const iv1 = setInterval(() => {
              curEarnings += 2;
              if (curEarnings >= 65) {
                curEarnings = 65;
                clearInterval(iv1);
              }
              setStatEarnings(curEarnings);
            }, 30);

            // Handcrafted & On-Demand count up to 100%
            let curHandmade = 0;
            const iv2 = setInterval(() => {
              curHandmade += 3;
              if (curHandmade >= 100) {
                curHandmade = 100;
                clearInterval(iv2);
              }
              setStatHandmade(curHandmade);
            }, 30);

            // Verified Campus Artisans count up to 100%
            let curVerified = 0;
            const iv3 = setInterval(() => {
              curVerified += 3;
              if (curVerified >= 100) {
                curVerified = 100;
                clearInterval(iv3);
              }
              setStatVerified(curVerified);
            }, 30);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section id="home" className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden px-4 md:px-10 pt-10 pb-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(200,90,50,0.10),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(138,154,134,0.16),transparent_50%)]" />

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="fade-in inline-flex items-center gap-2 badge-sage px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            <BadgeCheck className="w-3.5 h-3.5" /> {heroContent.badgeText}
          </div>
          <h1
            className="fade-in hero-heading font-black uppercase leading-[0.95] tracking-tight text-[13vw] md:text-[4.2vw]"
            style={{ transitionDelay: '120ms' }}
          >
            {heroContent.headlineLine1}
            <br />
            {heroContent.headlineLine2}
            <br />
            {heroContent.headlineLine3}
          </h1>
          <p
            className="fade-in mt-6 max-w-md text-slate-600 font-light text-base md:text-lg"
            style={{ transitionDelay: '250ms' }}
          >
            {heroContent.subhead}
          </p>
          <div className="fade-in mt-8 flex flex-wrap items-center gap-3" style={{ transitionDelay: '350ms' }}>
            <button
              onClick={onExploreMarketplace}
              className="btn-terracotta font-semibold px-7 py-3.5 rounded-full text-sm md:text-base flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ShoppingBasket className="w-4 h-4" /> Explore Marketplace
            </button>
            <button
              onClick={onOpenMakerSignup}
              className="font-semibold px-7 py-3.5 rounded-full text-sm md:text-base border-2 border-[#1E293B]/20 hover:bg-[#1E293B]/5 flex items-center gap-2 cursor-pointer transition"
            >
              <PencilRuler className="w-4 h-4" /> Become a Maker
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => setIsWpModalOpen(true)}
                title="Customize photos, text and animations"
                className="text-xs text-slate-500 hover:text-[#C85A32] flex items-center gap-1.5 px-3 py-2 rounded-full border border-dashed border-[#E7E0D8] hover:border-[#C85A32] transition bg-white/50 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" /> Customize Photos &amp; Motion
              </button>
            )}
          </div>

          <div
            ref={statsSectionRef}
            className="fade-in mt-10 flex flex-wrap gap-6 md:gap-10"
            style={{ transitionDelay: '450ms' }}
          >
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#C85A32]">
                <span id="statEarnings">{statEarnings}</span>%
              </p>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Direct Maker Share</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#8A9A86]">
                <span id="statHandmade">{statHandmade}</span>%
              </p>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Made to Order</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-[#1E293B]">
                <span id="statVerified">{statVerified}</span>%
              </p>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Verified Student Artisans</p>
            </div>
          </div>
        </div>

        {/* Hero Collage Stage */}
        <div
          ref={stageRef}
          id="heroCollageStage"
          className="relative h-[430px] sm:h-[480px] md:h-[540px] flex items-center justify-center group"
        >
          {/* Decorative rotating ambient orbit ring */}
          <div className="absolute w-[310px] sm:w-[380px] md:w-[440px] h-[310px] sm:h-[380px] md:h-[440px] rounded-full border-2 border-dashed border-[#C85A32]/25 pointer-events-none animate-[spin_45s_linear_infinite]" />

          {/* Top-Left Aligned Satellite Picture (Hand-Painted Art) */}
          <div
            ref={leftElRef}
            id="magnetHeroLeft"
            className="magnet-el fade-in absolute top-2 left-1 sm:left-4 md:left-2 z-20 w-[135px] sm:w-[165px] md:w-[190px] h-[155px] sm:h-[185px] md:h-[210px] rounded-2xl overflow-hidden shadow-xl border-4 border-white/95 -rotate-6 hover:rotate-0 transition-transform duration-500 group/left"
            style={{ transitionDelay: '550ms' }}
          >
            <img
              src={heroContent.leftImage}
              className="w-full h-full object-cover"
              alt="Ceramic painting craft"
            />
            <span className="absolute bottom-2 left-2 bg-[#1E293B]/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
              {heroContent.leftTag}
            </span>
          </div>

          {/* Center Main Studio Portrait */}
          <div
            ref={mainElRef}
            id="magnetHero"
            className="magnet-el fade-in relative z-10 w-[220px] sm:w-[270px] md:w-[320px] h-[310px] sm:h-[370px] md:h-[420px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/95 group/main"
            style={{ transitionDelay: '480ms' }}
          >
            <img
              src={heroContent.mainImage}
              className="w-full h-full object-cover"
              alt="Student crafting clay art"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/45 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3.5 text-white text-xs font-semibold tracking-wide flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#C85A32]" /> {heroContent.mainTag}
            </span>
          </div>

          {/* Bottom-Right Aligned Satellite Picture (Handmade Accessories) */}
          <div
            ref={rightElRef}
            id="magnetHeroRight"
            className="magnet-el fade-in absolute bottom-2 right-1 sm:right-4 md:right-2 z-20 w-[140px] sm:w-[170px] md:w-[195px] h-[160px] sm:h-[190px] md:h-[215px] rounded-2xl overflow-hidden shadow-xl border-4 border-white/95 rotate-6 hover:rotate-0 transition-transform duration-500 group/right"
            style={{ transitionDelay: '640ms' }}
          >
            <img
              src={heroContent.rightImage}
              className="w-full h-full object-cover"
              alt="Handmade jewelry craft"
            />
            <span className="absolute bottom-2 right-2 bg-[#C85A32]/90 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
              {heroContent.rightTag}
            </span>
          </div>

          {/* Top-Right Verified Studio Badge */}
          <div
            className="fade-in absolute top-4 right-2 sm:right-6 md:right-4 z-30 glass-panel rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-1.5"
            style={{ transitionDelay: '680ms' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#8A9A86] animate-ping" />
            <span className="text-[11px] font-semibold text-[#1E293B]">100% Student Made</span>
          </div>

          {/* Bottom-Left Fair Trade Revenue Split Badge */}
          <div
            className="fade-in absolute bottom-5 left-2 sm:left-6 md:left-4 z-30 glass-panel rounded-2xl px-4 py-2.5 shadow-lg border border-white/80"
            style={{ transitionDelay: '720ms' }}
          >
            <p className="text-[11px] text-slate-500 leading-none">Fair-Trade Split</p>
            <p className="font-bold text-sm text-[#C85A32] mt-0.5">65% Direct to Student</p>
          </div>
        </div>
      </div>
    </section>
  );
};

