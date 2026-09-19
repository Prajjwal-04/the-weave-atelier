import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productService, sanitizeProductImage, sanitizeProductVariant } from '../services/productService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { emailService } from '../services/emailService';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

const getInitialProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem('twa_products_db');
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({
          ...p,
          images: (p.images && p.images.length > 0)
            ? p.images.map(sanitizeProductImage)
            : [sanitizeProductImage(null)],
          variants: (p.variants && p.variants.length > 0)
            ? p.variants.map((v: any, idx: number) => sanitizeProductVariant(v, idx, p.slug))
            : [sanitizeProductVariant(null, 0, p.slug)],
        }));
      }
    }
  } catch (err) {
    console.error('Error parsing initial local products:', err);
  }
  return INITIAL_PRODUCTS;
};

const getInitialInventoryMap = (initialProds: Product[]): Record<string, number> => {
  const map: Record<string, number> = {};
  initialProds.forEach((p) => {
    (p.variants || []).forEach((v) => {
      if (v && v.sku) {
        map[v.sku] = Number(v.inventory ?? 1);
      }
    });
  });
  return map;
};

interface InventoryContextType {
  products: Product[];
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  getInventory: (sku: string) => number;
  isAvailable: (sku: string) => boolean;
  isLastOne: (sku: string) => boolean;
  decrementInventory: (sku: string, quantity: number) => Promise<void>;
  updateStock: (sku: string, newQty: number) => Promise<void>;
  notifyMeBackInStock: (sku: string, email: string) => Promise<{ success: boolean; message: string }>;
  stockSubscriptions: Record<string, string[]>;
  refreshInventory: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inventoryMap, setInventoryMap] = useState<Record<string, number>>(() => getInitialInventoryMap(getInitialProducts()));
  const [stockSubscriptions, setStockSubscriptions] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('twa_stock_subs');
    return saved ? JSON.parse(saved) : {};
  });

  const loadStockAndProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
      const map: Record<string, number> = {};
      allProducts.forEach((p) => {
        (p.variants || []).forEach((v) => {
          if (v && v.sku) {
            map[v.sku] = Number(v.inventory ?? 1);
          }
        });
      });
      setInventoryMap(map);
    } catch (e) {
      console.error('Failed to load products in InventoryContext:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStockAndProducts();

    // Cross-tab synchronization: when products are edited in another tab, reload immediately
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'twa_products_db' || e.key === 'twa_product_updated') {
        loadStockAndProducts();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // If Supabase is connected, listen to realtime changes on product_variants, products & product_images
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('inventory_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'product_variants' },
          (payload: any) => {
            if (payload.new && payload.new.sku) {
              setInventoryMap((prev) => ({
                ...prev,
                [payload.new.sku]: payload.new.inventory,
              }));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            loadStockAndProducts();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'product_images' },
          () => {
            loadStockAndProducts();
          }
        )
        .subscribe();

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadStockAndProducts]);

  useEffect(() => {
    localStorage.setItem('twa_stock_subs', JSON.stringify(stockSubscriptions));
  }, [stockSubscriptions]);

  const addProduct = async (newProd: Omit<Product, 'id'>): Promise<Product> => {
    const created = await productService.addProduct(newProd);
    setProducts((prev) => [created, ...prev.filter((p) => p.slug !== created.slug && p.id !== created.id)]);
    // update inventory map for new variants
    setInventoryMap((prev) => {
      const nextMap = { ...prev };
      (created.variants || []).forEach((v) => {
        if (v && v.sku) {
          nextMap[v.sku] = Number(v.inventory ?? 1);
        }
      });
      return nextMap;
    });
    try {
      localStorage.setItem('twa_product_updated', Date.now().toString());
    } catch {}
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const updated = await productService.updateProduct(id, updates);
    setProducts((prev) => prev.map((p) => (p.id === id || p.slug === updated.slug ? updated : p)));
    setInventoryMap((prev) => {
      const nextMap = { ...prev };
      (updated.variants || []).forEach((v) => {
        if (v && v.sku) {
          nextMap[v.sku] = Number(v.inventory ?? 1);
        }
      });
      return nextMap;
    });
    try {
      localStorage.setItem('twa_product_updated', Date.now().toString());
    } catch {}
    return updated;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const ok = await productService.deleteProduct(id);
    if (ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      try {
        localStorage.setItem('twa_product_updated', Date.now().toString());
      } catch {}
    }
    return ok;
  };

  const getInventory = useCallback((sku: string): number => {
    if (!sku) return 1;
    if (inventoryMap[sku] !== undefined) {
      return inventoryMap[sku];
    }
    // Fallback check against loaded products
    for (const p of products) {
      const v = p.variants?.find((item) => item.sku === sku);
      if (v) return Number(v.inventory ?? 1);
    }
    return 1;
  }, [inventoryMap, products]);

  const isAvailable = useCallback((sku: string): boolean => {
    return getInventory(sku) > 0;
  }, [getInventory]);

  const isLastOne = useCallback((sku: string): boolean => {
    return getInventory(sku) === 1;
  }, [getInventory]);

  const decrementInventory = async (sku: string, quantity: number) => {
    const current = getInventory(sku);
    const updated = Math.max(0, current - quantity);
    setInventoryMap((prev) => ({ ...prev, [sku]: updated }));
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        variants: p.variants?.map((v) => (v.sku === sku ? { ...v, inventory: updated } : v)),
      }))
    );
    await productService.updateVariantInventory(sku, updated);
  };

  const updateStock = async (sku: string, newQty: number) => {
    const val = Math.max(0, Math.round(Number(newQty) || 0));
    setInventoryMap((prev) => ({ ...prev, [sku]: val }));
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        variants: p.variants?.map((v) => (v.sku === sku ? { ...v, inventory: val } : v)),
      }))
    );
    await productService.updateVariantInventory(sku, val);
  };

  const notifyMeBackInStock = async (sku: string, email: string) => {
    setStockSubscriptions((prev) => {
      const existing = prev[sku] || [];
      if (existing.includes(email)) return prev;
      return {
        ...prev,
        [sku]: [...existing, email],
      };
    });

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('stock_subscriptions')
          .upsert({ sku, email }, { onConflict: 'sku,email', ignoreDuplicates: true });
      } catch (err) {
        console.error('Error recording stock subscription:', err);
      }
    }

    // Direct notification to prasrirugs@gmail.com
    try {
      await emailService.sendStockAlert(sku, email);
    } catch (e) {
      console.warn('Stock alert email dispatch notice:', e);
    }

    return {
      success: true,
      message: 'Thank you. We will alert you immediately when this piece is back on loom at the atelier.',
    };
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        isLoading,
        refreshProducts: loadStockAndProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getInventory,
        isAvailable,
        isLastOne,
        decrementInventory,
        updateStock,
        notifyMeBackInStock,
        stockSubscriptions,
        refreshInventory: loadStockAndProducts,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
