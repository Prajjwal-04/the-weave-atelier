import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

const BASE_URL = 'https://www.prasrirugs.com';
const DEFAULT_IMAGE = `${BASE_URL}/images/hero/hero-main.jpg`;
const DEFAULT_TITLE = 'PRASRI RUGS — Contemporary Handmade Rugs from Bhadohi, India';
const DEFAULT_DESCRIPTION =
  'Contemporary rugs, rooted in Indian craftsmanship. Handcrafted slowly in Bhadohi, India for discerning architectural spaces worldwide. Ready-to-ship collections and bespoke custom sizing.';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title
      ? `${title} — PRASRI RUGS`
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // 2. Helper to set or update meta tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Primary Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="title"]', 'name', 'title', formattedTitle);

    // 4. Canonical Tag (Always points to https://www.prasrirugs.com + canonicalPath)
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // 5. OpenGraph Tags
    const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`;
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', fullImageUrl);

    // 6. Twitter / X Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', fullImageUrl);

    // 7. Optional JSON-LD Structured Data
    let scriptTag = document.getElementById('dynamic-page-jsonld') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-page-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, canonicalPath, image, type, jsonLd]);

  return null;
};

export default SEO;
