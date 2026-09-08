<?php
/**
 * Template Name: Curated Collections Page
 * Description: Dedicated page template for curated student craft collections by medium and material.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <!-- Header -->
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-sage" style="margin-bottom:8px;">Curated Mediums &amp; Themes</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                Curated Student Collections
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                Explore themed collections shaped across student ceramic benches, watercolor ateliers, and botanical jewelry studios.
            </p>
        </div>

        <!-- 4 Curated Collection Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:32px;">
            <!-- Collection 1 -->
            <div class="card-hover" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="height:220px; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:20px;">
                        <img src="https://images.pexels.com/photos/7559739/pexels-photo-7559739.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800" alt="Clay & Terracotta Studio" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span class="badge-terracotta" style="margin-bottom:8px;">5 Handcrafted Items</span>
                    <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin:4px 0 10px 0;">Clay &amp; Terracotta Studio</h2>
                    <p style="font-size:14px; color:#64748b; line-height:1.6;">
                        Hand-thrown stoneware chai cups, carved terracotta planters, sun-baked earthen diyas, and ceramic wind chimes finished with natural earth glazes.
                    </p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:18px; margin-top:20px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:14px; font-weight:800; color:#1E293B;">From ₹349</span>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:8px 20px; font-size:13px;">
                        Explore Collection →
                    </a>
                </div>
            </div>

            <!-- Collection 2 -->
            <div class="card-hover" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="height:220px; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:20px;">
                        <img src="https://images.pexels.com/photos/159862/art-school-supplies-draw-159862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Hand-painted Greeting Cards & Bookmarks" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span class="badge-sage" style="margin-bottom:8px;">3 Handcrafted Items</span>
                    <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin:4px 0 10px 0;">Fine Art Cards &amp; Bookmarks</h2>
                    <p style="font-size:14px; color:#64748b; line-height:1.6;">
                        Original wildflower watercolors, intricate metallic gold mandala greetings, and sunset gradient silk-tassel bookmarks on 300 GSM cotton sheets.
                    </p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:18px; margin-top:20px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:14px; font-weight:800; color:#1E293B;">From ₹149</span>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:8px 20px; font-size:13px;">
                        Explore Collection →
                    </a>
                </div>
            </div>

            <!-- Collection 3 -->
            <div class="card-hover" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="height:220px; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:20px;">
                        <img src="https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Beaded & Polymer Accessories" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span class="badge-terracotta" style="margin-bottom:8px;">3 Handcrafted Items</span>
                    <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin:4px 0 10px 0;">Beaded &amp; Polymer Accessories</h2>
                    <p style="font-size:14px; color:#64748b; line-height:1.6;">
                        Braided macrame wristlets, glass seed bead boho bracelets, and delicate oven-baked polymer clay daisy dangles designed by fashion students.
                    </p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:18px; margin-top:20px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:14px; font-weight:800; color:#1E293B;">From ₹199</span>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:8px 20px; font-size:13px;">
                        Explore Collection →
                    </a>
                </div>
            </div>

            <!-- Collection 4 -->
            <div class="card-hover" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="height:220px; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:20px;">
                        <img src="https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Handcrafted Keychains & Keepsakes" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span class="badge-sage" style="margin-bottom:8px;">2 Handcrafted Items</span>
                    <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin:4px 0 10px 0;">Handmade Keepsakes &amp; Keychains</h2>
                    <p style="font-size:14px; color:#64748b; line-height:1.6;">
                        Wood-burned birch slices engraved with student pyrography, and crystal UV resin key holders enclosing real pressed wildflower petals.
                    </p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:18px; margin-top:20px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:14px; font-weight:800; color:#1E293B;">From ₹179</span>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:8px 20px; font-size:13px;">
                        Explore Collection →
                    </a>
                </div>
            </div>
        </div>
    </div>
</main>
<?php
get_footer();
