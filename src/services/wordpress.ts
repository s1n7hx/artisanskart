import { Product } from '../types';
import { PRODUCTS } from '../data';

export interface WordPressConfig {
  url: string;
  postType: 'posts' | 'products' | 'custom';
  customEndpoint?: string;
  autoSync: boolean;
  isConnected: boolean;
  lastSync: string | null;
  status: 'idle' | 'connected' | 'syncing' | 'error';
  errorMessage?: string;
}

export const DEFAULT_WP_CONFIG: WordPressConfig = {
  url: '',
  postType: 'posts',
  customEndpoint: '',
  autoSync: false,
  isConnected: false,
  lastSync: null,
  status: 'idle',
};

// Clean HTML tags and decode HTML entities from WordPress REST responses
export function cleanWordPressHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Convert WordPress Post/Product to ArtisansKart Product
export function transformWordPressItem(item: any, index: number): Product {
  const cleanTitle = cleanWordPressHtml(item.title?.rendered || item.name || `Craft #${index + 1}`);
  const cleanDesc = cleanWordPressHtml(
    item.content?.rendered || item.description || item.excerpt?.rendered || item.short_description || ''
  );

  // Extract featured image from WordPress _embedded or WooCommerce images array
  let imageUrl = '';
  if (item._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    imageUrl = item._embedded['wp:featuredmedia'][0].source_url;
  } else if (item.images?.[0]?.src) {
    imageUrl = item.images[0].src;
  } else if (item.jetpack_featured_media_url) {
    imageUrl = item.jetpack_featured_media_url;
  } else if (item.featured_image_url) {
    imageUrl = item.featured_image_url;
  }

  // Fallback if no image found in WordPress post
  const defaultFallbackImages = [
    'https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/9534281/pexels-photo-9534281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/1212048/pexels-photo-1212048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  ];

  if (!imageUrl) {
    imageUrl = defaultFallbackImages[index % defaultFallbackImages.length];
  }

  // Extract custom fields (ACF / Meta) with sensible fallbacks
  const acf = item.acf || {};
  const meta = item.meta || {};

  const parsedPrice =
    parseFloat(acf.price || meta.price || item.price || item.regular_price) ||
    (349 + (index * 120) % 650);

  const makerName =
    acf.maker ||
    acf.student_maker ||
    meta.maker ||
    item._embedded?.author?.[0]?.name ||
    'Student Artisan';

  const schoolName =
    acf.school ||
    acf.college ||
    meta.school ||
    'Campus Fine Arts Studio';

  const gradeClass =
    acf.class ||
    acf.grade ||
    meta.class ||
    'Fine Arts';

  // Category mapping
  let categoryName = 'Clay Crafts';
  if (acf.category) {
    categoryName = acf.category;
  } else if (item._embedded?.['wp:term']?.[0]?.[0]?.name) {
    categoryName = item._embedded['wp:term'][0][0].name;
  } else if (item.categories?.[0]?.name) {
    categoryName = item.categories[0].name;
  } else if (cleanTitle.toLowerCase().includes('card') || cleanTitle.toLowerCase().includes('paint')) {
    categoryName = 'Hand-painted Cards';
  } else if (cleanTitle.toLowerCase().includes('keychain')) {
    categoryName = 'Keychains';
  } else if (cleanTitle.toLowerCase().includes('bracelet') || cleanTitle.toLowerCase().includes('pendant')) {
    categoryName = 'Accessories';
  }

  return {
    id: typeof item.id === 'number' ? item.id : 1000 + index,
    wpId: item.id,
    title: cleanTitle,
    description: cleanDesc || 'Handcrafted student creation published directly from WordPress.',
    category: categoryName,
    price: parsedPrice,
    rating: parseFloat(acf.rating || meta.rating) || 4.8,
    reviews: parseInt(acf.reviews || meta.reviews) || (30 + (index * 7) % 150),
    maker: makerName,
    cls: gradeClass,
    school: schoolName,
    image: imageUrl,
    stock: acf.stock || meta.stock || (item.stock_status === 'outofstock' ? 'Out of Stock' : 'Made on Demand'),
    source: 'wordpress',
    updatedAt: item.modified || item.date || new Date().toISOString(),
  };
}

// Test WordPress URL endpoint connection
export async function testWordPressApi(siteUrl: string): Promise<{
  success: boolean;
  message: string;
  siteName?: string;
  postCount?: number;
  sampleItem?: any;
}> {
  if (!siteUrl || !siteUrl.trim()) {
    return { success: false, message: 'Please provide a valid WordPress site URL (e.g. https://your-site.com).' };
  }

  const cleanUrl = siteUrl.replace(/\/+$/, '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // 1. Check WP REST API index
    const indexRes = await fetch(`${cleanUrl}/wp-json`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!indexRes.ok) {
      return {
        success: false,
        message: `HTTP ${indexRes.status}: WordPress REST API not reachable at ${cleanUrl}/wp-json. Ensure REST API is enabled and permalinks are set.`,
      };
    }

    const indexJson = await indexRes.json();
    const siteName = indexJson.name || cleanUrl;

    // 2. Fetch sample posts with _embed to verify post & media accessibility
    const postsRes = await fetch(`${cleanUrl}/wp-json/wp/v2/posts?_embed&per_page=5`, {
      headers: { Accept: 'application/json' },
    });

    if (postsRes.ok) {
      const postsJson = await postsRes.json();
      const count = Array.isArray(postsJson) ? postsJson.length : 0;
      return {
        success: true,
        message: `Successfully connected to WordPress ("${siteName}")! Found ${count} live posts ready to sync.`,
        siteName,
        postCount: count,
        sampleItem: postsJson[0],
      };
    }

    return {
      success: true,
      message: `Connected to WordPress REST root ("${siteName}"). Ready to fetch custom endpoints.`,
      siteName,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timed out after 8 seconds. Please check that the URL is online and accessible.',
      };
    }

    return {
      success: false,
      message: `Could not connect to WordPress: ${err.message || 'CORS restriction or network error'}. Enable CORS headers on your WordPress site or use our sample functions.php snippet.`,
    };
  }
}

