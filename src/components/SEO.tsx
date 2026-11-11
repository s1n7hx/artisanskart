import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  schema?: Record<string, any> | Array<Record<string, any>>;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

const PRODUCTION_ORIGIN = 'https://artisanskart.in';

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = 'website',
  schema,
  breadcrumbs,
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Dynamic Page Title
    const baseTitle = 'ArtisansKart';
    const finalTitle = title
      ? title.includes(baseTitle)
        ? title
        : `${title} | ${baseTitle}`
      : 'ArtisansKart – Discover Unique Handmade Products Online in India';
    document.title = finalTitle;

    // 2. Dynamic Meta Description
    const finalDesc =
      description ||
      'Discover unique handmade crafts, gifts, accessories and home decor at ArtisansKart. Explore creative products made by independent makers and artisans.';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', finalDesc);

    // 3. Dynamic Canonical Link
    const cleanPath = canonicalPath || location.pathname;
    const finalCanonicalUrl = `${PRODUCTION_ORIGIN}${cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '')}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalCanonicalUrl);

    // 4. Open Graph & Twitter Tags
    const setMetaTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(isName ? 'name' : 'property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('og:title', finalTitle);
    setMetaTag('og:description', finalDesc);
    setMetaTag('og:url', finalCanonicalUrl);
    setMetaTag('og:type', ogType);

    const finalImage = ogImage || `${PRODUCTION_ORIGIN}/assets/aistudio/Elegant_Copper_Ribbon_Monogram_A_be868c52.png`;
    setMetaTag('og:image', finalImage);

    setMetaTag('twitter:title', finalTitle, true);
    setMetaTag('twitter:description', finalDesc, true);
    setMetaTag('twitter:url', finalCanonicalUrl, true);
    setMetaTag('twitter:image', finalImage, true);

    // 5. Schema.org JSON-LD Structured Data
    const graphItems: any[] = [];

    // Optional BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: `${PRODUCTION_ORIGIN}${b.path === '/' ? '' : b.path}`,
        })),
      });
    }

    // Custom Schema (e.g. Product)
    if (schema) {
      if (Array.isArray(schema)) {
        graphItems.push(...schema);
      } else {
        graphItems.push(schema);
      }
    }

    const scriptId = 'dynamic-page-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (graphItems.length > 0) {
      const schemaData = {
        '@context': 'https://schema.org',
        '@graph': graphItems,
      };

      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schemaData, null, 2);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      // Clean up dynamic page schema on unmount
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [title, description, canonicalPath, ogImage, ogType, schema, breadcrumbs, location.pathname]);

  return null;
};
