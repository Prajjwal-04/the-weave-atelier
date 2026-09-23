import { supabase, isSupabaseConfigured } from './supabase';
import { Product, ProductVariant } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

const STORAGE_KEY = 'twa_products_db';

const perspectiveBadgeMap: Record<string, string> = {
  full: 'Full Overview',
  room: 'Living Room',
  'living-room': 'Living Room',
  bedroom: 'Bedroom',
  'reading-nook': 'Reading Nook',
  dining: 'Dining Room',
  entryway: 'Entryway',
  texture: 'Texture & Pile',
  detail: 'Close-Up Detail',
  backing: 'Loom Backing',
  corner: 'Corner Bevel',
  'artisan-loom': 'Artisan Loom',
};
const NEUTRAL_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' fill='%23F6F3EE'%3E%3Crect width='800' height='1000' fill='%23F6F3EE'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='20' fill='%23A4998E' letter-spacing='0.25em'%3EPRASRI RUGS%3C/text%3E%3C/svg%3E";

export const sanitizeProductImage = (img: any): any => {
  if (!img) {
    return {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: NEUTRAL_PLACEHOLDER,
      alt: 'Handcrafted artisan rug',
      viewType: 'full',
      label: 'Full Overview',
    };
  }

  // If img was saved as a string URL
  if (typeof img === 'string') {
    const trimmed = img.trim();
    const isCorruptedGhost = trimmed.includes('photo-1600121848594-d8644e57abab');
    return {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: (!trimmed || isCorruptedGhost) ? NEUTRAL_PLACEHOLDER : trimmed,
      alt: 'Handcrafted artisan rug',
      viewType: 'full',
      label: 'Full Overview',
    };
  }

  // If img was corrupted by spreading a string URL: { '0': 'h', '1': 't', ... }
  let url = img.url || img.src || '';
  if (!url && typeof img['0'] === 'string') {
    let reconstructed = '';
    let idx = 0;
    while (img[idx] !== undefined) {
      reconstructed += img[idx];
      idx++;
    }
    if (reconstructed.startsWith('http') || reconstructed.startsWith('data:') || reconstructed.startsWith('/')) {
      url = reconstructed;
    }
  }

  if (!url || typeof url !== 'string' || !url.trim() || url.includes('photo-1600121848594-d8644e57abab')) {
    url = NEUTRAL_PLACEHOLDER;
  }

  const viewType = img.viewType || img.view_type || 'full';
  let label = img.label;
  if (
    !label ||
    typeof label !== 'string' ||
    label.startsWith('[Local File:') ||
    label.toLowerCase().includes('gemini') ||
    label.toLowerCase().includes('screenshot') ||
    label.toLowerCase().includes('img_') ||
    label.toLowerCase().includes('dsc_') ||
    label.length > 30
  ) {
    label = perspectiveBadgeMap[viewType] || 'Perspective';
  }

  return {
    id: img.id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url: url.trim(),
    alt: img.alt || 'Handcrafted artisan rug',
    viewType,
    label,
  };
};

export const sanitizeProductVariant = (v: any, index: number, productSlug: string): ProductVariant => {
  const safeSlug = (productSlug || 'rug').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4) || 'RUG';
  const sizeStr = v?.size || v?.dimensionsFt || '8 x 10 ft (240 x 300 cm)';
  const sizeDigits = sizeStr.replace(/[^0-9]/g, '').slice(0, 4) || '0810';

  const rawPrice = v?.priceUSD ?? v?.price_usd ?? 1500;
  const numPrice = Number(rawPrice);
  const priceUSD = !isNaN(numPrice) && numPrice > 0 ? numPrice : 1500;

  const rawInventory = v?.inventory ?? 1;
  const numInventory = Number(rawInventory);
  const inventory = !isNaN(numInventory) ? Math.max(0, numInventory) : 1;

  return {
    id: v?.id || `var-${safeSlug.toLowerCase()}-${index + 1}`,
    size: sizeStr,
    dimensionsFt: v?.dimensionsFt || v?.dimensions_ft || '8 x 10 ft',
    sku: v?.sku
      ? v.sku.replace(/^TWA-/i, 'PR-')
      : `PR-${safeSlug}-${sizeDigits.padStart(4, '0')}`,
    priceUSD,
    inventory,
    isReadyToShip: v?.isReadyToShip ?? v?.is_ready_to_ship ?? true,
    productionTimeWeeks: v?.productionTimeWeeks || v?.production_time_weeks || '4–6 weeks',
    weightKg: Number(v?.weightKg || v?.weight_kg || 15) || 15,
  };
};

