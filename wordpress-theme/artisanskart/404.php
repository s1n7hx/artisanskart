<?php
/**
 * The template for displaying 404 pages (Not Found)
 *
 * @package ArtisansKart
 * @version 1.0.0
 */

get_header();
?>

<main id="primary" class="site-main py-20 bg-[#FAF9F6] flex-1 flex items-center justify-center">
    <div class="ak-container max-w-lg text-center space-y-6">
        <div class="w-20 h-20 rounded-3xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center font-black text-3xl mx-auto">
            404
        </div>
        <h1 class="text-3xl font-black text-[#1E293B]">
            <?php esc_html_e('Craft Not Found', 'artisanskart'); ?>
        </h1>
        <p class="text-sm text-slate-600">
            <?php esc_html_e('The page or craft you are looking for has moved or does not exist.', 'artisanskart'); ?>
        </p>
        <div class="pt-2">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="btn-terracotta">
                <?php esc_html_e('Return to Marketplace', 'artisanskart'); ?>
            </a>
        </div>
    </div>
</main>

<?php
get_footer();
