<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site" style="min-height:100vh; display:flex; flex-direction:column;">
    <header id="masthead" class="site-header" style="position:sticky; top:0; z-index:50; background:rgba(250,249,246,0.96); backdrop-filter:blur(10px); border-bottom:1px solid #E7E0D8;">
        <div class="ak-container" style="display:flex; align-items:center; justify-content:space-between; height:74px;">
            <!-- Brand Logo -->
            <a href="<?php echo esc_url(home_url('/')); ?>" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
                <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, #C85A32, #A9481F); color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:22px; box-shadow:0 4px 10px rgba(200,90,50,0.3);">
                    A
                </div>
                <div>
                    <span style="font-size:22px; font-weight:900; color:#1E293B; line-height:1; display:block; letter-spacing:-0.02em;">
                        ArtisansKart
                    </span>
                    <span style="font-size:10px; font-weight:700; color:#C85A32; text-transform:uppercase; letter-spacing:0.06em;">Student Artisan Marketplace</span>
                </div>
            </a>

            <!-- Navigation Links to Separate Pages -->
            <nav id="site-navigation" class="main-navigation" style="display:flex; gap:8px; font-weight:700; font-size:14px; align-items:center;">
                <?php
                if (has_nav_menu('primary')) {
                    wp_nav_menu([
                        'theme_location' => 'primary',
                        'menu_id'        => 'primary-menu',
                        'container'      => false,
                        'menu_class'     => 'ak-nav-menu',
                        'fallback_cb'    => false,
                    ]);
                } else {
                ?>
                    <a href="<?php echo esc_url(home_url('/')); ?>" class="ak-nav-link <?php echo is_front_page() ? 'active' : ''; ?>">Home</a>
                    <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="ak-nav-link <?php echo is_page('shop') || is_page('marketplace') ? 'active' : ''; ?>">Shop Marketplace</a>
                    <a href="<?php echo esc_url(home_url('/collections/')); ?>" class="ak-nav-link <?php echo is_page('collections') ? 'active' : ''; ?>">Collections</a>
                    <a href="<?php echo esc_url(home_url('/how-it-works/')); ?>" class="ak-nav-link <?php echo is_page('how-it-works') ? 'active' : ''; ?>">How It Works</a>
                    <a href="<?php echo esc_url(home_url('/about/')); ?>" class="ak-nav-link <?php echo is_page('about') || is_page('about-us') ? 'active' : ''; ?>">Our Story</a>
                    <a href="<?php echo esc_url(home_url('/maker-portal/')); ?>" class="ak-nav-link <?php echo is_page('maker-portal') || is_page('maker') ? 'active' : ''; ?>">Maker Portal</a>
                <?php } ?>
            </nav>

            <!-- Header Action Button -->
            <div style="display:flex; align-items:center; gap:12px;">
                <a href="<?php echo esc_url(home_url('/shop/')); ?>" class="btn-terracotta" style="padding:9px 20px; font-size:13px;">
                    Explore Shop →
                </a>
            </div>
        </div>
    </header>
