<?php
/**
 * Template Name: Student Maker Portal
 * Description: Dedicated portal page for student artisans to apply, track craft submissions, and learn about the 65% revenue share.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <!-- Header -->
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Student Creators Guild</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                Student Maker Portal
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                Are you a school or college student who makes pottery, paintings, jewelry, or keychains? Join ArtisansKart to showcase your creations to art lovers across India.
            </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:36px; max-width:1040px; margin:0 auto;">
            <!-- Maker Benefits -->
            <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:36px;">
                <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin-bottom:20px;">Why Join as a Student Maker?</h2>
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:flex; gap:16px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:#FDF2EE; color:#C85A32; display:flex; align-items:center; justify-content:center; font-weight:900; flex-shrink:0;">💰</div>
                        <div>
                            <h4 style="font-size:15px; font-weight:800; color:#1E293B; margin:0 0 4px 0;">Keep 65% of Every Sale</h4>
                            <p style="font-size:13px; color:#64748b; margin:0; line-height:1.5;">Direct payout to your student savings account upon customer delivery confirmation.</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:16px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:#EEF3EE; color:#8A9A86; display:flex; align-items:center; justify-content:center; font-weight:900; flex-shrink:0;">🎨</div>
                        <div>
                            <h4 style="font-size:15px; font-weight:800; color:#1E293B; margin:0 0 4px 0;">Make On Your Own Schedule</h4>
                            <p style="font-size:13px; color:#64748b; margin:0; line-height:1.5;">Made-to-order workflow allows you to balance craft making with your school homework and exams.</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:16px;">
                        <div style="width:40px; height:40px; border-radius:12px; background:#F1EDE8; color:#1E293B; display:flex; align-items:center; justify-content:center; font-weight:900; flex-shrink:0;">📦</div>
                        <div>
                            <h4 style="font-size:15px; font-weight:800; color:#1E293B; margin:0 0 4px 0;">Free Packaging Kits</h4>
                            <p style="font-size:13px; color:#64748b; margin:0; line-height:1.5;">We ship our signature eco-friendly kraft boxes and tape directly to your school campus hub.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Application Form -->
            <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:36px;">
                <h2 style="font-size:24px; font-weight:900; color:#1E293B; margin-bottom:8px;">Apply as a Maker</h2>
                <p style="font-size:13px; color:#64748b; margin-bottom:20px;">Fill out this simple form to get verified by your school campus mentor.</p>

                <form onsubmit="event.preventDefault(); alert('Application received! Your school art mentor will reach out within 48 hours.');" style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Full Name</label>
                        <input type="text" required placeholder="e.g., Sakib Ansari" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div>
                            <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Class / Grade</label>
                            <input type="text" required placeholder="e.g., Class 10" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                        </div>
                        <div>
                            <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Craft Category</label>
                            <select style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit; background:#ffffff;">
                                <option>Clay & Pottery</option>
                                <option>Hand-painted Cards</option>
                                <option>Accessories & Jewelry</option>
                                <option>Wood & Resin Keychains</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">School / College Name &amp; City</label>
                        <input type="text" required placeholder="e.g., DPS RK Puram, New Delhi" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Email or Parent/Mentor Phone</label>
                        <input type="text" required placeholder="Contact info" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <button type="submit" class="btn-terracotta" style="width:100%; margin-top:8px; padding:12px;">
                        Submit Student Maker Application →
                    </button>
                </form>
            </div>
        </div>
    </div>
</main>
<?php
get_footer();
