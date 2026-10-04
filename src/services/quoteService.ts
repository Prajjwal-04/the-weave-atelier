import { supabase, isSupabaseConfigured } from './supabase';
import { CustomQuoteRequest } from '../types';

const QUOTES_STORAGE_KEY = 'twa_custom_quotes_db';

const getLocalQuotes = (): CustomQuoteRequest[] => {
  const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing local quotes:', e);
    }
  }
  return [];
};

const saveLocalQuotes = (quotes: CustomQuoteRequest[]) => {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes.slice(0, 30)));
  } catch (err) {
    console.warn('LocalStorage save failed for quotes cache:', err);
  }
};

export const quoteService = {
  // 1. Submit a custom quote inquiry
  async submitQuote(quote: CustomQuoteRequest): Promise<CustomQuoteRequest> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbQuote } = await supabase
          .from('custom_quotes')
          .insert({
            reference_number: quote.referenceNumber,
            full_name: quote.fullName,
            email: quote.email,
            phone: quote.phone,
            country: quote.country,
            shape: quote.shape,
            length: quote.length,
            width: quote.width,
            unit: quote.unit,
            technique: quote.technique,
            material: quote.material,
            pile_depth: quote.pileDepth,
            color_preference: quote.colorPreference,
            estimated_price_min_usd: quote.estimatedPriceUSD.min,
            estimated_price_max_usd: quote.estimatedPriceUSD.max,
            room_type: quote.roomType,
            notes: quote.notes,
            status: quote.status,
          })
          .select()
          .single();

        if (dbQuote?.id) {
          quote.id = dbQuote.id;
        }
      } catch (err) {
        console.error('Error inserting quote in Supabase:', err);
      }
    }

    const local = getLocalQuotes();
    const updated = [quote, ...local.filter((q) => q.referenceNumber !== quote.referenceNumber)];
    saveLocalQuotes(updated);

    return quote;
  },

  // 2. Get all custom quotes (for Admin portal)
  async getAllQuotes(): Promise<CustomQuoteRequest[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('custom_quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((q: any) => ({
            id: q.id,
            referenceNumber: q.reference_number,
            createdAt: new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            fullName: q.full_name,
            email: q.email,
            phone: q.phone || '',
            country: q.country,
            shape: q.shape,
            length: Number(q.length),
            width: Number(q.width),
            unit: q.unit,
            technique: q.technique,
            material: q.material,
            pileDepth: q.pile_depth || '',
            colorPreference: q.color_preference || '',
            estimatedPriceUSD: {
              min: Number(q.estimated_price_min_usd),
              max: Number(q.estimated_price_max_usd),
            },
            roomType: q.room_type || '',
            notes: q.notes,
            status: q.status,
            quotedPriceUSD: q.quoted_price_usd != null ? Number(q.quoted_price_usd) : undefined,
            quotedLeadTime: q.quoted_lead_time || undefined,
            adminReplyMessage: q.admin_reply_message || undefined,
            repliedAt: q.replied_at || undefined,
            depositRequiredUSD: q.deposit_required_usd != null ? Number(q.deposit_required_usd) : undefined,
            designerContact: q.designer_contact || undefined,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch quotes failed, returning local storage:', err);
      }
    }

    return getLocalQuotes();
  },

  // 2b. Get quotes for specific customer email
  async getQuotesForCustomer(email: string): Promise<CustomQuoteRequest[]> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('custom_quotes')
          .select('*')
          .ilike('email', cleanEmail)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((q: any) => ({
            id: q.id,
            referenceNumber: q.reference_number,
            createdAt: new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            fullName: q.full_name,
            email: q.email,
            phone: q.phone || '',
            country: q.country,
            shape: q.shape,
            length: Number(q.length),
            width: Number(q.width),
            unit: q.unit,
            technique: q.technique,
            material: q.material,
            pileDepth: q.pile_depth || '',
            colorPreference: q.color_preference || '',
            estimatedPriceUSD: {
              min: Number(q.estimated_price_min_usd),
              max: Number(q.estimated_price_max_usd),
            },
            roomType: q.room_type || '',
            notes: q.notes,
            status: q.status,
            quotedPriceUSD: q.quoted_price_usd != null ? Number(q.quoted_price_usd) : undefined,
            quotedLeadTime: q.quoted_lead_time || undefined,
            adminReplyMessage: q.admin_reply_message || undefined,
            repliedAt: q.replied_at || undefined,
            depositRequiredUSD: q.deposit_required_usd != null ? Number(q.deposit_required_usd) : undefined,
            designerContact: q.designer_contact || undefined,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch customer quotes failed, checking local:', err);
      }
    }

    const local = getLocalQuotes();
    return local.filter((q) => q.email.toLowerCase().trim() === cleanEmail);
  },

  // 2c. Get quote by reference number
  async getQuoteByReference(refNumber: string): Promise<CustomQuoteRequest | null> {
    const cleanRef = refNumber.trim().toUpperCase();
    if (!cleanRef) return null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('custom_quotes')
          .select('*')
          .eq('reference_number', cleanRef)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            referenceNumber: data.reference_number,
            createdAt: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            fullName: data.full_name,
            email: data.email,
            phone: data.phone || '',
            country: data.country,
            shape: data.shape,
            length: Number(data.length),
            width: Number(data.width),
            unit: data.unit,
            technique: data.technique,
            material: data.material,
            pileDepth: data.pile_depth || '',
            colorPreference: data.color_preference || '',
            estimatedPriceUSD: {
              min: Number(data.estimated_price_min_usd),
              max: Number(data.estimated_price_max_usd),
            },
            roomType: data.room_type || '',
            notes: data.notes,
            status: data.status,
            quotedPriceUSD: data.quoted_price_usd != null ? Number(data.quoted_price_usd) : undefined,
            quotedLeadTime: data.quoted_lead_time || undefined,
            adminReplyMessage: data.admin_reply_message || undefined,
            repliedAt: data.replied_at || undefined,
            depositRequiredUSD: data.deposit_required_usd != null ? Number(data.deposit_required_usd) : undefined,
            designerContact: data.designer_contact || undefined,
          };
        }
      } catch (err) {
        console.warn('Supabase fetch quote by ref failed, checking local:', err);
      }
    }

    const local = getLocalQuotes();
    return local.find((q) => q.referenceNumber.toUpperCase() === cleanRef) || null;
  },

  // 3. Update status (legacy quick helper)
  async updateQuoteStatus(refNumber: string, status: any): Promise<void> {
    return this.updateQuote(refNumber, { status });
  },

  // 4. Update full quote (status, quoted price, lead time, reply message)
  async updateQuote(refNumber: string, updates: Partial<CustomQuoteRequest>): Promise<void> {
    const local = getLocalQuotes();
    const item = local.find((q) => q.referenceNumber === refNumber);
    if (item) {
      Object.assign(item, updates);
      saveLocalQuotes(local);
    }

    if (isSupabaseConfigured() && supabase) {
      const dbPayload: any = { updated_at: new Date().toISOString() };
      if (updates.status !== undefined) dbPayload.status = updates.status;
      if (updates.notes !== undefined) dbPayload.notes = updates.notes;
      if (updates.quotedPriceUSD !== undefined) dbPayload.quoted_price_usd = updates.quotedPriceUSD;
      if (updates.quotedLeadTime !== undefined) dbPayload.quoted_lead_time = updates.quotedLeadTime;
      if (updates.adminReplyMessage !== undefined) dbPayload.admin_reply_message = updates.adminReplyMessage;
      if (updates.repliedAt !== undefined) dbPayload.replied_at = updates.repliedAt;
      if (updates.depositRequiredUSD !== undefined) dbPayload.deposit_required_usd = updates.depositRequiredUSD;

      try {
        const { error } = await supabase
          .from('custom_quotes')
          .update(dbPayload)
          .eq('reference_number', refNumber);

        if (error) {
          console.warn('Initial Supabase quote update error, attempting fallback update:', error);
          // If columns don't exist yet in remote DB, fallback to updating status & notes
          await supabase
            .from('custom_quotes')
            .update({
              status: updates.status,
              notes: updates.notes,
            })
            .eq('reference_number', refNumber);
        }
      } catch (err) {
        console.error('Error updating quote in Supabase:', err);
      }
    }
  },

  // 5. Delete quote (removes spam/test inquiries)
  async deleteQuote(refNumber: string): Promise<void> {
    const local = getLocalQuotes();
    const filtered = local.filter((q) => q.referenceNumber !== refNumber);
    saveLocalQuotes(filtered);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('custom_quotes')
          .delete()
          .eq('reference_number', refNumber);
      } catch (err) {
        console.error('Error deleting quote from Supabase:', err);
      }
    }
  },
};
