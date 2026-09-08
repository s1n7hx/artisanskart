<?php
/**
 * ArtisansKart Theme Functions & Automated Page Generator
 *
 * @package ArtisansKart
 * @version 2.2.0
 */

function artisanskart_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
    add_theme_support('woocommerce');
    
    register_nav_menus([
        'primary' => __('Primary Menu', 'artisanskart'),
        'footer'  => __('Footer Menu', 'artisanskart'),
    ]);
}
add_action('after_setup_theme', 'artisanskart_theme_setup');

function artisanskart_enqueue_scripts() {
    wp_enqueue_style('artisanskart-google-fonts', 'https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&display=swap', [], null);
    wp_enqueue_style('artisanskart-style', get_stylesheet_uri(), ['artisanskart-google-fonts'], '2.2.0');
}
add_action('wp_enqueue_scripts', 'artisanskart_enqueue_scripts');

/**
 * Automatically create starter pages and menu upon theme activation
 */
function artisanskart_create_starter_pages() {
    $starter_pages = [
        [
            'title'    => 'Shop Marketplace',
            'slug'     => 'shop',
            'template' => 'page-shop.php',
            'content'  => '<!-- ArtisansKart Shop Template -->'
        ],
        [
            'title'    => 'Curated Collections',
            'slug'     => 'collections',
            'template' => 'page-collections.php',
            'content'  => '<!-- ArtisansKart Collections Template -->'
        ],
        [
            'title'    => 'How It Works',
            'slug'     => 'how-it-works',
            'template' => 'page-how-it-works.php',
            'content'  => '<!-- ArtisansKart How It Works Template -->'
        ],
        [
            'title'    => 'Our Story & About',
            'slug'     => 'about',
            'template' => 'page-about.php',
            'content'  => '<!-- ArtisansKart About Page Template -->'
        ],
        [
            'title'    => 'Student Maker Portal',
            'slug'     => 'maker-portal',
            'template' => 'page-maker.php',
            'content'  => '<!-- ArtisansKart Maker Portal Template -->'
        ],
        [
            'title'    => 'Contact & Custom Inquiries',
            'slug'     => 'contact',
            'template' => 'page-contact.php',
            'content'  => '<!-- ArtisansKart Contact Template -->'
        ],
    ];

    foreach ($starter_pages as $page_info) {
        $existing = get_page_by_path($page_info['slug']);
        if (!$existing) {
            $page_id = wp_insert_post([
                'post_title'     => $page_info['title'],
                'post_name'      => $page_info['slug'],
                'post_status'    => 'publish',
                'post_type'      => 'page',
                'post_content'   => $page_info['content'],
                'comment_status' => 'closed',
            ]);
            if ($page_id && !is_wp_error($page_id)) {
                update_post_meta($page_id, '_wp_page_template', $page_info['template']);
            }
        }
    }
}
add_action('after_switch_theme', 'artisanskart_create_starter_pages');

// Allow REST API CORS for sync
function artisanskart_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}
add_action('rest_api_init', 'artisanskart_cors_headers', 15);
