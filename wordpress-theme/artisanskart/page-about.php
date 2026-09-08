<?php
/**
 * Template Name: About Us Page
 * Description: Dedicated page template for ArtisansKart story, student creator manifesto, and school studio partnerships.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <!-- Header -->
        <div style="text-align:center; max-width:720px; margin:0 auto 48px auto;">
            <span class="badge-sage" style="margin-bottom:8px;">Our Purpose &amp; Mission</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                Empowering India's Young Creators
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                ArtisansKart was founded with one clear conviction: talented student artists in schools and colleges deserve a direct platform to monetize their heirloom craft skills and fund their own education.
            </p>
        </div>

        <!-- Manifesto Highlight Box -->
        <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:48px 36px; text-align:center; max-width:860px; margin:0 auto 48px auto; box-shadow:0 10px 30px rgba(0,0,0,0.03);">
            <span style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#C85A32;">The ArtisansKart Pledge</span>
            <blockquote style="font-size:clamp(20px, 2.5vw, 26px); font-weight:900; color:#1E293B; margin:16px 0; line-height:1.4;">
                "Every child is an artist. We turn classroom sketches, pottery projects, and weekend handcrafts into real, sustainable entrepreneurial journeys."
            </blockquote>
            <span style="font-size:13px; font-weight:700; color:#8A9A86;">— ArtisansKart Student Community Guild</span>
        </div>

        <!-- 3 Pillars Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:28px; max-width:1040px; margin:0 auto 48px auto;">
            <div class="card-hover" style="padding:28px; text-align:center;">
                <div style="width:52px; height:52px; border-radius:16px; background:#FDF2EE; color:#C85A32; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 16px auto; font-weight:900;">
                    🎓
                </div>
                <h3 style="font-size:18px; font-weight:800; color:#1E293B; margin-bottom:8px;">65% Direct Student Share</h3>
                <p style="font-size:13px; color:#64748b; line-height:1.6;">
                    The majority of every sale goes directly to the student maker's education savings, teaching them financial literacy early.
                </p>
            </div>

            <div class="card-hover" style="padding:28px; text-align:center;">
                <div style="width:52px; height:52px; border-radius:16px; background:#EEF3EE; color:#8A9A86; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 16px auto; font-weight:900;">
                    🏫
                </div>
                <h3 style="font-size:18px; font-weight:800; color:#1E293B; margin-bottom:8px;">Campus Art Studios</h3>
                <p style="font-size:13px; color:#64748b; line-height:1.6;">
                    We partner directly with fine arts teachers and school workshops across Delhi, Pune, Mumbai, Jaipur, and Bengaluru.
                </p>
            </div>

            <div class="card-hover" style="padding:28px; text-align:center;">
                <div style="width:52px; height:52px; border-radius:16px; background:#F1EDE8; color:#1E293B; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 16px auto; font-weight:900;">
                    🌿
                </div>
                <h3 style="font-size:18px; font-weight:800; color:#1E293B; margin-bottom:8px;">Sustainable &amp; Plastic-Free</h3>
                <p style="font-size:13px; color:#64748b; line-height:1.6;">
                    We uphold eco-conscious packaging with unbleached cotton, jute strings, and plant-based protective cushioning.
                </p>
            </div>
        </div>

        <!-- Call to Action -->
        <div style="text-align:center;">
            <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta">
                Discover Student Artworks →
            </a>
        </div>
    </div>
</main>
<?php
get_footer();
