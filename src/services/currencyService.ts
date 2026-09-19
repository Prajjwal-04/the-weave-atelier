import { Currency, CurrencyRate } from '../types';

const CACHE_KEY_RATES = 'twa_currency_rates_cache';
const CACHE_KEY_TIMESTAMP = 'twa_currency_rates_timestamp';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export const DEFAULT_CURRENCY_RATES: Record<Currency, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, prefix: true, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, prefix: true, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, prefix: true, name: 'British Pound' },
  INR: { code: 'INR', symbol: '₹', rate: 84.0, prefix: true, name: 'Indian Rupee' },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.36, prefix: true, name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'AU$', rate: 1.50, prefix: true, name: 'Australian Dollar' },
};

export interface LiveRatesResult {
  rates: Record<Currency, CurrencyRate>;
  lastUpdated: string;
  source: 'live' | 'cache' | 'fallback';
}

/**
 * Retrieves valid cached rates from localStorage if within the TTL.
 */
export const getCachedRates = (): LiveRatesResult | null => {
  try {
    const cachedRatesStr = localStorage.getItem(CACHE_KEY_RATES);
    const cachedTimestampStr = localStorage.getItem(CACHE_KEY_TIMESTAMP);

    if (!cachedRatesStr || !cachedTimestampStr) {
      return null;
    }

    const timestamp = parseInt(cachedTimestampStr, 10);
    const now = Date.now();

    if (isNaN(timestamp) || now - timestamp > CACHE_TTL_MS) {
      return null;
    }

    const parsedRates = JSON.parse(cachedRatesStr) as Record<Currency, CurrencyRate>;

    // Validate structure
    const isValid = Object.keys(DEFAULT_CURRENCY_RATES).every(
      (code) => parsedRates[code as Currency] && typeof parsedRates[code as Currency].rate === 'number'
    );

    if (!isValid) {
      return null;
    }

    return {
      rates: parsedRates,
      lastUpdated: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'cache',
    };
  } catch (err) {
    console.warn('[CurrencyService] Failed to load cached currency rates:', err);
    return null;
  }
};

/**
 * Saves fresh rates to localStorage with timestamp.
 */
const saveCachedRates = (rates: Record<Currency, CurrencyRate>): void => {
  try {
    localStorage.setItem(CACHE_KEY_RATES, JSON.stringify(rates));
    localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
  } catch (err) {
    console.warn('[CurrencyService] Failed to save currency rates cache:', err);
  }
};

/**
 * Builds our full CurrencyRate records from raw rate numbers (USD base).
 */
const mergeWithDefaults = (rawRates: Record<string, number>): Record<Currency, CurrencyRate> => {
  const merged = { ...DEFAULT_CURRENCY_RATES };

  (Object.keys(DEFAULT_CURRENCY_RATES) as Currency[]).forEach((code) => {
    if (code === 'USD') {
      merged.USD = { ...DEFAULT_CURRENCY_RATES.USD, rate: 1.0 };
    } else if (typeof rawRates[code] === 'number' && rawRates[code] > 0) {
      merged[code] = {
        ...DEFAULT_CURRENCY_RATES[code],
        rate: Number(rawRates[code].toFixed(4)),
      };
    }
  });

  return merged;
};

/**
 * Fetches real-time exchange rates with fallback to secondary API.
 */
export const fetchLiveCurrencyRates = async (): Promise<LiveRatesResult> => {
  // 1. Try Primary API (open.er-api.com) - Free, CORS-friendly, no auth key required
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.rates) {
        const merged = mergeWithDefaults(data.rates);
        saveCachedRates(merged);
        return {
          rates: merged,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'live',
        };
      }
    }
  } catch (primaryErr) {
    console.warn('[CurrencyService] Primary rate API failed, trying secondary fallback:', primaryErr);
  }

  // 2. Try Secondary API (api.frankfurter.app) - European Central Bank backing
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://api.frankfurter.app/latest?from=USD', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.rates) {
        const merged = mergeWithDefaults(data.rates);
        saveCachedRates(merged);
        return {
          rates: merged,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'live',
        };
      }
    }
  } catch (secondaryErr) {
    console.warn('[CurrencyService] Secondary rate API failed:', secondaryErr);
  }

  // 3. Try to use stale cache if available
  try {
    const staleCache = localStorage.getItem(CACHE_KEY_RATES);
    if (staleCache) {
      const parsed = JSON.parse(staleCache);
      return {
        rates: parsed,
        lastUpdated: 'Cached',
        source: 'cache',
      };
    }
  } catch {
    // ignore
  }

  // 4. Default fallback
  return {
    rates: DEFAULT_CURRENCY_RATES,
    lastUpdated: 'Default',
    source: 'fallback',
  };
};
