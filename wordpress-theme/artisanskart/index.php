<?php
/**
 * Main Template File - ArtisansKart
 * Standard WordPress Fallback & Blog Posts Archive
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:60px 0 80px 0; background:#FAF9F6; min-height:85vh;">
    <div class="ak-container">
        <div style="text-align:center; max-width:680px; margin:0 auto 40px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Campus News &amp; Stories</span>
            <h1 style="font-size:clamp(32px, 4vw, 44px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                ArtisansKart Journal
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                Stories from student workshops, craft techniques, and campus studio spotlights.
            </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:28px;">
            <?php
            if (have_posts()) :
                while (have_posts()) : the_post();
            ?>
                <article class="card-hover" style="padding:24px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <?php if (has_post_thumbnail()) : ?>
                            <div style="height:180px; border-radius:16px; overflow:hidden; margin-bottom:16px;">
                                <?php the_post_thumbnail('medium', ['style' => 'width:100%; height:100%; object-fit:cover;']); ?>
                            </div>
                        <?php endif; ?>
                        <span class="badge-sage" style="margin-bottom:8px; font-size:11px;"><?php echo get_the_date(); ?></span>
                        <h2 style="font-size:19px; font-weight:800; color:#1E293B; margin:6px 0 10px 0;">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </h2>
                        <div style="font-size:13px; color:#64748b; line-height:1.6; margin-bottom:16px;">
                            <?php the_excerpt(); ?>
                        </div>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:12px;">
                        <a href="<?php the_permalink(); ?>" class="btn-outline" style="padding:6px 14px; font-size:12px;">Read Full Story →</a>
                    </div>
                </article>
            <?php
                endwhile;
            else :
            ?>
                <div style="grid-column: 1 / -1; text-align:center; padding:60px 20px; background:#ffffff; border-radius:24px; border:1px solid #E7E0D8;">
                    <div style="font-size:48px; margin-bottom:12px;">🎨</div>
                    <h2 style="font-size:22px; font-weight:800; color:#1E293B;">Welcome to ArtisansKart</h2>
                    <p style="font-size:14px; color:#64748b; margin:8px 0 20px 0;">Explore handcrafted student pottery, cards, and accessories in the shop.</p>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta">Visit Student Shop →</a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</main>
<?php
get_footer();
