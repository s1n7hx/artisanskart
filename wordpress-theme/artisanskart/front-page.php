<?php
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

        <!-- Marquee Row 1 (Sliding Left) -->
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

            <!-- 4 Featured Cards Grid -->
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
