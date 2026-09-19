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
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch customer quotes failed, checking local:', err);
      }
    }

    const local = getLocalQuotes();
    return local.filter((q) => q.email.toLowerCase().trim() === cleanEmail);
  },

  // 3. Update status
  async updateQuoteStatus(refNumber: string, status: any): Promise<void> {
    const local = getLocalQuotes();
    const item = local.find((q) => q.referenceNumber === refNumber);
    if (item) {
      item.status = status;
      saveLocalQuotes(local);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('custom_quotes')
          .update({ status })
          .eq('reference_number', refNumber);
      } catch (err) {
        console.error('Error updating quote in Supabase:', err);
      }
    }
  },
};
