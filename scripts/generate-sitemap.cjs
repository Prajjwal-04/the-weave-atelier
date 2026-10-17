const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://femavdznbdfncnajvrye.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z0teG4SUPeiqF_MJR6HpvQ_kEF1pOcu';

const BASE_URL = 'https://www.prasrirugs.com';
const TODAY = new Date().toISOString().split('T')[0];

const CORE_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/shop', priority: '0.95', changefreq: 'daily' },
  { path: '/collections', priority: '0.9', changefreq: 'weekly' },
  { path: '/the-atelier', priority: '0.85', changefreq: 'monthly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/craft', priority: '0.8', changefreq: 'monthly' },
  { path: '/custom-rugs', priority: '0.85', changefreq: 'weekly' },
  { path: '/size-guide', priority: '0.75', changefreq: 'monthly' },
  { path: '/rug-care', priority: '0.75', changefreq: 'monthly' },
  { path: '/journal', priority: '0.8', changefreq: 'weekly' },
  { path: '/shipping-returns', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/terms', priority: '0.5', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
];

const COLLECTIONS = [
  'modern-forms',
  'quiet-neutrals',
  'botanical-studies',
  'texture-sculpture',
  'heritage-reimagined',
  'hand-knotted-collection',
];

const JOURNAL_ARTICLES = [
  'hand-knotted-vs-hand-tufted-rugs',
  'the-story-of-bhadohi-carpet-making',
  'choosing-the-right-rug-size-architects-guide',
];

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log('Generating dynamic sitemap.xml...');

  let products = [];
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase
      .from('products')
      .select('name, slug, updated_at, product_images(url, alt)')
      .order('name');

    if (!error && data && data.length > 0) {
      products = data;
      console.log(`Fetched ${products.length} products from Supabase.`);
    } else {
      console.warn('Failed to fetch from Supabase, error:', error);
    }
  } catch (err) {
    console.error('Supabase query failed:', err);
  }

  // Fallback to local json if Supabase failed
  if (products.length === 0) {
    try {
      const localJson = path.resolve(__dirname, 'supabase_products.json');
      if (fs.existsSync(localJson)) {
        products = JSON.parse(fs.readFileSync(localJson, 'utf-8'));
        console.log(`Loaded ${products.length} products from cached JSON.`);
      }
    } catch (e) {
      console.warn('Could not read cached JSON:', e);
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Core Atelier Pages -->
`;

  for (const page of CORE_PAGES) {
    xml += `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  }

  xml += `\n  <!-- Curated Collection Pages -->\n`;
  for (const slug of COLLECTIONS) {
    xml += `  <url>
    <loc>${BASE_URL}/collections/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
  }

  xml += `\n  <!-- Individual Artisan Rug Pieces (${products.length} Products with Image Sitemaps) -->\n`;
  for (const product of products) {
    const lastmod = product.updated_at ? product.updated_at.split('T')[0] : TODAY;
    xml += `  <url>
    <loc>${BASE_URL}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>\n`;

    if (product.product_images && Array.isArray(product.product_images)) {
      for (const img of product.product_images.slice(0, 4)) {
        if (img && img.url && img.url.startsWith('http')) {
          xml += `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${escapeXml(product.name)} — Contemporary Handcrafted Rug</image:title>
    </image:image>\n`;
        }
      }
    }

    xml += `  </url>\n`;
  }

  xml += `\n  <!-- Editorial Journal Articles -->\n`;
  for (const slug of JOURNAL_ARTICLES) {
    xml += `  <url>
    <loc>${BASE_URL}/journal/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>\n`;
  }

  xml += `</urlset>\n`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`Successfully generated ${outputPath} with ${products.length} products.`);
}

generateSitemap();
