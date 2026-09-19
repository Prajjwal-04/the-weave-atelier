import { supabase, isSupabaseConfigured } from './supabase';
import { Order, OrderStatus, OrderTimelineEvent } from '../types';
import { productService } from './productService';

const ORDERS_STORAGE_KEY = 'twa_orders_db';
const FALLBACK_ORDER_IMAGE = 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80';

// Helper to strip heavy base64 strings or oversized image payloads before saving to localStorage
const sanitizeOrderForStorage = (order: Order): Order => {
  return {
    ...order,
    items: (order.items || []).map((item) => {
      let safeImage = item.productImage || '';
      // If the image is a raw base64 data URL (which can easily be 1-3MB each),
      // replace with a lightweight fallback URL to protect browser 5MB quota
      if (safeImage.startsWith('data:') || safeImage.length > 500) {
        safeImage = FALLBACK_ORDER_IMAGE;
      }
      return {
        ...item,
        productImage: safeImage,
      };
    }),
  };
};

// Proactively clean up any already-bloated localStorage on script evaluation
try {
  const emailLogs = localStorage.getItem('twa_dispatched_inbox_logs');
  if (emailLogs && emailLogs.length > 50000) {
    localStorage.removeItem('twa_dispatched_inbox_logs');
  }

  const existingOrdersRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (existingOrdersRaw && (existingOrdersRaw.includes('data:image') || existingOrdersRaw.length > 250000)) {
    try {
      const parsed: Order[] = JSON.parse(existingOrdersRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.slice(0, 20).map(sanitizeOrderForStorage);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cleaned));
      }
    } catch (_) {}
  }
} catch (_) {}

const getLocalOrders = (): Order[] => {
  const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing local orders:', e);
    }
  }
  return [];
};

const saveLocalOrders = (orders: Order[]) => {
  try {
    // Keep max 30 orders in localStorage cache to prevent quota overflow
    const sanitized = orders.slice(0, 30).map(sanitizeOrderForStorage);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('LocalStorage quota exceeded in saveLocalOrders. Executing auto-eviction...', err);
    try {
      // Clear non-critical debug logs to immediately free up space
      localStorage.removeItem('twa_dispatched_inbox_logs');

      // Try saving a compacted slice of the 10 most recent orders
      const trimmed = orders.slice(0, 10).map(sanitizeOrderForStorage);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(trimmed));
      console.log('Successfully saved compacted orders after storage cleanup.');
    } catch (criticalErr) {
      console.warn('LocalStorage quota critical. Order update preserved in-memory & cloud only.', criticalErr);
      // NEVER throw: storage quota errors must not disrupt UI operations or Supabase sync
    }
  }
};

