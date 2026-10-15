<?php
/**
 * Template Name: Maker Portal
 * Description: Dedicated portal page for independent artisans to apply, track craft submissions, and learn about the 65% revenue share.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <!-- Header -->
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Artisans &amp; Creators Guild</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                Maker Portal
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                Are you an independent artisan, homemaker, or creator who makes pottery, paintings, jewelry, crochet, or keychains? Join ArtisansKart to showcase your creations to art lovers across India.
            </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:36px; max-width:1040px; margin:0 auto;">
            <!-- Maker Benefits -->
            <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:36px;">
                <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin-bottom:20px;">Why Join as an Artisan Maker?</h2>
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:flex; gap:16px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:#FDF2EE; color:#C85A32; display:flex; align-items:center; justify-content:center; font-weight:900; flex-shrink:0;">💰</div>
                        <div>
                            <h4 style="font-size:15px; font-weight:800; color:#1E293B; margin:0 0 4px 0;">Keep 65% of Every Sale</h4>
                            <p style="font-size:13px; color:#64748b; margin:0; line-height:1.5;">Direct payout to your bank account or UPI upon customer delivery confirmation.</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:16px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:#EEF3EE; color:#8A9A86; display:flex; align-items:center; justify-content:center; font-weight:900; flex-shrink:0;">🎨</div>
                        <div>
                            <h4 style="font-size:15px; font-weight:800; color:#1E293B; margin:0 0 4px 0;">Make On Your Own Schedule</h4>
                            <p style="font-size:13px; color:#64748b; margin:0; line-height:1.5;">Made-to-order workflow allows you to craft at your own pace with zero pressure or mass-production deadlines.</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:16px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:#F1EDE8; color:#1E293B; display:flex; align-items:center; justify-content:center; font-weight:900; flex-shrink:0;">📦</div>
                        <div>
                            <h4 style="font-size:15px; font-weight:800; color:#1E293B; margin:0 0 4px 0;">Free Packaging Kits</h4>
                            <p style="font-size:13px; color:#64748b; margin:0; line-height:1.5;">We ship our signature eco-friendly kraft boxes and tape directly to your doorstep or local hub.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Application Form -->
            <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:36px;">
                <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin-bottom:8px;">Apply as a Maker</h2>
                <p style="font-size:13px; color:#64748b; margin-bottom:20px;">Fill out this simple form to get verified by our onboarding team.</p>

                <form onsubmit="event.preventDefault(); alert('Application received! Our creator onboarding team will reach out within 48 hours.');" style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Full Name</label>
                        <input type="text" required placeholder="e.g., Sakib Ansari" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div>
                            <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Studio / Series Title</label>
                            <input type="text" placeholder="e.g., Atelier Studio" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                        </div>
                        <div>
                            <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Craft Category</label>
                            <select style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit; background:#ffffff;">
                                <option>Clay &amp; Pottery</option>
                                <option>Hand-painted Cards</option>
                                <option>Accessories &amp; Jewelry</option>
                                <option>Wood &amp; Resin Keychains</option>
                                <option>Crochet &amp; Fiber Arts</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Location / City</label>
                        <input type="text" required placeholder="e.g., New Delhi, Delhi" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Email or Phone</label>
                        <input type="text" required placeholder="Contact info" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <button type="submit" class="btn-terracotta" style="width:100%; margin-top:8px; padding:12px;">
                        Submit Maker Application →
                    </button>
                </form>
            </div>
        </div>
    </div>
</main>
<?php
get_footer();