// Fetch live products/posts from WordPress
export async function fetchWordPressContent(config: WordPressConfig): Promise<{
  success: boolean;
  products: Product[];
  error?: string;
}> {
  if (!config.url) {
    return { success: false, products: PRODUCTS, error: 'No WordPress URL specified' };
  }

  const cleanUrl = config.url.replace(/\/+$/, '');
  let endpoint = `${cleanUrl}/wp-json/wp/v2/posts?_embed&per_page=50`;

  if (config.postType === 'products') {
    endpoint = `${cleanUrl}/wp-json/wp/v2/products?_embed&per_page=50`;
  } else if (config.postType === 'custom' && config.customEndpoint) {
    endpoint = config.customEndpoint.startsWith('http')
      ? config.customEndpoint
      : `${cleanUrl}${config.customEndpoint.startsWith('/') ? '' : '/'}${config.customEndpoint}`;
  }

  try {
    const res = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      // If products endpoint failed, fallback to posts endpoint
      if (config.postType === 'products') {
        const fallbackRes = await fetch(`${cleanUrl}/wp-json/wp/v2/posts?_embed&per_page=50`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            const mapped = fallbackData.map(transformWordPressItem);
            return { success: true, products: mapped };
          }
        }
      }
      throw new Error(`WordPress API returned status ${res.status} (${res.statusText})`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('WordPress API response was not an array of posts/products');
    }

    if (data.length === 0) {
      return {
        success: true,
        products: PRODUCTS,
        error: 'WordPress site returned 0 posts. Showing default student crafts until you publish in WordPress.',
      };
    }

    const mappedProducts = data.map(transformWordPressItem);
    return { success: true, products: mappedProducts };
  } catch (error: any) {
    return {
      success: false,
      products: PRODUCTS,
      error: error.message || 'Failed to fetch content from WordPress',
    };
  }
}

// PHP snippet to enable CORS & register custom fields in WordPress
export function getWordPressPhpSnippet(): string {
  return `<?php
/**
 * Add this snippet to your WordPress theme's functions.php or a custom plugin
 * to enable CORS and expose custom fields in the WP REST API for ArtisansKart.
 */

// 1. Enable CORS for ArtisansKart frontend
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Wpnonce');
        return $value;
    });
}, 15);

// 2. Expose Custom Fields (Price, Maker, School, Stock, Rating) in WP REST API
add_action('rest_api_init', function () {
    $fields = ['price', 'maker', 'school', 'stock', 'rating', 'reviews', 'class'];
    foreach ($fields as $field) {
        register_rest_field('post', $field, [
            'get_callback' => function ($post) use ($field) {
                return get_post_meta($post['id'], $field, true);
            },
            'update_callback' => function ($value, $post) use ($field) {
                return update_post_meta($post->ID, $field, sanitize_text_field($value));
            },
            'schema' => ['type' => 'string', 'context' => ['view', 'edit']],
        ]);
    }
});
`;
}