export const orderService = {
  // 1. Create a new order
  async createOrder(order: Order): Promise<Order> {
    // 1. Persist to Supabase if connected
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: order.orderNumber,
            customer_email: order.customer.email,
            customer_first_name: order.customer.firstName,
            customer_last_name: order.customer.lastName,
            customer_phone: order.customer.phone,
            shipping_address: order.shippingAddress,
            shipping_method: order.shippingMethod,
            currency: order.currency,
            subtotal_usd: order.subtotalUSD,
            shipping_usd: order.shippingUSD,
            tax_usd: order.taxUSD,
            total_usd: order.totalUSD,
            status: order.status,
            carrier: order.carrier,
            tracking_number: order.trackingNumber,
            estimated_delivery_date: order.estimatedDeliveryDate,
            is_made_to_order: order.isMadeToOrder,
            payment_provider: order.paymentProvider || 'Razorpay Live',
            payment_id: order.paymentId || null,
          })
          .select()
          .single();

        if (!orderErr && dbOrder) {
          // Insert order items
          await supabase.from('order_items').insert(
            order.items.map((item) => ({
              order_id: dbOrder.id,
              product_name: item.productName,
              product_slug: item.productSlug,
              product_image: item.productImage,
              size: item.size,
              sku: item.sku,
              technique: item.technique,
              price_usd: item.priceUSD,
              quantity: item.quantity,
              is_ready_to_ship: item.isReadyToShip,
              estimated_dispatch: item.estimatedDispatch,
            }))
          );

          // Insert timeline events
          await supabase.from('order_timelines').insert(
            order.timeline.map((event, idx) => ({
              order_id: dbOrder.id,
              title: event.title,
              date_label: event.date,
              description: event.description,
              completed: event.completed,
              is_current: event.current || false,
              step_order: idx + 1,
            }))
          );
        }
      } catch (err) {
        console.error('Error inserting order into Supabase:', err);
      }
    }

    // 3. Save to local storage (safe, non-blocking)
    try {
      const local = getLocalOrders();
      const updated = [order, ...local];
      saveLocalOrders(updated);
    } catch (cacheErr) {
      console.warn('Non-blocking local orders cache warning on createOrder:', cacheErr);
    }

    return order;
  },

  // 2. Lookup order by order number
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const cleanNum = orderNumber.toUpperCase().trim();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbOrder, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*),
            order_timelines (*)
          `)
          .eq('order_number', cleanNum)
          .single();

        if (!error && dbOrder) {
          return {
            id: dbOrder.id,
            orderNumber: dbOrder.order_number,
            date: new Date(dbOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            customer: {
              firstName: dbOrder.customer_first_name,
              lastName: dbOrder.customer_last_name,
              email: dbOrder.customer_email,
              phone: dbOrder.customer_phone || '',
            },
            shippingAddress: dbOrder.shipping_address,
            shippingMethod: dbOrder.shipping_method,
            items: (dbOrder.order_items || []).map((i: any) => ({
              productId: i.product_id || '',
              productSlug: i.product_slug || '',
              productName: i.product_name,
              productImage: i.product_image || '',
              variantId: i.variant_id || '',
              size: i.size,
              sku: i.sku,
              priceUSD: Number(i.price_usd),
              technique: i.technique || 'Hand-Tufted',
              isReadyToShip: i.is_ready_to_ship,
              estimatedDispatch: i.estimated_dispatch || '',
              quantity: i.quantity,
            })),
            currency: dbOrder.currency || 'USD',
            subtotalUSD: Number(dbOrder.subtotal_usd),
            shippingUSD: Number(dbOrder.shipping_usd),
            taxUSD: Number(dbOrder.tax_usd),
            totalUSD: Number(dbOrder.total_usd),
            status: dbOrder.status as OrderStatus,
            carrier: dbOrder.carrier || 'DHL Express International',
            trackingNumber: dbOrder.tracking_number || '',
            estimatedDeliveryDate: dbOrder.estimated_delivery_date || '',
            isMadeToOrder: dbOrder.is_made_to_order,
            paymentProvider: dbOrder.payment_provider || 'Razorpay Live',
            paymentId: dbOrder.payment_id || '',
            timeline: (dbOrder.order_timelines || [])
              .sort((a: any, b: any) => a.step_order - b.step_order)
              .map((t: any) => ({
                title: t.title,
                date: t.date_label,
                description: t.description || '',
                completed: t.completed,
                current: t.is_current,
              })),
          };
        }
      } catch (err) {
        console.warn('Supabase order lookup failed, checking local storage:', err);
      }
    }

    const local = getLocalOrders();
    return local.find((o) => o.orderNumber.toUpperCase().trim() === cleanNum) || null;
  },

  // 3. Get all orders (for Admin Dashboard)
  async getAllOrders(): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*),
            order_timelines (*)
          `)
          .order('created_at', { ascending: false });

        if (!error && dbOrders && dbOrders.length > 0) {
          return dbOrders.map((dbOrder: any) => ({
            id: dbOrder.id,
            orderNumber: dbOrder.order_number,
            date: new Date(dbOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            customer: {
              firstName: dbOrder.customer_first_name,
              lastName: dbOrder.customer_last_name,
              email: dbOrder.customer_email,
              phone: dbOrder.customer_phone || '',
            },
            shippingAddress: dbOrder.shipping_address,
            shippingMethod: dbOrder.shipping_method,
            items: (dbOrder.order_items || []).map((i: any) => ({
              productId: i.product_id || '',
              productSlug: i.product_slug || '',
              productName: i.product_name,
              productImage: i.product_image || '',
              variantId: i.variant_id || '',
              size: i.size,
              sku: i.sku,
              priceUSD: Number(i.price_usd),
              technique: i.technique || 'Hand-Tufted',
              isReadyToShip: i.is_ready_to_ship,
              estimatedDispatch: i.estimated_dispatch || '',
              quantity: i.quantity,
            })),
            currency: dbOrder.currency || 'USD',
            subtotalUSD: Number(dbOrder.subtotal_usd),
            shippingUSD: Number(dbOrder.shipping_usd),
            taxUSD: Number(dbOrder.tax_usd),
            totalUSD: Number(dbOrder.total_usd),
            status: dbOrder.status as OrderStatus,
            carrier: dbOrder.carrier || 'DHL Express International',
            trackingNumber: dbOrder.tracking_number || '',
            estimatedDeliveryDate: dbOrder.estimated_delivery_date || '',
            isMadeToOrder: dbOrder.is_made_to_order,
            paymentProvider: dbOrder.payment_provider || 'Razorpay Live',
            paymentId: dbOrder.payment_id || '',
            timeline: (dbOrder.order_timelines || [])
              .sort((a: any, b: any) => a.step_order - b.step_order)
              .map((t: any) => ({
                title: t.title,
                date: t.date_label,
                description: t.description || '',
                completed: t.completed,
                current: t.is_current,
              })),
          }));
        }
      } catch (err) {
        console.warn('Supabase orders list failed, returning local orders:', err);
      }
    }

    return getLocalOrders();
  },

  // 3b. Get orders for specific customer email (for Customer Account Portal)
  async getOrdersForCustomer(email: string): Promise<Order[]> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*),
            order_timelines (*)
          `)
          .ilike('customer_email', cleanEmail)
          .order('created_at', { ascending: false });

        if (!error && dbOrders) {
          return dbOrders.map((dbOrder: any) => ({
            id: dbOrder.id,
            orderNumber: dbOrder.order_number,
            date: new Date(dbOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            customer: {
              firstName: dbOrder.customer_first_name,
              lastName: dbOrder.customer_last_name,
              email: dbOrder.customer_email,
              phone: dbOrder.customer_phone || '',
            },
            shippingAddress: dbOrder.shipping_address,
            shippingMethod: dbOrder.shipping_method,
            items: (dbOrder.order_items || []).map((i: any) => ({
              productId: i.product_id || '',
              productSlug: i.product_slug || '',
              productName: i.product_name,
              productImage: i.product_image || '',
              variantId: i.variant_id || '',
              size: i.size,
              sku: i.sku,
              priceUSD: Number(i.price_usd),
              technique: i.technique || 'Hand-Tufted',
              isReadyToShip: i.is_ready_to_ship,
              estimatedDispatch: i.estimated_dispatch || '',
              quantity: i.quantity,
            })),
            currency: dbOrder.currency || 'USD',
            subtotalUSD: Number(dbOrder.subtotal_usd),
            shippingUSD: Number(dbOrder.shipping_usd),
            taxUSD: Number(dbOrder.tax_usd),
            totalUSD: Number(dbOrder.total_usd),
            status: dbOrder.status as OrderStatus,
            carrier: dbOrder.carrier || 'DHL Express International',
            trackingNumber: dbOrder.tracking_number || '',
            estimatedDeliveryDate: dbOrder.estimated_delivery_date || '',
            isMadeToOrder: dbOrder.is_made_to_order,
            paymentProvider: dbOrder.payment_provider || 'Razorpay Live',
            paymentId: dbOrder.payment_id || '',
            timeline: (dbOrder.order_timelines || [])
              .sort((a: any, b: any) => a.step_order - b.step_order)
              .map((t: any) => ({
                title: t.title,
                date: t.date_label,
                description: t.description || '',
                completed: t.completed,
                current: t.is_current,
              })),
          }));
        }
      } catch (err) {
        console.warn('Supabase customer orders failed, checking local:', err);
      }
    }

    const local = getLocalOrders();
    return local.filter((o) => o.customer.email.toLowerCase().trim() === cleanEmail);
  },

  // 4. Update order status from Admin (e.g. from PROCESSING -> IN PRODUCTION -> DISPATCHED)
  async updateOrderStatus(
    orderNumber: string,
    newStatus: OrderStatus,
    trackingNumber?: string,
    carrier?: string
  ): Promise<Order> {
    const cleanNum = orderNumber.trim().toUpperCase();
    let local = getLocalOrders();
    let index = local.findIndex((o) => o.orderNumber.trim().toUpperCase() === cleanNum);

    // Resilient fallback: If not found in local, attempt fetching from Supabase
    if (index === -1) {
      const fetched = await this.getOrderByNumber(cleanNum);
      if (fetched) {
        local = [fetched, ...local];
        index = 0;
      } else {
        throw new Error(`Order ${orderNumber} not found.`);
      }
    }

    const order = { ...local[index] };
    order.status = newStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (carrier !== undefined) order.carrier = carrier;

    // Comprehensive timeline milestone update
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (order.timeline && order.timeline.length > 0) {
      order.timeline = order.timeline.map((evt, idx) => {
        const titleLower = evt.title.toLowerCase();

        if (newStatus === 'PROCESSING') {
          if (idx === 0) {
            return { ...evt, completed: true, current: true };
          }
          return { ...evt, completed: false, current: false };
        }

        if (newStatus === 'IN PRODUCTION') {
          if (idx === 0) {
            return { ...evt, completed: true, current: false };
          }
          if (titleLower.includes('loom') || titleLower.includes('weaving') || titleLower.includes('conditioning')) {
            return { ...evt, completed: false, current: true, date: `In Progress · ${todayStr}` };
          }
          if (idx === 1) {
            return { ...evt, completed: false, current: true, date: `In Progress · ${todayStr}` };
          }
          return { ...evt, completed: false, current: false };
        }

        if (newStatus === 'QUALITY CHECK') {
          if (titleLower.includes('quality') || titleLower.includes('washing') || titleLower.includes('inspection')) {
            return { ...evt, completed: true, current: true, date: `Inspected · ${todayStr}` };
          }
          if (titleLower.includes('dispatched') || titleLower.includes('transit') || titleLower.includes('delivered')) {
            return { ...evt, completed: false, current: false };
          }
          return { ...evt, completed: true, current: false };
        }

        if (newStatus === 'DISPATCHED') {
          if (titleLower.includes('dispatched') || titleLower.includes('transit')) {
            return { ...evt, completed: true, current: true, date: `Dispatched · ${todayStr}` };
          }
          if (titleLower.includes('delivered')) {
            return { ...evt, completed: false, current: false };
          }
          return { ...evt, completed: true, current: false };
        }

        if (newStatus === 'DELIVERED') {
          return { ...evt, completed: true, current: idx === order.timeline.length - 1, date: idx === order.timeline.length - 1 ? `Delivered · ${todayStr}` : evt.date };
        }

        return evt;
      });
    }

    // 1. Primary Cloud Authority: Update Supabase FIRST so database is guaranteed updated
    if (isSupabaseConfigured() && supabase) {
      try {
        const updatePayload: any = { status: newStatus };
        if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
        if (carrier !== undefined) updatePayload.carrier = carrier;

        const { data: updatedDbOrder, error: updateErr } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('order_number', cleanNum)
          .select('id')
          .maybeSingle();

        if (updateErr) {
          console.warn('Warning updating order in Supabase:', updateErr);
        }

        let targetDbId = updatedDbOrder?.id;
        if (!targetDbId) {
          const { data: found } = await supabase
            .from('orders')
            .select('id')
            .eq('order_number', cleanNum)
            .maybeSingle();
          targetDbId = found?.id;
        }

        // Synchronize updated timeline milestones in Supabase
        if (targetDbId && order.timeline && order.timeline.length > 0) {
          await supabase.from('order_timelines').delete().eq('order_id', targetDbId);
          await supabase.from('order_timelines').insert(
            order.timeline.map((event, idx) => ({
              order_id: targetDbId,
              title: event.title,
              date_label: event.date,
              description: event.description || '',
              completed: Boolean(event.completed),
              is_current: Boolean(event.current),
              step_order: idx + 1,
            }))
          );
        }
      } catch (err) {
        console.error('Error updating order & timeline in Supabase:', err);
      }
    }

    // 2. Safely update local storage cache (non-blocking, never throws quota errors)
    try {
      local[index] = order;
      saveLocalOrders(local);
    } catch (storageErr) {
      console.warn('Non-blocking local orders cache update warning:', storageErr);
    }

    return order;
  },

  // 5. Delete / Archive an order
  async deleteOrder(orderNumber: string): Promise<boolean> {
    const cleanNum = orderNumber.trim().toUpperCase();
    
    // Safely update local storage
    try {
      const local = getLocalOrders();
      const filtered = local.filter((o) => o.orderNumber.trim().toUpperCase() !== cleanNum);
      saveLocalOrders(filtered);
    } catch (err) {
      console.warn('Could not update local storage on delete:', err);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('orders').delete().eq('order_number', cleanNum);
      } catch (err) {
        console.error('Error deleting order in Supabase:', err);
      }
    }

    return true;
  },

  async getItemStock(sku: string): Promise<number> {
    const products = await productService.getAllProducts();
    for (const p of products) {
      const v = p.variants.find((v) => v.sku === sku);
      if (v) return v.inventory;
    }
    return 0;
  },
};
