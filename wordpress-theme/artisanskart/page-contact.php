<?php
/**
 * Template Name: Contact Page
 * Description: Dedicated page template for general contact, custom student craft orders, and school exhibition requests.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <!-- Header -->
        <div style="text-align:center; max-width:680px; margin:0 auto 48px auto;">
            <span class="badge-sage" style="margin-bottom:8px;">Get in Touch</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                Contact &amp; Custom Inquiries
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                Have a question about an order, school partnerships, or looking to commission a custom craft set for an event? We'd love to hear from you.
            </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:36px; max-width:960px; margin:0 auto;">
            <!-- Contact Info -->
            <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:36px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h2 style="font-size:22px; font-weight:900; color:#1E293B; margin-bottom:16px;">Campus Hubs &amp; Support</h2>
                    <p style="font-size:14px; color:#64748b; line-height:1.7; margin-bottom:24px;">
                        ArtisansKart connects student studios across Delhi NCR, Maharashtra, Rajasthan, and Karnataka.
                    </p>
                    <div style="display:flex; flex-direction:column; gap:16px; font-size:14px;">
                        <div>
                            <span style="font-weight:800; color:#1E293B; display:block;">Email Inquiries:</span>
                            <span style="color:#C85A32; font-weight:700;">support@artisanskart.in</span>
                        </div>
                        <div>
                            <span style="font-weight:800; color:#1E293B; display:block;">Order &amp; Shipping Queries:</span>
                            <span style="color:#64748b;">Monday – Saturday, 9 AM – 6 PM IST</span>
                        </div>
                        <div>
                            <span style="font-weight:800; color:#1E293B; display:block;">School Studio Partnerships:</span>
                            <span style="color:#64748b;">mentors@artisanskart.in</span>
                        </div>
                    </div>
                </div>

                <div style="background:#FAF9F6; border:1px solid #E7E0D8; border-radius:18px; padding:18px; margin-top:24px;">
                    <span style="font-size:12px; font-weight:800; color:#8A9A86; display:block;">Student Trust Guarantee</span>
                    <p style="font-size:12px; color:#64748b; margin:4px 0 0 0;">
                        100% of handmade orders are insured and tracked from the student's campus bench to your doorstep.
                    </p>
                </div>
            </div>

            <!-- Contact Form -->
            <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:28px; padding:36px;">
                <h2 style="font-size:22px; font-weight:900; color:#1E293B; margin-bottom:16px;">Send a Message</h2>
                <form onsubmit="event.preventDefault(); alert('Thank you! Your message has been sent to our student support team.');" style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Your Name</label>
                        <input type="text" required placeholder="Full Name" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Email Address</label>
                        <input type="email" required placeholder="name@domain.com" style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit;">
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Inquiry Type</label>
                        <select style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit; background:#ffffff;">
                            <option>Order Status Inquiry</option>
                            <option>Custom Made-on-Demand Request</option>
                            <option>Bulk Event / Corporate Gifting</option>
                            <option>School Art Partnership</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:800; color:#1E293B; display:block; margin-bottom:4px;">Message</label>
                        <textarea rows="4" required placeholder="Tell us how we can help..." style="width:100%; padding:10px 14px; border:1px solid #E7E0D8; border-radius:12px; font-size:13px; outline:none; font-family:inherit; resize:vertical;"></textarea>
                    </div>
                    <button type="submit" class="btn-terracotta" style="width:100%; margin-top:8px; padding:12px;">
                        Send Message →
                    </button>
                </form>
            </div>
        </div>
    </div>
</main>
<?php
get_footer();
