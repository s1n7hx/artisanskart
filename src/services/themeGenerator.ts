import JSZip from 'jszip';
import { Product } from '../types';
import { PRODUCTS } from '../data';

export async function generateClientThemeZip(products: Product[]): Promise<Blob> {
  const zip = new JSZip();
  const theme = zip.folder('artisanskart');

  if (!theme) throw new Error('Failed to create theme folder');

  const allProducts = products && products.length > 0 ? products : PRODUCTS;

  // 1. style.css - Version 2.2.0 Multi-Page Theme
  const styleCss = `/*
Theme Name: ArtisansKart
Theme URI: https://artisanskart.in
Author: ArtisansKart Studio
Author URI: https://artisanskart.in
Description: A modern, handcrafted goods marketplace multi-page WordPress theme with distinct templates for Home, Shop, Collections, How It Works, About Us, Maker Portal, and Contact.
Version: 2.2.0
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: artisanskart
Tags: e-commerce, custom-colors, custom-logo, custom-menu, featured-images, full-width-template, theme-options, grid-layout
*/

@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --canvas: #FAF9F6;
  --terracotta: #C85A32;
  --terracotta-dark: #A9481F;
  --sage: #8A9A86;
  --sage-dark: #62725e;
  --slate: #1E293B;
  --border-color: #E7E0D8;
  --card-bg: #FFFFFF;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: var(--canvas);
  color: var(--slate);
  font-family: 'Kanit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
}

.ak-container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

@media (min-width: 640px) {
  .ak-container {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

h1, h2, h3, h4, h5, h6 {
  color: var(--slate);
  font-weight: 800;
  line-height: 1.15;
  margin-top: 0;
}

.hero-heading {
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: #1E293B;
}

.btn-terracotta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--terracotta);
  color: #ffffff !important;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.85rem 1.75rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(200, 90, 50, 0.35);
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  text-decoration: none;
}

.btn-terracotta:hover {
  background: var(--terracotta-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(200, 90, 50, 0.45);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #ffffff;
  color: var(--slate);
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.85rem 1.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
}

.btn-outline:hover {
  background: #f1ede8;
  border-color: #d1c5bb;
  transform: translateY(-2px);
}

.badge-sage {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #EEF3EE;
  color: var(--sage-dark);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  border: 1px solid #DCE6DC;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-terracotta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #FDF2EE;
  color: var(--terracotta);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  border: 1px solid #F7DCD2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-hover {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 36px -10px rgba(30, 41, 59, 0.12);
  border-color: #D9C6BB;
}

/* Sliding Marquee Styles */
@keyframes ak-marquee-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes ak-marquee-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

@keyframes ak-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.marquee-container {
  display: flex;
  overflow: hidden;
  user-select: none;
  width: 100%;
  padding: 12px 0;
}

.marquee-container:hover .marquee-track-left,
.marquee-container:hover .marquee-track-right {
  animation-play-state: paused;
}

.marquee-track-left {
  display: flex;
  flex-shrink: 0;
  gap: 20px;
  animation: ak-marquee-left 32s linear infinite;
  will-change: transform;
}

.marquee-track-right {
  display: flex;
  flex-shrink: 0;
  gap: 20px;
  animation: ak-marquee-right 36s linear infinite;
  will-change: transform;
}

.marquee-card {
  flex-shrink: 0;
  width: 260px;
  background: #ffffff;
  border-radius: 20px;
  padding: 12px;
  margin: 0 10px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.marquee-card:hover {
  transform: scale(1.04);
}

.floating-badge {
  animation: ak-float 4s ease-in-out infinite;
}

/* Tab filter button styling */
.filter-btn {
  padding: 8px 18px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid #E7E0D8;
  background: #FAF9F6;
  color: #1E293B;
  transition: all 0.2s ease;
}

.filter-btn.active, .filter-btn:hover {
  background: #1E293B;
  color: #ffffff;
  border-color: #1E293B;
}

/* Modal Popup */
.ak-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.ak-modal-overlay.open {
  display: flex;
}

.ak-modal-box {
  background: #ffffff;
  border-radius: 24px;
  max-width: 780px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
  position: relative;
  animation: ak-modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes ak-modal-in {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}

/* Nav Menu Links */
.ak-nav-link {
  color: #1E293B;
  font-weight: 700;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.ak-nav-link:hover, .ak-nav-link.active {
  color: #C85A32;
  background: #FDF2EE;
}
`;

  // 2. header.php
  const headerPhp = `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site" style="min-height:100vh; display:flex; flex-direction:column;">
    <header id="masthead" class="site-header" style="position:sticky; top:0; z-index:50; background:rgba(250,249,246,0.96); backdrop-filter:blur(10px); border-bottom:1px solid #E7E0D8;">
        <div class="ak-container" style="display:flex; align-items:center; justify-content:space-between; height:74px;">
            <a href="<?php echo esc_url(home_url('/')); ?>" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
                <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, #C85A32, #A9481F); color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:22px; box-shadow:0 4px 10px rgba(200,90,50,0.3);">
                    A
                </div>
                <div>
                    <span style="font-size:22px; font-weight:900; color:#1E293B; line-height:1; display:block; letter-spacing:-0.02em;">
                        ArtisansKart
                    </span>
                    <span style="font-size:10px; font-weight:700; color:#C85A32; text-transform:uppercase; letter-spacing:0.06em;">Student Artisan Marketplace</span>
                </div>
            </a>

            <nav id="site-navigation" class="main-navigation" style="display:flex; gap:8px; font-weight:700; font-size:14px; align-items:center;">
                <?php
                if (has_nav_menu('primary')) {
                    wp_nav_menu([
                        'theme_location' => 'primary',
                        'menu_id'        => 'primary-menu',
                        'container'      => false,
                        'menu_class'     => 'ak-nav-menu',
                        'fallback_cb'    => false,
                    ]);
                } else {
                ?>
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="ak-nav-link <?php echo is_front_page() ? 'active' : ''; ?>">Home</a>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="ak-nav-link <?php echo is_page('shop') || is_page('marketplace') ? 'active' : ''; ?>">Shop Marketplace</a>
                    <a href="<?php echo esc_url(home_url('/collections/')); ?>" class="ak-nav-link <?php echo is_page('collections') ? 'active' : ''; ?>">Collections</a>
                    <a href="<?php echo esc_url(home_url('/how-it-works/')); ?>" class="ak-nav-link <?php echo is_page('how-it-works') ? 'active' : ''; ?>">How It Works</a>
                    <a href="<?php echo esc_url(home_url('/about/')); ?>" class="ak-nav-link <?php echo is_page('about') || is_page('about-us') ? 'active' : ''; ?>">Our Story</a>
                    <a href="<?php echo esc_url(home_url('/maker-portal/')); ?>" class="ak-nav-link <?php echo is_page('maker-portal') || is_page('maker') ? 'active' : ''; ?>">Maker Portal</a>
                <?php } ?>
            </nav>

            <div style="display:flex; align-items:center; gap:12px;">
                <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:9px 20px; font-size:13px;">
                    Explore Shop →
                </a>
            </div>
        </div>
    </header>
`;

  // 3. footer.php
  const footerPhp = `    <footer id="colophon" style="background:#1E293B; color:#ffffff; padding:64px 0 32px 0; margin-top:auto;">
        <div class="ak-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:48px;">
            <div>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    <div style="width:36px; height:36px; border-radius:10px; background:#C85A32; color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:18px;">
                        A
                    </div>
                    <h3 style="font-size:22px; font-weight:900; color:#ffffff; margin:0;">ArtisansKart</h3>
                </div>
                <p style="font-size:13px; color:#94a3b8; line-height:1.7;">
                    A nationwide handmade craft marketplace empowering school students and young artisans to showcase their creative talents and fund their education.
                </p>
            </div>
            <div>
                <h4 style="font-size:14px; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:18px;">Navigation Pages</h4>
                <div style="display:flex; flex-direction:column; gap:10px; font-size:13px; color:#cbd5e1;">
                    <a href="<?php echo esc_url(home_url('/')); ?>" style="color:#cbd5e1;">Homepage</a>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" style="color:#cbd5e1;">Shop Marketplace (13+ Crafts)</a>
                    <a href="<?php echo esc_url(home_url('/collections/')); ?>" style="color:#cbd5e1;">Curated Collections</a>
                    <a href="<?php echo esc_url(home_url('/how-it-works/')); ?>" style="color:#cbd5e1;">How It Works &amp; Process</a>
                    <a href="<?php echo esc_url(home_url('/about/')); ?>" style="color:#cbd5e1;">Our Story &amp; Mission</a>
                    <a href="<?php echo esc_url(home_url('/maker-portal/')); ?>" style="color:#cbd5e1;">Student Maker Portal</a>
                    <a href="<?php echo esc_url(home_url('/contact/')); ?>" style="color:#cbd5e1;">Contact &amp; Custom Orders</a>
                </div>
            </div>
            <div>
                <h4 style="font-size:14px; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:18px;">Student Creator Pledge</h4>
                <p style="font-size:13px; color:#cbd5e1; line-height:1.7;">
                    65% of all proceeds go directly into verified student creator accounts. Every piece is 100% made to order with plastic-free, recyclable packaging.
                </p>
            </div>
        </div>
        <div class="ak-container" style="border-top:1px solid #334155; margin-top:48px; padding-top:24px; font-size:13px; color:#94a3b8; display:flex; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <span>&copy; <?php echo date('Y'); ?> ArtisansKart.in • Handcrafted with Pride by Student Creators across India</span>
            <span>Crafted for Student Entrepreneurs</span>
        </div>
    </footer>

    <!-- Interactive Craft Quick-View Modal -->
    <div id="craftModal" class="ak-modal-overlay" onclick="closeCraftModal(event)">
        <div class="ak-modal-box" onclick="event.stopPropagation()">
            <div style="position:absolute; top:16px; right:16px; z-index:10;">
                <button onclick="closeCraftModalDirect()" style="width:36px; height:36px; border-radius:50%; background:#f1ede8; border:none; cursor:pointer; font-size:18px; font-weight:900; display:flex; align-items:center; justify-content:center;">✕</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; padding:28px;">
                <div>
                    <img id="modalImg" src="" alt="Craft" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:18px; border:1px solid #E7E0D8;">
                </div>
                <div style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <span id="modalCat" class="badge-sage" style="margin-bottom:8px;">Clay Crafts</span>
                        <h2 id="modalTitle" style="font-size:24px; font-weight:900; margin:6px 0 10px 0; color:#1E293B;"></h2>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; font-size:13px; color:#64748b;">
                            <span style="color:#f59e0b; font-weight:800;">★ 4.9</span>
                            <span>•</span>
                            <span id="modalMaker" style="font-weight:700; color:#C85A32;"></span>
                            <span>•</span>
                            <span id="modalSchool"></span>
                        </div>
                        <p id="modalDesc" style="font-size:14px; color:#475569; line-height:1.7; margin-bottom:20px;"></p>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                        <div>
                            <span style="font-size:11px; color:#8A9A86; font-weight:700; display:block;">Direct Student Price</span>
                            <span id="modalPrice" style="font-size:26px; font-weight:900; color:#1E293B;">₹349</span>
                        </div>
                        <button onclick="alert('Thank you for supporting student creators! Your on-demand order inquiry has been initiated.')" class="btn-terracotta" style="padding:10px 24px;">
                            Order on Demand →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
const CRAFTS_DATA = ${JSON.stringify(allProducts)};

function filterCrafts(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.product-craft-card');
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'All' || cardCat === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function searchCrafts(input) {
    const q = input.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.product-craft-card');
    cards.forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const maker = (card.getAttribute('data-maker') || '').toLowerCase();
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        if (!q || title.includes(q) || maker.includes(q) || cat.includes(q)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function openCraftModal(id) {
    const item = CRAFTS_DATA.find(p => p.id === id) || CRAFTS_DATA[0];
    if (!item) return;

    document.getElementById('modalImg').src = item.image;
    document.getElementById('modalCat').innerText = item.category;
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalMaker').innerText = '🎨 ' + (item.maker || 'Student Maker');
    document.getElementById('modalSchool').innerText = (item.cls || 'Class 10') + ', ' + (item.school || 'Campus Studio');
    document.getElementById('modalDesc').innerText = item.description;
    document.getElementById('modalPrice').innerText = '₹' + item.price;

    document.getElementById('craftModal').classList.add('open');
}

function closeCraftModal(e) {
    document.getElementById('craftModal').classList.remove('open');
}

function closeCraftModalDirect() {
    document.getElementById('craftModal').classList.remove('open');
}
</script>

<?php wp_footer(); ?>
</body>
</html>
`;

  // 4. Products cards HTML
  const productsLoop = allProducts.map(p => `
    <article class="card-hover product-craft-card" data-category="${p.category}" data-title="${p.title.replace(/"/g, '&quot;')}" data-maker="${(p.maker || '').replace(/"/g, '&quot;')}" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(${p.id})">
        <div>
            <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                <img src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">
                <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">
                    ${p.category}
                </span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 ${p.maker} (${p.cls})</span>
                <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
            </div>
            <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">${p.title}</h3>
            <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">
                ${p.description}
            </p>
        </div>
        <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
            <div>
                <span style="font-size:18px; font-weight:900; color:#1E293B;">₹${p.price}</span>
                <span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span>
            </div>
            <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(${p.id})">
                Quick View
            </button>
        </div>
    </article>
  `).join('\n');

  // 5. front-page.php - Elegant Homepage (Hero + Marquee + Featured 4 + Impact Banner)
  const frontPagePhp = `<?php
/**
 * Template Name: Home Page (Front Page)
 * Description: Dedicated homepage template with Hero Collage, Sliding Marquee, Featured Showcase, and Student-First impact banner.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main">
    <!-- 1. HERO SECTION WITH 3-PIECE PHOTOGRAPHY COLLAGE -->
    <section id="hero" style="padding:60px 0 70px 0; background:radial-gradient(circle at 15% 20%, rgba(200,90,50,0.09), transparent 45%), radial-gradient(circle at 85% 75%, rgba(138,154,134,0.14), transparent 50%); position:relative; overflow:hidden;">
        <div class="ak-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:56px; align-items:center;">
            <!-- Left Headline Column -->
            <div style="z-index:2;">
                <span class="badge-sage" style="margin-bottom:16px;">
                    ✨ Handcrafted by Student Artisans
                </span>
                <h1 class="hero-heading" style="font-size:clamp(40px, 5.5vw, 68px); margin-bottom:20px; font-weight:900;">
                    Crafted by<br>
                    <span style="color:#C85A32;">Students,</span><br>
                    Loved by You
                </h1>
                <p style="font-size:18px; color:#475569; margin-bottom:32px; max-width:480px; line-height:1.65;">
                    Discover one-of-a-kind clay crafts, hand-painted cards, accessories &amp; keychains — every purchase directly funds a student creator's dream.
                </p>
                <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:44px;">
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta">
                        Explore Student Shop →
                    </a>
                    <a href="<?php echo esc_url(home_url('/how-it-works/')); ?>" class="btn-outline">
                        How It Works
                    </a>
                </div>
                <!-- Trust & Metric Counters -->
                <div style="display:flex; gap:36px; flex-wrap:wrap; border-top:1px solid #E7E0D8; padding-top:28px;">
                    <div>
                        <p style="font-size:32px; font-weight:900; color:#C85A32; margin:0;">65%</p>
                        <p style="font-size:12px; color:#64748b; margin:0; font-weight:700;">Direct Maker Share</p>
                    </div>
                    <div>
                        <p style="font-size:32px; font-weight:900; color:#8A9A86; margin:0;">100%</p>
                        <p style="font-size:12px; color:#64748b; margin:0; font-weight:700;">Made to Order</p>
                    </div>
                    <div>
                        <p style="font-size:32px; font-weight:900; color:#1E293B; margin:0;">100%</p>
                        <p style="font-size:12px; color:#64748b; margin:0; font-weight:700;">Verified Students</p>
                    </div>
                </div>
            </div>

            <!-- Right 3-Piece Photography Collage with Floating Badges -->
            <div style="position:relative; min-height:440px; display:flex; align-items:center; justify-content:center;">
                <!-- Left Card (Fine Art & Cards) -->
                <div style="position:absolute; left:0; width:190px; height:260px; border-radius:24px; overflow:hidden; transform:rotate(-8deg) translateY(-10px); box-shadow:0 20px 35px rgba(0,0,0,0.15); border:3px solid #fff; z-index:1;">
                    <img src="https://images.pexels.com/photos/4006576/pexels-photo-4006576.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Fine Art Cards" style="width:100%; height:100%; object-fit:cover;">
                    <span style="position:absolute; bottom:12px; left:10px; background:rgba(30,41,59,0.9); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">
                        🎨 Fine Art Cards
                    </span>
                </div>

                <!-- Center Main Pottery Showcase Card -->
                <div style="position:relative; width:280px; height:370px; border-radius:32px; overflow:hidden; box-shadow:0 30px 60px -15px rgba(30,41,59,0.3); border:4px solid #ffffff; z-index:2;">
                    <img src="https://images.pexels.com/photos/7559739/pexels-photo-7559739.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" alt="Clay craft pottery" style="width:100%; height:100%; object-fit:cover;">
                    <span style="position:absolute; bottom:18px; left:16px; background:#1E293B; color:#ffffff; font-size:11px; font-weight:800; padding:5px 14px; border-radius:9999px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">
                        🔥 Live Wheel Pottery
                    </span>
                </div>

                <!-- Right Card (Handmade Accessories) -->
                <div style="position:absolute; right:0; width:190px; height:260px; border-radius:24px; overflow:hidden; transform:rotate(8deg) translateY(15px); box-shadow:0 20px 35px rgba(0,0,0,0.15); border:3px solid #fff; z-index:1;">
                    <img src="https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Accessories" style="width:100%; height:100%; object-fit:cover;">
                    <span style="position:absolute; bottom:12px; left:10px; background:rgba(30,41,59,0.9); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">
                        ✨ Handcrafted Accessories
                    </span>
                </div>

                <!-- Floating Zero Machine Copies Badge -->
                <div class="floating-badge" style="position:absolute; bottom:-10px; left:20px; background:#ffffff; border:1px solid #E7E0D8; border-radius:18px; padding:10px 16px; box-shadow:0 12px 30px rgba(0,0,0,0.1); z-index:4; display:flex; align-items:center; gap:10px;">
                    <span style="width:24px; height:24px; border-radius:50%; background:#dcfce7; color:#16a34a; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:12px;">✓</span>
                    <div>
                        <span style="font-size:11px; font-weight:800; color:#1E293B; display:block;">Zero Machine Copies</span>
                        <span style="font-size:10px; color:#64748b;">100% Student Handcrafted</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 2. SLIDING PHOTOS MARQUEE SECTION -->
    <section style="padding:40px 0 48px 0; background:#FAF9F6; border-top:1px solid #E7E0D8; border-bottom:1px solid #E7E0D8; overflow:hidden;">
        <div class="ak-container" style="text-align:center; margin-bottom:20px;">
            <span class="badge-sage" style="margin-bottom:6px;">Live Student Studio Showcase</span>
            <h2 style="font-size:24px; font-weight:900; margin:0;">Handmade Pieces Fresh from Campus Workbenches</h2>
        </div>

        <div class="marquee-container">
            <div class="marquee-track-left">
                <div class="marquee-card" onclick="location.href='<?php echo esc_url(home_url('/shop/')); ?>'">
                    <div style="width:100%; height:140px; border-radius:14px; overflow:hidden; margin-bottom:8px;">
                        <img src="https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Terracotta Diya Set" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">Clay Crafts</span>
                        <span style="font-size:13px; font-weight:900; color:#1E293B;">₹349</span>
                    </div>
                    <p style="font-size:12px; font-weight:800; margin:2px 0 0 0; color:#1E293B;">Terracotta Diya Set</p>
                    <span style="font-size:10px; color:#64748b;">by Sakib Ansari (Class 10)</span>
                </div>
                <div class="marquee-card" onclick="location.href='<?php echo esc_url(home_url('/shop/')); ?>'">
                    <div style="width:100%; height:140px; border-radius:14px; overflow:hidden; margin-bottom:8px;">
                        <img src="https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Ceramic Vase" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">Clay Crafts</span>
                        <span style="font-size:13px; font-weight:900; color:#1E293B;">₹899</span>
                    </div>
                    <p style="font-size:12px; font-weight:800; margin:2px 0 0 0; color:#1E293B;">Ceramic Vase</p>
                    <span style="font-size:10px; color:#64748b;">by Meera Nair (Class 12)</span>
                </div>
                <div class="marquee-card" onclick="location.href='<?php echo esc_url(home_url('/shop/')); ?>'">
                    <div style="width:100%; height:140px; border-radius:14px; overflow:hidden; margin-bottom:8px;">
                        <img src="https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Clay Owl Planter" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">Clay Crafts</span>
                        <span style="font-size:13px; font-weight:900; color:#1E293B;">₹499</span>
                    </div>
                    <p style="font-size:12px; font-weight:800; margin:2px 0 0 0; color:#1E293B;">Clay Owl Planter</p>
                    <span style="font-size:10px; color:#64748b;">by Arjun Verma (Class 9)</span>
                </div>
                <div class="marquee-card" onclick="location.href='<?php echo esc_url(home_url('/shop/')); ?>'">
                    <div style="width:100%; height:140px; border-radius:14px; overflow:hidden; margin-bottom:8px;">
                        <img src="https://images.pexels.com/photos/159862/art-school-supplies-draw-159862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Floral Watercolor Card" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">Cards</span>
                        <span style="font-size:13px; font-weight:900; color:#1E293B;">₹199</span>
                    </div>
                    <p style="font-size:12px; font-weight:800; margin:2px 0 0 0; color:#1E293B;">Floral Watercolor Card</p>
                    <span style="font-size:10px; color:#64748b;">by Ananya Sharma (Class 11)</span>
                </div>
            </div>
        </div>
    </section>

    <!-- 3. FEATURED CURATED CRAFTS (HIGHLIGHTS ONLY) -->
    <section style="padding:70px 0; background:#ffffff;">
        <div class="ak-container">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:20px; margin-bottom:36px;">
                <div>
                    <span class="badge-terracotta" style="margin-bottom:8px;">Handpicked Campus Creations</span>
                    <h2 style="font-size:34px; font-weight:900; margin:0; color:#1E293B;">Featured Student Crafts</h2>
                </div>
                <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta">
                    View Full Catalog (13+ Crafts) →
                </a>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:24px;">
                <div class="card-hover" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px;">
                            <img src="https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Terracotta Diya Set" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Sakib Ansari (Class 10)</span>
                        <h3 style="font-size:17px; font-weight:800; margin:4px 0 6px 0; color:#1E293B;">Terracotta Diya Set of 6</h3>
                        <p style="font-size:12px; color:#64748b; line-height:1.5;">Hand-pinched earthen diyas with natural ochre pigments and fine engravings.</p>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between; margin-top:12px;">
                        <span style="font-size:18px; font-weight:900; color:#1E293B;">₹349</span>
                        <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-outline" style="padding:6px 14px; font-size:12px;">View Craft</a>
                    </div>
                </div>

                <div class="card-hover" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px;">
                            <img src="https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Ceramic Vase" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Meera Nair (Class 12)</span>
                        <h3 style="font-size:17px; font-weight:800; margin:4px 0 6px 0; color:#1E293B;">Hand-thrown Ceramic Vase</h3>
                        <p style="font-size:12px; color:#64748b; line-height:1.5;">Wheel-thrown speckled stoneware vase with matte sage glaze finish.</p>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between; margin-top:12px;">
                        <span style="font-size:18px; font-weight:900; color:#1E293B;">₹899</span>
                        <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-outline" style="padding:6px 14px; font-size:12px;">View Craft</a>
                    </div>
                </div>

                <div class="card-hover" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px;">
                            <img src="https://images.pexels.com/photos/159862/art-school-supplies-draw-159862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Watercolor Card" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Ananya Sharma (Class 11)</span>
                        <h3 style="font-size:17px; font-weight:800; margin:4px 0 6px 0; color:#1E293B;">Botanical Watercolor Card</h3>
                        <p style="font-size:12px; color:#64748b; line-height:1.5;">Cold-pressed cotton paper card with wildflower watercolor illustration.</p>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between; margin-top:12px;">
                        <span style="font-size:18px; font-weight:900; color:#1E293B;">₹199</span>
                        <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-outline" style="padding:6px 14px; font-size:12px;">View Craft</a>
                    </div>
                </div>

                <div class="card-hover" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px;">
                            <img src="https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Beaded Bracelet" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Tanvi Joshi (Class 10)</span>
                        <h3 style="font-size:17px; font-weight:800; margin:4px 0 6px 0; color:#1E293B;">Boho Beaded Bracelet</h3>
                        <p style="font-size:12px; color:#64748b; line-height:1.5;">Hand-strung glass seed beads with adjustable braided macrame cord.</p>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between; margin-top:12px;">
                        <span style="font-size:18px; font-weight:900; color:#1E293B;">₹279</span>
                        <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-outline" style="padding:6px 14px; font-size:12px;">View Craft</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 4. IMPACT PROMISE BANNER -->
    <section style="padding:60px 0; background:#FAF9F6; border-top:1px solid #E7E0D8;">
        <div class="ak-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:36px; align-items:center;">
            <div>
                <span class="badge-sage" style="margin-bottom:12px;">Our Student-First Model</span>
                <h2 style="font-size:32px; font-weight:900; color:#1E293B; line-height:1.2;">Every Purchase Funds a Student's Future</h2>
                <p style="font-size:15px; color:#475569; line-height:1.7; margin-top:12px;">
                    Unlike mass-produced marketplaces, ArtisansKart is built to empower school students and young artisans directly. 65% of every transaction is deposited directly into the creator's education fund.
                </p>
                <div style="margin-top:24px;">
                    <a href="<?php echo esc_url(home_url('/about/')); ?>" class="btn-outline">
                        Read Our Full Story →
                    </a>
                </div>
            </div>
            <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:24px; padding:32px; box-shadow:0 10px 25px rgba(0,0,0,0.04);">
                <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
                    <div style="width:48px; height:48px; border-radius:14px; background:#FDF2EE; color:#C85A32; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900;">
                        🎓
                    </div>
                    <div>
                        <h4 style="font-size:16px; font-weight:800; margin:0; color:#1E293B;">School Partner Studios</h4>
                        <p style="font-size:12px; color:#64748b; margin:0;">Active across 40+ schools in India</p>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
                    <div style="width:48px; height:48px; border-radius:14px; background:#EEF3EE; color:#8A9A86; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900;">
                        📦
                    </div>
                    <div>
                        <h4 style="font-size:16px; font-weight:800; margin:0; color:#1E293B;">100% Plastic-Free</h4>
                        <p style="font-size:12px; color:#64748b; margin:0;">Hand-packaged with recyclable papers</p>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:16px;">
                    <div style="width:48px; height:48px; border-radius:14px; background:#F1EDE8; color:#1E293B; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900;">
                        ✨
                    </div>
                    <div>
                        <h4 style="font-size:16px; font-weight:800; margin:0; color:#1E293B;">Zero Machine Copies</h4>
                        <p style="font-size:12px; color:#64748b; margin:0;">Each piece is individually handcrafted</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>
<?php
get_footer();
`;

  // 6. page-shop.php - Dedicated Shop / Marketplace Template
  const pageShopPhp = `<?php
/**
 * Template Name: Shop / Marketplace Page
 * Description: Dedicated full catalog page for all 13 handcrafted student crafts with live category filters, search, and Quick View.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#ffffff; min-height:85vh;">
    <div class="ak-container">
        <div style="text-align:center; max-width:680px; margin:0 auto 40px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Campus Artisan Catalog</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                Handcrafted Student Shop
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                Browse unique clay pottery, watercolor greeting cards, beaded jewelry, and custom keychains crafted by student creators across India.
            </p>
        </div>

        <div style="background:#FAF9F6; border:1px solid #E7E0D8; border-radius:24px; padding:20px; margin-bottom:36px; display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:space-between;">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="filter-btn active" onclick="filterCrafts('All', this)">All Crafts (${allProducts.length})</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Clay Crafts', this)">Clay Crafts</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Hand-painted Cards', this)">Hand-painted Cards</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Accessories', this)">Accessories</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Keychains', this)">Keychains</button>
            </div>

            <div style="position:relative; width:100%; max-width:280px;">
                <input type="text" placeholder="Search craft or student..." oninput="searchCrafts(this)" style="width:100%; padding:10px 18px; border-radius:9999px; border:1px solid #E7E0D8; background:#ffffff; font-size:13px; outline:none; font-family:inherit;">
            </div>
        </div>

        <div id="craftsGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:24px;">
            ${productsLoop}
        </div>
    </div>
</main>
<?php
get_footer();
`;

  // 7. functions.php
  const functionsPhp = `<?php
/**
 * ArtisansKart Theme Functions & Automated Page Generator
 *
 * @package ArtisansKart
 * @version 2.2.0
 */

function artisanskart_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
    add_theme_support('woocommerce');
    
    register_nav_menus([
        'primary' => __('Primary Menu', 'artisanskart'),
        'footer'  => __('Footer Menu', 'artisanskart'),
    ]);
}
add_action('after_setup_theme', 'artisanskart_theme_setup');

function artisanskart_enqueue_scripts() {
    wp_enqueue_style('artisanskart-google-fonts', 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&display=swap', [], null);
    wp_enqueue_style('artisanskart-style', get_stylesheet_uri(), ['artisanskart-google-fonts'], '2.2.0');
}
add_action('wp_enqueue_scripts', 'artisanskart_enqueue_scripts');

function artisanskart_create_starter_pages() {
    $starter_pages = [
        ['title' => 'Shop Marketplace', 'slug' => 'shop', 'template' => 'page-shop.php'],
        ['title' => 'Curated Collections', 'slug' => 'collections', 'template' => 'page-collections.php'],
        ['title' => 'How It Works', 'slug' => 'how-it-works', 'template' => 'page-how-it-works.php'],
        ['title' => 'Our Story & About', 'slug' => 'about', 'template' => 'page-about.php'],
        ['title' => 'Student Maker Portal', 'slug' => 'maker-portal', 'template' => 'page-maker.php'],
        ['title' => 'Contact & Custom Inquiries', 'slug' => 'contact', 'template' => 'page-contact.php'],
    ];

    foreach ($starter_pages as $page_info) {
        $existing = get_page_by_path($page_info['slug']);
        if (!$existing) {
            $page_id = wp_insert_post([
                'post_title'     => $page_info['title'],
                'post_name'      => $page_info['slug'],
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'post_content'   => '',
                'comment_status' => 'closed',
            ]);
            if ($page_id && !is_wp_error($page_id)) {
                update_post_meta($page_id, '_wp_page_template', $page_info['template']);
            }
        }
    }
}
add_action('after_switch_theme', 'artisanskart_create_starter_pages');

function artisanskart_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}
add_action('rest_api_init', 'artisanskart_cors_headers', 15);
`;

  // Write all files to the ZIP archive
  theme.file('style.css', styleCss);
  theme.file('header.php', headerPhp);
  theme.file('footer.php', footerPhp);
  theme.file('front-page.php', frontPagePhp);
  theme.file('index.php', frontPagePhp);
  theme.file('page-shop.php', pageShopPhp);
  theme.file('page-marketplace.php', pageShopPhp);
  theme.file('functions.php', functionsPhp);

  // Read existing templates from filesystem if available
  const collectionsPhp = `<?php
/**
 * Template Name: Curated Collections Page
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-sage" style="margin-bottom:8px;">Curated Mediums &amp; Themes</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">Curated Student Collections</h1>
            <p style="font-size:16px; color:#64748b;">Explore themed collections shaped across student ceramic benches, watercolor ateliers, and botanical jewelry studios.</p>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:32px;">
            <div class="card-hover" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="height:220px; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:20px;">
                        <img src="https://images.pexels.com/photos/7559739/pexels-photo-7559739.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" alt="Clay & Terracotta Studio" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span class="badge-terracotta">5 Handcrafted Items</span>
                    <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin:8px 0;">Clay &amp; Terracotta Studio</h2>
                    <p style="font-size:14px; color:#64748b; line-height:1.6;">Hand-thrown stoneware chai cups, carved terracotta planters, sun-baked earthen diyas, and ceramic wind chimes.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:18px; margin-top:20px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:14px; font-weight:800; color:#1E293B;">From ₹349</span>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:8px 20px; font-size:13px;">Explore Collection →</a>
                </div>
            </div>
            <div class="card-hover" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="height:220px; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:20px;">
                        <img src="https://images.pexels.com/photos/159862/art-school-supplies-draw-159862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Fine Art Cards" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span class="badge-sage">3 Handcrafted Items</span>
                    <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin:8px 0;">Fine Art Cards &amp; Bookmarks</h2>
                    <p style="font-size:14px; color:#64748b; line-height:1.6;">Original wildflower watercolors, intricate metallic gold mandala greetings, and sunset gradient bookmarks.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:18px; margin-top:20px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:14px; font-weight:800; color:#1E293B;">From ₹149</span>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:8px 20px; font-size:13px;">Explore Collection →</a>
                </div>
            </div>
        </div>
    </div>
</main>
<?php get_footer(); ?>`;

  const howItWorksPhp = `<?php
/**
 * Template Name: How It Works Page
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Transparent 5-Step Model</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">How ArtisansKart Works</h1>
            <p style="font-size:16px; color:#64748b;">From the student's campus workbench to your home — here is how every piece is crafted, verified, and delivered with love.</p>
        </div>
        <div style="max-width:860px; margin:0 auto; display:flex; flex-direction:column; gap:24px;">
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#FDF2EE; color:#C85A32; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">1</div>
                <div>
                    <span class="badge-sage">Campus Workshop</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">Student Crafts On Demand</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">When you place an order, the student artisan is notified immediately to handcraft the piece in their school studio.</p>
                </div>
            </div>
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#EEF3EE; color:#8A9A86; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">2</div>
                <div>
                    <span class="badge-terracotta">Quality Inspection</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">Studio Mentor Verification</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">Art teachers and campus studio leads inspect durability, glazes, and quality before packaging.</p>
                </div>
            </div>
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#F1EDE8; color:#1E293B; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">3</div>
                <div>
                    <span class="badge-sage">100% Plastic-Free</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">Eco-Friendly Hand-Wrapping</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">Every item is cushioned in recycled kraft paper, tied with jute twine, and packed with a handwritten note.</p>
                </div>
            </div>
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#FDF2EE; color:#C85A32; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">4</div>
                <div>
                    <span class="badge-terracotta">Direct Impact</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">65% Direct Student Payout</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">65% of the purchase price is deposited directly to the student maker for tuition and craft supplies.</p>
                </div>
            </div>
        </div>
    </div>
</main>
<?php get_footer(); ?>`;

  const aboutPhp = `<?php
/**
 * Template Name: About Us Page
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <div style="text-align:center; max-width:720px; margin:0 auto 48px auto;">
            <span class="badge-sage" style="margin-bottom:8px;">Our Purpose &amp; Mission</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">Empowering India's Young Creators</h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">ArtisansKart was founded with one clear conviction: talented student artists deserve a direct platform to monetize their skills and fund their education.</p>
        </div>
        <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:48px 36px; text-align:center; max-width:860px; margin:0 auto 48px auto;">
            <span style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#C85A32;">The ArtisansKart Pledge</span>
            <blockquote style="font-size:clamp(20px, 2.5vw, 26px); font-weight:900; color:#1E293B; margin:16px 0; line-height:1.4;">"Every child is an artist. We turn classroom sketches, pottery projects, and weekend handcrafts into real, sustainable entrepreneurial journeys."</blockquote>
        </div>
    </div>
</main>
<?php get_footer(); ?>`;

  const makerPhp = `<?php
/**
 * Template Name: Student Maker Portal
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Student Creators Guild</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">Student Maker Portal</h1>
            <p style="font-size:16px; color:#64748b;">Join ArtisansKart to showcase your creations to art lovers across India.</p>
        </div>
    </div>
</main>
<?php get_footer(); ?>`;

  const contactPhp = `<?php
/**
 * Template Name: Contact Page
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-sage" style="margin-bottom:8px;">Get in Touch</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">Contact &amp; Custom Inquiries</h1>
            <p style="font-size:16px; color:#64748b;">Have a question about an order or looking for custom crafts? We would love to hear from you.</p>
        </div>
    </div>
</main>
<?php get_footer(); ?>`;

  theme.file('page-collections.php', collectionsPhp);
  theme.file('page-how-it-works.php', howItWorksPhp);
  theme.file('page-about.php', aboutPhp);
  theme.file('page-maker.php', makerPhp);
  theme.file('page-contact.php', contactPhp);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
