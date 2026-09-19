import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalUSD: number;
  totalItemCount: number;
  destinationCountry: string;
  setDestinationCountry: (country: string) => void;
  shippingUSD: number;
  freeShippingThresholdUSD: number;
  amountNeededForFreeShippingUSD: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('twa_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            priceUSD: Number(item.priceUSD) || 1500,
            quantity: Number(item.quantity) || 1,
            variantId: item.variantId || `var-${item.sku || Date.now()}`,
            productImage: item.productImage || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
          }));
        }
      }
    } catch (e) {
      console.error('Error parsing initial cart:', e);
    }
    return [];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [destinationCountry, setDestinationCountry] = useState<string>(() => {
    return localStorage.getItem('twa_shipping_country') || 'United States';
  });

  useEffect(() => {
    try {
      localStorage.setItem('twa_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error storing cart:', e);
    }
  }, [items]);

  useEffect(() => {
    localStorage.setItem('twa_shipping_country', destinationCountry);
  }, [destinationCountry]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1, openDrawer = true) => {
    const rawPrice = Number(item.priceUSD);
    const validPrice = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 1500;
    const safeVariantId = item.variantId || `var-${item.sku || Date.now()}`;
    const safeImage = item.productImage || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80';

    const normalizedItem: Omit<CartItem, 'quantity'> = {
      ...item,
      variantId: safeVariantId,
      priceUSD: validPrice,
      productImage: safeImage,
    };

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === normalizedItem.variantId);
      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
      } else {
        updated = [...prev, { ...normalizedItem, quantity }];
      }
      try {
        localStorage.setItem('twa_cart', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to immediately save cart item:', err);
      }
      return updated;
    });

    if (openDrawer) {
      setIsOpen(true);
    }
  };

  const removeFromCart = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotalUSD = items.reduce((acc, i) => acc + i.priceUSD * i.quantity, 0);
  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  // Free shipping threshold: $1500 USD worldwide
  const freeShippingThresholdUSD = 1500;
  const amountNeededForFreeShippingUSD = Math.max(0, freeShippingThresholdUSD - subtotalUSD);

  // Dynamic shipping calculation by destination country
  let shippingUSD = 0;
  if (items.length > 0) {
    if (subtotalUSD >= freeShippingThresholdUSD) {
      shippingUSD = 0; // Complimentary international express shipping!
    } else {
      if (destinationCountry === 'India') {
        shippingUSD = 40; // Domestic express
      } else if (['United States', 'Canada'].includes(destinationCountry)) {
        shippingUSD = 120; // Express insured air courier
      } else if (['United Kingdom', 'Germany', 'France', 'Italy', 'Netherlands', 'Switzerland'].includes(destinationCountry)) {
        shippingUSD = 110;
      } else if (['Australia', 'New Zealand', 'Japan', 'Singapore'].includes(destinationCountry)) {
        shippingUSD = 140;
      } else {
        shippingUSD = 150;
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotalUSD,
        totalItemCount,
        destinationCountry,
        setDestinationCountry,
        shippingUSD,
        freeShippingThresholdUSD,
        amountNeededForFreeShippingUSD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
