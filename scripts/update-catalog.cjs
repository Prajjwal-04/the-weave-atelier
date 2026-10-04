const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://femavdznbdfncnajvrye.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Z0teG4SUPeiqF_MJR6HpvQ_kEF1pOcu';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateCatalog() {
  console.log('--- Updating Product Variants ---');
  
  const variantUpdates = [
    // 1. Aura
    { id: '6da465cc-58ff-416f-9dd8-44bcea15a196', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 250, inventory: 2, is_ready_to_ship: true },
    { id: '9fc5b623-6be6-4d74-8265-acea55ca4eeb', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },
    { id: 'dbc31130-cfd7-4eef-9781-91ba981d0757', size: "8' × 10'", dimensions_ft: "8' × 10' (244 × 305 cm)", price_usd: 780, inventory: 1, is_ready_to_ship: true },

    // 2. Verdant
    { id: '83c7d424-0080-49c9-8fee-e1b79ca90b6f', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 250, inventory: 2, is_ready_to_ship: true },
    { id: '9d49efac-9ad9-4bb8-9f7b-6b6a572e8f12', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },
    { id: '13e01321-bf06-458d-9d62-9ac93318720a', size: "6' × 9'", dimensions_ft: "6' × 9' (183 × 274 cm)", price_usd: 780, inventory: 1, is_ready_to_ship: true },

    // 3. Sabhya
    { id: '935e12b0-e132-44a0-9d38-3bd906416ca3', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 250, inventory: 2, is_ready_to_ship: true },
    { id: 'ca14fa2d-5366-483d-98f0-9ea2860a22af', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },
    { id: '68a5702f-7449-483f-8923-e2d9621081ab', size: "8' × 10'", dimensions_ft: "8' × 10' (244 × 305 cm)", price_usd: 780, inventory: 1, is_ready_to_ship: true },

    // 4. Aurelle
    { id: '3100e3a9-7073-4fc6-b2c1-1ca9db1b067f', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 250, inventory: 2, is_ready_to_ship: true },
    { id: 'fc57838c-6475-42e3-b9a1-8f3104d56774', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },
    { id: '387bc8b6-114d-4864-ac74-30b446176cd7', size: "8' × 10'", dimensions_ft: "8' × 10' (244 × 305 cm)", price_usd: 780, inventory: 1, is_ready_to_ship: true },

    // 5. Terra
    { id: 'f1f542cf-7abf-44ba-8a21-b0e9d254794a', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 250, inventory: 2, is_ready_to_ship: true },
    { id: 'd82476be-c938-4fa2-8f3c-49122541fb4b', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },
    { id: 'e194381c-5818-47f0-9864-c5178d6dd2d4', size: "8' × 10'", dimensions_ft: "8' × 10' (244 × 305 cm)", price_usd: 780, inventory: 1, is_ready_to_ship: true },

    // 6. Pebble
    { id: 'aeb039cb-3ec3-411a-9b46-5bf91759d0ba', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 255, inventory: 2, is_ready_to_ship: true },
    { id: '4c68ea0b-e9bb-4998-8081-5982156faa4d', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 440, inventory: 2, is_ready_to_ship: true },
    { id: '399fbd44-c4da-4ace-8fa4-f536cb39cf41', size: "8' × 10'", dimensions_ft: "8' × 10' (244 × 305 cm)", price_usd: 780, inventory: 1, is_ready_to_ship: true },

    // 7. Sakura
    { id: '54c182e4-c393-4f8f-aca6-70078446135a', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 255, inventory: 2, is_ready_to_ship: true },
    { id: '55d0d697-cf47-43a4-bfdc-7caddd433823', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 440, inventory: 2, is_ready_to_ship: true },

    // 8. Organica
    { id: '90d3750e-c0b2-4a15-98a8-7b6d238193b0', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 250, inventory: 2, is_ready_to_ship: true },
    { id: '1e51ce3a-b7b9-40cb-8942-b58f0cf1ce3b', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },

    // 9. Nocturne
    { id: '4aeba212-603c-4fad-bd68-2b99f1c92893', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 250, inventory: 2, is_ready_to_ship: true },
    { id: '86a3cea0-3b0d-4df8-8dda-039c56d488cb', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },

    // 10. Arbor Flow (arbor-flow)
    { id: '6cd96731-f26d-46f7-b0db-f20921201b17', size: "4' × 6'", dimensions_ft: "4' × 6' (122 × 183 cm)", price_usd: 245, inventory: 2, is_ready_to_ship: true },
    { id: '43c36fd9-3c0b-46a2-8c70-14daf6c52124', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 430, inventory: 2, is_ready_to_ship: true },

    // 11. EarthScape
    { id: '0a1d8ca7-54e8-45d2-bdb6-3464ccb44161', size: "5' × 8'", dimensions_ft: "5' × 8' (152 × 244 cm)", price_usd: 435, inventory: 2, is_ready_to_ship: true },
    { id: 'e67b023c-15a0-404e-a3af-bdbc138cb47e', size: "8' × 10'", dimensions_ft: "8' × 10' (244 × 305 cm)", price_usd: 780, inventory: 1, is_ready_to_ship: true },
  ];

  for (const v of variantUpdates) {
    const { error } = await client.from('product_variants').update({
      size: v.size,
      dimensions_ft: v.dimensions_ft,
      price_usd: v.price_usd,
      inventory: v.inventory,
      is_ready_to_ship: v.is_ready_to_ship,
      updated_at: new Date().toISOString()
    }).eq('id', v.id);

    if (error) {
      console.error(`Failed to update variant ${v.id}:`, error);
    } else {
      console.log(`Updated variant ${v.id} (${v.size} - $${v.price_usd})`);
    }
  }

  console.log('--- Updating Product Descriptions ---');

  const descriptions = {
    aura: 'Defined by architectural arches and striking monochrome minimalism, the Aura rug balances bold geometric curves with the serene warmth of hand-tufted unbleached wool. Hand-sheared to create crisp dimensional contrast underfoot.',
    verdant: 'Capturing the deep, renewing stillness of highland moss and woodland canopies, Verdant pairs rich botanical greens with soft ivory grounding. Textured loops and cut pile lend an organic tactile presence to contemporary living spaces.',
    sabhya: 'Rooted in refined simplicity, Sabhya harmonizes understated tribal line work with quiet neutral tones. Woven from soft blended wool with gentle earthen accents, it provides a warm, grounded foundation for modern minimalist interiors.',
    aurelle: 'A fluid abstract composition where subtle sea green nuances dissolve softly into warm ivory. Hand-tufted with fine pile contouring, Aurelle catches daylight gently, creating a calm, luminous ambiance in bedrooms and salons.',
    terra: 'Drawing inspiration from ancient Moroccan kilims and warm terracotta soil, Terra features bold charcoal geometric framing against rustic orange and earthen tones. A deeply grounding focal piece crafted for curated bohemian or modern rustic living.',
    pebble: 'Inspired by smoothed riverbed stones along the sacred Ganges, Pebble explores soft organic silhouettes with dimensional carved channels. Its tactile high-low surface invites touch and cushions footsteps with comforting density.',
    sakura: 'A poetic ode to transient spring blooms, Sakura blends antique ivory, delicate blush, and earthy walnut branches. Rendered in hand-tufted wool with botanical accents, it infuses living areas with subtle romantic warmth and artisan nuance.',
    organica: 'Celebrating the irregular grace of natural landscape formations, Organica layers warm cream, dusty terracotta, and sage grey. Hand-sculpted bevels define each contoured plane, creating subtle light-and-shadow dynamics under interior lighting.',
    nocturne: 'An evocative Mediterranean color-block composition exploring twilight contrasts. Deep burgundy and charcoal fields intersect serene ivory and taupe panels, offering architectural presence for bold, modern spaces.',
    'arbor-flow': 'A modern organic study in gentle wave motions and river currents. Hand-tufted in Bhadohi from durable blended wool, featuring warm ivory, oatmeal, and mushroom taupe tones with subtle hand-carved relief grooves.',
    earthscape: 'An aerial study of Gangetic terrain and alluvial riverbeds. EarthScape unites muted sage, greige, and soft charcoal in an abstract botanical rhythm that brings quiet serenity to open-plan living areas.'
  };

  for (const [slug, desc] of Object.entries(descriptions)) {
    const { error } = await client.from('products').update({
      description: desc,
      updated_at: new Date().toISOString()
    }).eq('slug', slug);

    if (error) {
      console.error(`Failed to update description for ${slug}:`, error);
    } else {
      console.log(`Updated description for: ${slug}`);
    }
  }

  console.log('All updates completed successfully!');
}

updateCatalog().catch(console.error);
