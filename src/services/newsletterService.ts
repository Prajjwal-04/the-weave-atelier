import { supabase, isSupabaseConfigured } from './supabase';

export interface NewsletterSubscribeResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
}

const LOCAL_STORAGE_KEY = 'twa_newsletter_subscribers';

export const newsletterService = {
  /**
   * Subscribe an email address to the atelier newsletter / correspondence list.
   */
  async subscribe(email: string): Promise<NewsletterSubscribeResult> {
    const cleanEmail = email.trim().toLowerCase();

    // Basic format check
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return {
        success: false,
        message: 'Please provide a valid email address.',
      };
    }

    // Always record locally as fallback
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      if (!existing.includes(cleanEmail)) {
        existing.push(cleanEmail);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('[Newsletter] Failed to cache subscriber locally:', e);
    }

    // If Supabase is active, persist to database
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert([{ email: cleanEmail }]);

        if (error) {
          // PostgreSQL code 23505 is unique violation
          if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('already exists')) {
            return {
              success: true,
              alreadySubscribed: true,
              message: 'You are already subscribed to The Atelier Letter.',
            };
          }
          console.warn('[Newsletter] Supabase insert warning:', error);
        } else {
          return {
            success: true,
            message: 'Thank you. You have been added to the atelier correspondence list.',
          };
        }
      } catch (err) {
        console.warn('[Newsletter] Network error saving subscriber:', err);
      }
    }

    return {
      success: true,
      message: 'Thank you. You have been added to the atelier correspondence list.',
    };
  },

  /**
   * Retrieve list of subscribers (for Admin Dashboard)
   */
  async getSubscribers(): Promise<Array<{ id?: string; email: string; subscribed_at?: string }>> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('subscribed_at', { ascending: false });

        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('[Newsletter] Failed to fetch subscribers from Supabase:', err);
      }
    }

    // Fallback to local storage
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      return stored.map((email, idx) => ({
        id: `local-sub-${idx}`,
        email,
        subscribed_at: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },
};
