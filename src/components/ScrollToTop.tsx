import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Trigger IntersectionObserver for fade-in animations on newly mounted route
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.fade-in');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      elements.forEach((el) => {
        // If element is already in view on load, show it
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add('in-view');
        } else {
          observer.observe(el);
        }
      });

      return () => observer.disconnect();
    }, 60);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};