// Helper to get products stored in localStorage
const getLocalProducts = (): Product[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => {
          const images = (p.images && p.images.length > 0)
            ? p.images.map(sanitizeProductImage)
            : [sanitizeProductImage(null)];

          const variants = (p.variants && p.variants.length > 0)
            ? p.variants.map((v: any, idx: number) => sanitizeProductVariant(v, idx, p.slug))
            : [sanitizeProductVariant(null, 0, p.slug)];

          return {
            ...p,
            images,
            variants,
          };
        });
      }
    } catch (e) {
      console.error('Error parsing local products:', e);
    }
  }
  return INITIAL_PRODUCTS;
};

// Helper to save products to localStorage safely without corrupting image URLs
const saveLocalProducts = (products: Product[]) => {
  try {
    const sanitized = products.map((p) => ({
      ...p,
      images: (p.images && p.images.length > 0)
        ? p.images.map(sanitizeProductImage)
        : [sanitizeProductImage(null)],
      variants: (p.variants && p.variants.length > 0)
        ? p.variants.map((v: any, idx: number) => sanitizeProductVariant(v, idx, p.slug))
        : [sanitizeProductVariant(null, 0, p.slug)],
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('LocalStorage save notice for products cache:', err);
  }
};

export const productService = {
  // 1. Get all products
  async getAllProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (*),
            product_variants (*)
          `)
          .order('created_at', { ascending: false });

        if (!error && dbProducts && dbProducts.length > 0) {
          // Format into Product type
          const formatted: Product[] = dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            subtitle: p.subtitle || '',
            collection: (p.collection_slug || 'modern-forms').replace(/-/g, ' ').toUpperCase(),
            collectionSlug: p.collection_slug || 'modern-forms',
            technique: p.technique,
            techniqueDescription: p.technique_description || '',
            material: p.material,
            materialComposition: p.material_composition,
            colors: p.colors || [],
            pileHeight: p.pile_height || '',
            knotDensity: p.knot_density,
            origin: p.origin || 'Bhadohi, Uttar Pradesh, India',
            description: p.description,
            designStory: p.design_story || '',
            craftNotes: p.craft_notes || '',
            careSummary: p.care_summary || '',
            featured: p.featured ?? false,
            bestSeller: p.best_seller ?? false,
            isNew: p.is_new ?? false,
            isReadyToShip: p.is_ready_to_ship ?? true,
            images: (p.product_images || [])
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((img: any) => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
                viewType: img.view_type,
                label: img.label,
              })),
            variants: (p.product_variants || [])
              .sort((a: any, b: any) => (Number(a.price_usd) || 0) - (Number(b.price_usd) || 0))
              .map((v: any) => ({
                id: v.id,
                size: v.size,
                dimensionsFt: v.dimensions_ft,
                sku: v.sku,
                priceUSD: Number(v.price_usd),
                inventory: v.inventory,
                isReadyToShip: v.is_ready_to_ship,
                productionTimeWeeks: v.production_time_weeks,
                weightKg: Number(v.weight_kg) || 20,
              })),
          }));

          // Cache clean products locally so immediate renders are accurate
          saveLocalProducts(formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local product catalog:', err);
      }
    }

    return getLocalProducts();
  },

  // 2. Get single product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    const all = await this.getAllProducts();
    return all.find((p) => p.slug === slug) || null;
  },

  // 3. Add a new product (from Admin Portal)
  async addProduct(newProduct: Omit<Product, 'id'>): Promise<Product> {
    let assignedId = `pr-prod-${Date.now()}`;

    // If Supabase is connected, insert into database
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: insertedProduct, error: prodErr } = await supabase
          .from('products')
          .insert({
            name: newProduct.name,
            slug: newProduct.slug,
            subtitle: newProduct.subtitle,
            collection_slug: newProduct.collectionSlug,
            technique: newProduct.technique,
            technique_description: newProduct.techniqueDescription,
            material: newProduct.material,
            material_composition: newProduct.materialComposition,
            colors: newProduct.colors,
            pile_height: newProduct.pileHeight,
            knot_density: newProduct.knotDensity,
            origin: newProduct.origin,
            description: newProduct.description,
            design_story: newProduct.designStory,
            craft_notes: newProduct.craftNotes,
            care_summary: newProduct.careSummary,
            is_ready_to_ship: newProduct.isReadyToShip,
            featured: newProduct.featured,
            best_seller: newProduct.bestSeller,
            is_new: newProduct.isNew,
          })
          .select()
          .single();

        if (!prodErr && insertedProduct) {
          assignedId = insertedProduct.id;

          // Insert images
          if (newProduct.images && newProduct.images.length > 0) {
            await supabase.from('product_images').insert(
              newProduct.images.map((img, idx) => ({
                product_id: assignedId,
                url: img.url,
                alt: img.alt || newProduct.name,
                view_type: img.viewType || 'full',
                label: img.label || 'Full Overview',
                display_order: idx,
              }))
            );
          }

          // Insert variants
          if (newProduct.variants && newProduct.variants.length > 0) {
            await supabase.from('product_variants').insert(
              newProduct.variants.map((v) => ({
                product_id: assignedId,
                size: v.size,
                dimensions_ft: v.dimensionsFt,
                sku: v.sku,
                price_usd: v.priceUSD,
                inventory: v.inventory,
                is_ready_to_ship: v.isReadyToShip,
                production_time_weeks: v.productionTimeWeeks,
                weight_kg: v.weightKg,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error inserting product to Supabase:', err);
      }
    }

    const productWithId: Product = { ...newProduct, id: assignedId };
    const normalizedProduct: Product = {
      ...productWithId,
      images: (productWithId.images && productWithId.images.length > 0)
        ? productWithId.images.map(sanitizeProductImage)
        : [sanitizeProductImage(null)],
      variants: (productWithId.variants && productWithId.variants.length > 0)
        ? productWithId.variants.map((v, idx) => sanitizeProductVariant(v, idx, productWithId.slug))
        : [sanitizeProductVariant(null, 0, productWithId.slug)],
    };

    const local = getLocalProducts();
    const updated = [normalizedProduct, ...local.filter((p) => p.slug !== normalizedProduct.slug && p.id !== normalizedProduct.id)];
    saveLocalProducts(updated);

    return normalizedProduct;
  },

  // 4. Update an existing product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const local = getLocalProducts();
    const index = local.findIndex((p) => p.id === id || (updates.slug && p.slug === updates.slug));

    const existing = index !== -1 ? local[index] : null;
    const updatedProduct: Product = {
      ...(existing || ({} as Product)),
      ...updates,
      id: existing?.id || id,
    };

    if (index !== -1) {
      local[index] = updatedProduct;
    } else {
      local.push(updatedProduct);
    }
    saveLocalProducts(local);

    // If Supabase is connected, update DB
    if (isSupabaseConfigured() && supabase) {
      try {
        // Resolve target Supabase ID
        let targetId = id;
        const { data: matched } = await supabase
          .from('products')
          .select('id')
          .or(`id.eq.${id},slug.eq.${updatedProduct.slug}`)
          .limit(1);

        if (matched && matched[0]) {
          targetId = matched[0].id;
        }

        // 1. Update all product specifications
        await supabase
          .from('products')
          .update({
            name: updatedProduct.name,
            slug: updatedProduct.slug,
            subtitle: updatedProduct.subtitle,
            collection_slug: updatedProduct.collectionSlug,
            technique: updatedProduct.technique,
            technique_description: updatedProduct.techniqueDescription,
            material: updatedProduct.material,
            material_composition: updatedProduct.materialComposition,
            colors: updatedProduct.colors,
            pile_height: updatedProduct.pileHeight,
            knot_density: updatedProduct.knotDensity,
            origin: updatedProduct.origin,
            description: updatedProduct.description,
            design_story: updatedProduct.designStory,
            craft_notes: updatedProduct.craftNotes,
            care_summary: updatedProduct.careSummary,
            is_ready_to_ship: updatedProduct.isReadyToShip,
            featured: updatedProduct.featured,
            best_seller: updatedProduct.bestSeller,
            is_new: updatedProduct.isNew,
          })
          .eq('id', targetId);

        // 2. Fully sync product images if provided in updates
        if (updates.images) {
          // Delete old images for this product
          await supabase.from('product_images').delete().eq('product_id', targetId);

          // Insert new image set
          if (updates.images.length > 0) {
            await supabase.from('product_images').insert(
              updates.images.map((img, idx) => ({
                product_id: targetId,
                url: img.url,
                alt: img.alt || updatedProduct.name,
                view_type: img.viewType || 'full',
                label: img.label || 'Full Overview',
                display_order: idx,
              }))
            );
          }
        }

        // 3. Fully sync product variants if provided in updates
        if (updates.variants) {
          // Delete old variants for this product
          await supabase.from('product_variants').delete().eq('product_id', targetId);

          // Insert new variant set
          if (updates.variants.length > 0) {
            await supabase.from('product_variants').insert(
              updates.variants.map((v) => ({
                product_id: targetId,
                size: v.size,
                dimensions_ft: v.dimensionsFt,
                sku: v.sku,
                price_usd: v.priceUSD,
                inventory: v.inventory,
                is_ready_to_ship: v.isReadyToShip,
                production_time_weeks: v.productionTimeWeeks,
                weight_kg: v.weightKg,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Error updating product in Supabase:', err);
      }
    }

    return updatedProduct;
  },

  // 5. Delete / Archive a product
  async deleteProduct(id: string): Promise<boolean> {
    const local = getLocalProducts();
    const target = local.find((p) => p.id === id);
    const filtered = local.filter((p) => p.id !== id);
    saveLocalProducts(filtered);

    if (isSupabaseConfigured() && supabase) {
      try {
        let targetId = id;
        if (target) {
          const { data: matched } = await supabase
            .from('products')
            .select('id')
            .or(`id.eq.${id},slug.eq.${target.slug}`)
            .limit(1);
          if (matched && matched[0]) {
            targetId = matched[0].id;
          }
        }
        await supabase.from('product_images').delete().eq('product_id', targetId);
        await supabase.from('product_variants').delete().eq('product_id', targetId);
        await supabase.from('products').delete().eq('id', targetId);
      } catch (err) {
        console.error('Error deleting product in Supabase:', err);
      }
    }

    return true;
  },

  // 6. Update inventory quantity for a variant SKU
  async updateVariantInventory(sku: string, newInventory: number): Promise<void> {
    const cleanSku = (sku || '').trim();
    const local = getLocalProducts();
    let found = false;

    local.forEach((prod) => {
      prod.variants.forEach((v) => {
        if (v.sku?.toLowerCase().trim() === cleanSku.toLowerCase()) {
          v.inventory = Math.max(0, newInventory);
          found = true;
        }
      });
    });

    if (found) {
      saveLocalProducts(local);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('product_variants')
          .update({ inventory: Math.max(0, newInventory) })
          .ilike('sku', cleanSku);
      } catch (err) {
        console.error('Error updating inventory in Supabase:', err);
      }
    }
  },
};
