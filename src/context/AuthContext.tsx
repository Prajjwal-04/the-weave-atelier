import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CustomQuoteRequest } from '../types';
import { orderService } from '../services/orderService';
import { quoteService } from '../services/quoteService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'prasrirugs@gmail.com';

export const isStoreOwnerEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  const allowed = (ADMIN_EMAIL || '').split(',').map((e) => e.toLowerCase().trim());
  return allowed.includes(cleanEmail);
};

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
  savedAddress?: {
    address: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ error?: string; sessionEstablished?: boolean }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  sendPasswordResetOtp: (email: string) => Promise<{ error?: string; success?: boolean }>;
  resetPasswordWithOtp: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<{ error?: string; success?: boolean }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  updateSavedAddress: (
    savedAddress: UserProfile['savedAddress'],
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  getOrder: (orderNumber: string) => Order | undefined;
  customQuotes: CustomQuoteRequest[];
  addCustomQuote: (quote: CustomQuoteRequest) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('twa_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          const isOwner = isStoreOwnerEmail(parsed.email);
          return {
            ...parsed,
            isAdmin: isOwner,
          };
        }
      } catch (_) {}
    }
    return null;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [customQuotes, setCustomQuotes] = useState<CustomQuoteRequest[]>([]);

  // Strictly fetch orders and quotes scoped to the user's specific email address
  const loadOrdersAndQuotes = async (targetEmail?: string) => {
    const emailToQuery = (targetEmail || user?.email || '').toLowerCase().trim();
    if (!emailToQuery) {
      setOrders([]);
      setCustomQuotes([]);
      return;
    }

    try {
      const userOrders = await orderService.getOrdersForCustomer(emailToQuery);
      setOrders(userOrders);

      const userQuotes = await quoteService.getQuotesForCustomer(emailToQuery);
      setCustomQuotes(userQuotes);
    } catch (e) {
      console.error('Error loading user-scoped orders and quotes:', e);
      setOrders([]);
      setCustomQuotes([]);
    }
  };

  // Re-fetch orders and quotes strictly when the logged-in user changes
  useEffect(() => {
    if (user?.email) {
      loadOrdersAndQuotes(user.email);
    } else {
      setOrders([]);
      setCustomQuotes([]);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      // Restore active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          const meta = session.user.user_metadata || {};
          const fullName = meta.full_name || meta.name || '';
          const parts = fullName.split(' ');
          const email = session.user.email || '';
          const isOwner = isStoreOwnerEmail(email);
          setUser({
            firstName: meta.first_name || parts[0] || email.split('@')[0] || 'Atelier',
            lastName: meta.last_name || parts.slice(1).join(' ') || 'Client',
            email: email,
            phone: session.user.phone || meta.phone || '',
            isAdmin: isOwner,
            savedAddress: meta.saved_address || undefined,
          });
          if (isOwner) {
            localStorage.setItem('twa_admin_auth', 'true');
            localStorage.setItem('twa_admin_user', email);
          } else {
            localStorage.removeItem('twa_admin_auth');
            localStorage.removeItem('twa_admin_user');
          }
          if (email) {
            loadOrdersAndQuotes(email);
          }
        }
      });

      // Listen for auth changes (e.g. Google OAuth redirect, Sign In, Sign Out, Recovery)
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          const meta = session.user.user_metadata || {};
          const fullName = meta.full_name || meta.name || '';
          const parts = fullName.split(' ');
          const email = session.user.email || '';
          const isOwner = isStoreOwnerEmail(email);
          setUser({
            firstName: meta.first_name || parts[0] || email.split('@')[0] || 'Atelier',
            lastName: meta.last_name || parts.slice(1).join(' ') || 'Client',
            email: email,
            phone: session.user.phone || meta.phone || '',
            isAdmin: isOwner,
            savedAddress: meta.saved_address || undefined,
          });
          if (isOwner) {
            localStorage.setItem('twa_admin_auth', 'true');
            localStorage.setItem('twa_admin_user', email);
          } else {
            localStorage.removeItem('twa_admin_auth');
            localStorage.removeItem('twa_admin_user');
          }
          if (email) {
            loadOrdersAndQuotes(email);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setOrders([]);
          setCustomQuotes([]);
          localStorage.removeItem('twa_user');
          localStorage.removeItem('twa_admin_auth');
          localStorage.removeItem('twa_admin_user');
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('twa_user', JSON.stringify(user));
      if (user.isAdmin || isStoreOwnerEmail(user.email)) {
        localStorage.setItem('twa_admin_auth', 'true');
        localStorage.setItem('twa_admin_user', user.email);
      } else {
        localStorage.removeItem('twa_admin_auth');
        localStorage.removeItem('twa_admin_user');
      }
    } else {
      localStorage.removeItem('twa_user');
      localStorage.removeItem('twa_admin_auth');
      localStorage.removeItem('twa_admin_user');
    }
  }, [user]);

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Supabase is not configured.' };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to initialize Google Sign In.' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string
  ): Promise<{ error?: string; sessionEstablished?: boolean }> => {
    const parts = (name || email.split('@')[0]).split(' ');
    const firstName = parts[0] || 'Atelier';
    const lastName = parts.slice(1).join(' ') || 'Client';

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: name || `${firstName} ${lastName}`,
            },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });

        if (error) {
          if (error.message?.toLowerCase().includes('rate limit')) {
            return {
              error:
                'Supabase email rate limit reached. To allow instant registrations without email delays, disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email).',
            };
          }
          return { error: error.message };
        }

        if (data.session && data.user) {
          const userEmail = data.user.email || email;
          const isOwner = isStoreOwnerEmail(userEmail);
          setUser({
            firstName,
            lastName,
            email: userEmail,
            isAdmin: isOwner,
          });
          if (isOwner) {
            localStorage.setItem('twa_admin_auth', 'true');
            localStorage.setItem('twa_admin_user', userEmail);
          } else {
            localStorage.removeItem('twa_admin_auth');
            localStorage.removeItem('twa_admin_user');
          }
          return { sessionEstablished: true };
        }

        // Supabase created user but requires email confirmation
        return {
          sessionEstablished: false,
          error:
            'Registration successful, but your email must be verified. If you did not receive the verification email, disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email) to allow immediate sign-in.',
        };
      } catch (err: any) {
        return { error: err?.message || 'Error creating account.' };
      }
    }

    // Local fallback
    const isOwner = isStoreOwnerEmail(email);
    setUser({
      firstName,
      lastName,
      email,
      isAdmin: isOwner,
    });
    if (isOwner) {
      localStorage.setItem('twa_admin_auth', 'true');
      localStorage.setItem('twa_admin_user', email);
    } else {
      localStorage.removeItem('twa_admin_auth');
      localStorage.removeItem('twa_admin_user');
    }
    return { sessionEstablished: true };
  };

  const signInWithPassword = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message?.toLowerCase().includes('email not confirmed')) {
            return {
              error:
                'Email not confirmed yet. Please verify your email via the link, or disable "Confirm email" in your Supabase Auth settings to remove this restriction.',
            };
          }
          return { error: error.message };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const fullName = meta.full_name || meta.name || '';
          const parts = fullName.split(' ');
          const userEmail = data.user.email || email;
          const isOwner = isStoreOwnerEmail(userEmail);
          setUser({
            firstName: meta.first_name || parts[0] || userEmail.split('@')[0] || 'Atelier',
            lastName: meta.last_name || parts.slice(1).join(' ') || 'Client',
            email: userEmail,
            phone: data.user.phone || meta.phone || '',
            isAdmin: isOwner,
            savedAddress: meta.saved_address || undefined,
          });
          if (isOwner) {
            localStorage.setItem('twa_admin_auth', 'true');
            localStorage.setItem('twa_admin_user', userEmail);
          } else {
            localStorage.removeItem('twa_admin_auth');
            localStorage.removeItem('twa_admin_user');
          }
        }
        return {};
      } catch (err: any) {
        return { error: err?.message || 'Login failed.' };
      }
    }

    // Local fallback
    const parts = email.split('@')[0].split(' ');
    const isOwner = isStoreOwnerEmail(email);
    setUser({
      firstName: parts[0] || 'Atelier',
      lastName: parts.slice(1).join(' ') || 'Client',
      email,
      isAdmin: isOwner,
    });
    if (isOwner) {
      localStorage.setItem('twa_admin_auth', 'true');
      localStorage.setItem('twa_admin_user', email);
    } else {
      localStorage.removeItem('twa_admin_auth');
      localStorage.removeItem('twa_admin_user');
    }
    return {};
  };

  const sendPasswordResetOtp = async (
    email: string
  ): Promise<{ error?: string; success?: boolean }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return { error: 'Please enter your email address.' };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/account?mode=reset`,
        });

        if (error) {
          if (error.message?.toLowerCase().includes('rate limit')) {
            return {
              error:
                'Email rate limit reached. Supabase free tier limits 3-4 emails/hour. Please wait a few minutes before requesting a new code.',
            };
          }
          return { error: error.message };
        }

        return { success: true };
      } catch (err: any) {
        return { error: err?.message || 'Failed to dispatch password recovery email.' };
      }
    }

    // Local fallback
    return { success: true };
  };

  const resetPasswordWithOtp = async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ error?: string; success?: boolean }> => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      return { error: 'Please enter your email address.' };
    }
    if (!cleanOtp) {
      return { error: 'Please enter the 6-digit verification code sent to your email.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long.' };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        // Step 1: Verify OTP with type 'recovery'
        const { data, error: verifyErr } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: 'recovery',
        });

        if (verifyErr) {
          return {
            error:
              verifyErr.message ||
              'Invalid or expired verification code. Please check your email or request a new code.',
          };
        }

        // Step 2: Update the password for the recovery session
        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateErr) {
          return { error: updateErr.message || 'Failed to update password.' };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const fullName = meta.full_name || meta.name || '';
          const parts = fullName.split(' ');
          setUser({
            firstName: meta.first_name || parts[0] || data.user.email?.split('@')[0] || 'Atelier',
            lastName: meta.last_name || parts.slice(1).join(' ') || 'Client',
            email: data.user.email || cleanEmail,
            phone: data.user.phone || meta.phone || '',
            savedAddress: meta.saved_address || undefined,
          });
        }

        return { success: true };
      } catch (err: any) {
        return { error: err?.message || 'Error occurred during password reset.' };
      }
    }

    // Local fallback
    return { success: true };
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ error?: string; success?: boolean }> => {
    if (!newPassword || newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long.' };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };
        return { success: true };
      } catch (err: any) {
        return { error: err?.message || 'Failed to update password.' };
      }
    }

    return { success: true };
  };

  const updateSavedAddress = async (
    savedAddress: UserProfile['savedAddress'],
    phone?: string
  ) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...(phone ? { phone } : {}),
      savedAddress,
    };
    setUser(updated);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.updateUser({
          data: {
            saved_address: savedAddress,
            ...(phone ? { phone } : {}),
          },
        });
      } catch (e) {
        console.warn('Could not sync address to Supabase user metadata:', e);
      }
    }
  };

  const logout = async () => {
    setUser(null);
    setOrders([]);
    setCustomQuotes([]);
    localStorage.removeItem('twa_user');
    localStorage.removeItem('twa_admin_auth');
    localStorage.removeItem('twa_admin_user');
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
  };

  const addOrder = async (order: Order): Promise<void> => {
    // Only update local user state; database persistence is managed by orderService.createOrder
    if (
      user?.email &&
      order.customer.email.toLowerCase().trim() === user.email.toLowerCase().trim()
    ) {
      setOrders((prev) => [order, ...prev.filter((o) => o.orderNumber !== order.orderNumber)]);
    }
  };

  const getOrder = (orderNumber: string): Order | undefined => {
    return orders.find(
      (o) => o.orderNumber.toUpperCase().trim() === orderNumber.toUpperCase().trim()
    );
  };

  const addCustomQuote = async (quote: CustomQuoteRequest): Promise<void> => {
    // Only update local user state; database persistence is managed by quoteService.submitQuote
    if (
      user?.email &&
      quote.email.toLowerCase().trim() === user.email.toLowerCase().trim()
    ) {
      setCustomQuotes((prev) => [quote, ...prev.filter((q) => q.referenceNumber !== quote.referenceNumber)]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        signInWithGoogle,
        signUpWithEmail,
        signInWithPassword,
        sendPasswordResetOtp,
        resetPasswordWithOtp,
        updatePassword,
        updateSavedAddress,
        logout,
        orders,
        addOrder,
        getOrder,
        customQuotes,
        addCustomQuote,
        refreshUserData: () => loadOrdersAndQuotes(user?.email),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
