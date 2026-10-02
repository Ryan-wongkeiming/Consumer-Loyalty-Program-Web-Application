/**
 * Catalog cleanup helper — lists products that need review before launch.
 *
 * Flags products whose:
 * - image URL is still a Pexels/stock-photo CDN (hotlinks that break if the brand changes URLs)
 * - id matches one of the original generic seed IDs (see `ORIGINAL_SEED_IDS`)
 * - rating > 0 or reviews > 0 but no real user-generated content exists yet
 *
 * Usage:
 *   # Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 *   node scripts/catalog_cleanup.mjs
 *
 * Output: JSON array of flagged products. Pipe to jq for pretty-print.
 */

import { createClient } from '@supabase/supabase-js';

// Original generic seed product IDs from the pre-rebrand schema
const ORIGINAL_SEED_IDS = [
  '692e3d52-5ee7-4663-9241-38c3c7fa4af6', // calcium
  'f7b1994a-3ddd-4abb-a08e-dbbd93f211ea', // probiotics
  '570cb28a-f4ae-458e-872f-cfdf8011960a', // CoQ10
];

// Known stock photo domains that indicate unvetted images
const STOCK_PHOTO_DOMAINS = [
  'pexels.com',
  'pixabay.com',
  'unsplash.com',
  'shutterstock.com',
  'gettyimages.com',
  'istockphoto.com',
];

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function main() {
  console.log('Fetching all products from Supabase...\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('No products found.');
    process.exit(0);
  }

  console.log(`Found ${products.length} products.\n`);

  const flagged = [];

  for (const product of products) {
    const reasons = [];

    // Check 1: Is the image from a stock photo CDN?
    if (product.image) {
      try {
        const url = new URL(product.image);
        if (STOCK_PHOTO_DOMAINS.some(domain => url.hostname.includes(domain))) {
          reasons.push(`Stock photo: ${product.image}`);
        }
      } catch {
        // Invalid URL — skip
      }
    }

    // Check 2: Is this one of the original generic seeds?
    if (ORIGINAL_SEED_IDS.includes(product.id)) {
      reasons.push('Original generic seed product');
    }

    // Check 3: Does it have fake-looking ratings/reviews?
    if ((product.rating && product.rating > 0) || (product.reviews && product.reviews > 0)) {
      reasons.push(`Has seeded rating (${product.rating}) / reviews (${product.reviews}) — replace with zeros until real reviews exist`);
    }

    // Check 4: Are images array also using stock URLs?
    if (product.images && Array.isArray(product.images)) {
      const stockImages = product.images.filter(img => {
        try {
          const url = new URL(img);
          return STOCK_PHOTO_DOMAINS.some(domain => url.hostname.includes(domain));
        } catch {
          return false;
        }
      });
      if (stockImages.length > 0) {
        reasons.push(`${stockImages.length} image(s) from stock photo CDN`);
      }
    }

    if (reasons.length > 0) {
      flagged.push({
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: product.price,
        in_stock: product.in_stock,
        reasons,
      });
    }
  }

  console.log(`=== CATALOG CLEANUP REPORT ===\n`);
  console.log(`Total products: ${products.length}`);
  console.log(`Flagged for review: ${flagged.length}\n`);

  if (flagged.length > 0) {
    console.log('--- Flagged Products ---\n');
    for (const p of flagged) {
      console.log(`ID: ${p.id}`);
      console.log(`Name: ${p.name}`);
      console.log(`Category: ${p.category}`);
      console.log(`Brand: ${p.brand}`);
      console.log(`Price: ${p.price}`);
      console.log(`In Stock: ${p.in_stock}`);
      console.log(`Reasons:`);
      for (const reason of p.reasons) {
        console.log(`  - ${reason}`);
      }
      console.log('');
    }

    // Write report to file
    const fs = await import('fs');
    const outputPath = 'catalog_cleanup_report.json';
    fs.writeFileSync(outputPath, JSON.stringify(flagged, null, 2), 'utf-8');
    console.log(`\nFull report written to: ${outputPath}`);
    console.log(`Action required: Remove or replace flagged products before launch.`);
  } else {
    console.log('\n✅ All products pass the catalog quality checks.');
  }
}

main();
