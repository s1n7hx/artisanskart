/**
 * ArtisansKart Theme JavaScript
 * Handles Mobile Menu Drawer, Lucide Icons hydration, Staggered Fade-in, and Interactive UI
 *
 * @package ArtisansKart
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Mobile Menu Toggle
    var mobileMenuBtn = document.getElementById('ak-mobile-menu-btn');
    var mobileDrawer = document.getElementById('ak-mobile-drawer');

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var isHidden = mobileDrawer.classList.contains('hidden');
            if (isHidden) {
                mobileDrawer.classList.remove('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
            } else {
                mobileDrawer.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on clicking outside
        document.addEventListener('click', function (e) {
            if (!mobileDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileDrawer.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 2. IntersectionObserver for .fade-in elements
    var fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0) {
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in-view');
                        }
                    });
                },
                { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
            );
            fadeElements.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            fadeElements.forEach(function (el) {
                el.classList.add('in-view');
            });
        }
    }

    // 3. Lucide Icons re-hydration if available
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
});
