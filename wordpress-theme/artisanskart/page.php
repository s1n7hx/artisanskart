<?php
get_header();
?>
<main id="primary" class="site-main" style="padding:60px 0; background:#FAF9F6; min-height:80vh;">
    <div class="ak-container" style="max-width:800px;">
        <div style="background:#ffffff; border:1px solid #E7E0D8; border-radius:24px; padding:44px; box-shadow:0 12px 30px rgba(0,0,0,0.06);">
            <h1 style="font-size:34px; font-weight:900; margin-bottom:24px; color:#1E293B;"><?php the_title(); ?></h1>
            <div style="font-size:16px; color:#475569; line-height:1.8;">
                <?php the_content(); ?>
            </div>
        </div>
    </div>
</main>
<?php
get_footer();
