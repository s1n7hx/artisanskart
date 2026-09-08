<?php
/**
 * The template for displaying all WooCommerce pages
 *
 * @package ArtisansKart
 * @version 1.0.0
 */

get_header();
?>

<main id="primary" class="site-main py-12 bg-[#FAF9F6] flex-1">
    <div class="ak-container">
        
        <div class="bg-white rounded-3xl border border-[#E7E0D8] p-6 sm:p-10 lg:p-12 shadow-sm">
            <?php woocommerce_content(); ?>
        </div>

    </div>
</main>

<?php
get_footer();
