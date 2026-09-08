<?php
/**
 * Single Product / Post Template
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:60px 0; background:#FAF9F6; min-height:80vh;">
    <div class="ak-container">
        <a href="<?php echo esc_url(home_url('/shop/')); ?>" style="display:inline-flex; align-items:center; gap:8px; font-weight:700; color:#C85A32; font-size:14px; margin-bottom:28px;">
            ← Back to Shop Marketplace
        </a>
        <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:24px; padding:36px; box-shadow:0 12px 30px rgba(0,0,0,0.06);">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:40px;">
                <div>
                    <?php if (has_post_thumbnail()) : ?>
                        <?php the_post_thumbnail('large', ['style' => 'width:100%; border-radius:20px; object-fit:cover; border:1px solid #E7E0D8;']); ?>
                    <?php else : ?>
                        <div style="aspect-ratio:1; background:#f1ede8; border-radius:20px; display:flex; align-items:center; justify-content:center; font-size:48px;">🎨</div>
                    <?php endif; ?>
                </div>
                <div>
                    <span class="badge-terracotta" style="margin-bottom:12px;">Student Handcrafted</span>
                    <h1 style="font-size:32px; font-weight:900; margin:8px 0 16px 0; color:#1E293B;"><?php the_title(); ?></h1>
                    <div style="font-size:15px; color:#475569; line-height:1.7; margin-bottom:24px;">
                        <?php the_content(); ?>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:20px; display:flex; align-items:center; justify-content:space-between;">
                        <span style="font-size:26px; font-weight:900; color:#1E293B;">Made to Order</span>
                        <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta">
                            Explore Full Shop →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
<?php
get_footer();
