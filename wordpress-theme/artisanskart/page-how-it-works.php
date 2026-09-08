<?php
/**
 * Template Name: How It Works Page
 * Description: Dedicated page template explaining the student creation journey, 65% revenue share, quality inspection, and eco-packaging.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <!-- Header -->
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Transparent 5-Step Model</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                How ArtisansKart Works
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                From the student's campus workbench to your home — here is how every piece is crafted, verified, and delivered with love.
            </p>
        </div>

        <!-- 5 Steps Container -->
        <div style="max-width:860px; margin:0 auto; display:flex; flex-direction:column; gap:24px;">
            <!-- Step 1 -->
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#FDF2EE; color:#C85A32; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    1
                </div>
                <div>
                    <span class="badge-sage" style="margin-bottom:6px;">Campus Workshop</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">Student Crafts On Demand</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">
                        When you place an order, the verified student artisan is notified immediately. They hand-pinch, glaze, watercolor, or braid the piece in their school studio or home workbench.
                    </p>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#EEF3EE; color:#8A9A86; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    2
                </div>
                <div>
                    <span class="badge-terracotta" style="margin-bottom:6px;">Quality Inspection</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">Studio Mentor Verification</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">
                        Art teachers and campus studio leads inspect structural durability, lead-free seals on terracotta, and ensure colors match the photography before packaging.
                    </p>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#F1EDE8; color:#1E293B; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    3
                </div>
                <div>
                    <span class="badge-sage" style="margin-bottom:6px;">100% Plastic-Free</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">Eco-Friendly Hand-Wrapping</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">
                        Every item is cushioned in shredded recycled kraft paper, tied with natural jute twine, and accompanied by a personalized handwritten thank-you note from the student creator.
                    </p>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="card-hover" style="padding:28px 36px; display:flex; gap:24px; align-items:flex-start;">
                <div style="width:56px; height:56px; border-radius:18px; background:#FDF2EE; color:#C85A32; font-weight:900; font-size:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    4
                </div>
                <div>
                    <span class="badge-terracotta" style="margin-bottom:6px;">Direct Impact</span>
                    <h3 style="font-size:20px; font-weight:800; color:#1E293B; margin:4px 0 8px 0;">65% Direct Student Payout</h3>
                    <p style="font-size:14px; color:#64748b; line-height:1.7;">
                        65% of the craft price goes directly into the verified student's education account, funding their school tuition, fine art brushes, clay kilns, and college savings.
                    </p>
                </div>
            </div>
        </div>

        <!-- CTA Box -->
        <div style="max-width:860px; margin:48px auto 0 auto; background:#1E293B; color:#ffffff; border-radius:28px; padding:40px; text-align:center;">
            <h2 style="font-size:28px; font-weight:900; color:#ffffff; margin:0 0 12px 0;">Ready to Support a Student Artisan?</h2>
            <p style="font-size:15px; color:#cbd5e1; max-width:540px; margin:0 auto 24px auto;">
                Explore all 13 handcrafted works of clay, art cards, accessories, and keychains today.
            </p>
            <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta">
                Explore Full Shop →
            </a>
        </div>
    </div>
</main>
<?php
get_footer();
