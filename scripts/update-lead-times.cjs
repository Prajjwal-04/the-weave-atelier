const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Update src/data/products.ts
let code = fs.readFileSync('src/data/products.ts', 'utf8');

// Replace all 4-5 weeks, 5-6 weeks with 3-4 weeks (Hand-tufted)
code = code.replace(/productionTimeWeeks: '(4–5|5–6) weeks'/g, "productionTimeWeeks: '3–4 weeks'");
// Replace 7-8 weeks, 9-10 weeks with 3–6 months (Hand-knotted)
code = code.replace(/productionTimeWeeks: '(7–8|9–10) weeks'/g, "productionTimeWeeks: '3–6 months'");

fs.writeFileSync('src/data/products.ts', code, 'utf8');
console.log('Successfully updated src/data/products.ts');

// 2. Update Supabase product_variants
const env = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('VITE_SUPABASE_URL=')) url = l.replace('VITE_SUPABASE_URL=', '').trim();
  if (l.startsWith('VITE_SUPABASE_ANON_KEY=')) key = l.replace('VITE_SUPABASE_ANON_KEY=', '').trim();
});

const supabase = createClient(url, key);

async function syncSupabase() {
  const { data: prods, error: prodErr } = await supabase.from('products').select('id, name, slug, technique');
  if (prodErr || !prods) {
    console.error('Error fetching products:', prodErr);
    return;
  }

  const { data: variants, error: varErr } = await supabase.from('product_variants').select('id, product_id, sku, is_ready_to_ship, production_time_weeks');
  if (varErr || !variants) {
    console.error('Error fetching variants:', varErr);
    return;
  }

  const prodMap = Object.fromEntries(prods.map(p => [p.id, p]));
  let updatedCount = 0;

  for (const v of variants) {
    const prod = prodMap[v.product_id];
    if (!prod) continue;

    const targetLead = prod.technique === 'Hand-Knotted' ? '3–6 months' : '3–4 weeks';
    if (v.production_time_weeks !== targetLead) {
      await supabase
        .from('product_variants')
        .update({ production_time_weeks: targetLead })
        .eq('id', v.id);
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} variants in Supabase database!`);
}

syncSupabase();
