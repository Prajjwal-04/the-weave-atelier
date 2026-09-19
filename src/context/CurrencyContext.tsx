import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Currency, CurrencyRate } from '../types';
import {
  DEFAULT_CURRENCY_RATES,
  fetchLiveCurrencyRates,
  getCachedRates,
} from '../services/currencyService';

export const CURRENCY_RATES: Record<Currency, CurrencyRate> = DEFAULT_CURRENCY_RATES;

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceUSD: number) => string;
  convertPrice: (priceUSD: number) => number;
  currentRate: CurrencyRate;
  rates: Record<Currency, CurrencyRate>;
  isLoadingRates: boolean;
  lastUpdated: string | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<Record<Currency, CurrencyRate>>(() => {
    const cached = getCachedRates();
    return cached ? cached.rates : DEFAULT_CURRENCY_RATES;
  });

  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
    const cached = getCachedRates();
    return cached ? cached.lastUpdated : null;
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('twa_currency');
    return (saved && DEFAULT_CURRENCY_RATES[saved as Currency]) ? (saved as Currency) : 'USD';
  });

  const refreshRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const result = await fetchLiveCurrencyRates();
      setRates(result.rates);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      console.warn('[CurrencyContext] Error refreshing rates:', err);
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCachedRates();
    // If no valid cache exists or cache is expired, fetch immediately
    if (!cached) {
      refreshRates();
    }
  }, [refreshRates]);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('twa_currency', c);
  };

  const currentRate = rates[currency] || DEFAULT_CURRENCY_RATES[currency];

  const convertPrice = useCallback((priceUSD: number): number => {
    const rateMultiplier = (rates[currency] || DEFAULT_CURRENCY_RATES[currency]).rate;
    return Math.round(priceUSD * rateMultiplier);
  }, [currency, rates]);

  const formatPrice = useCallback((priceUSD: number): string => {
    const activeRate = rates[currency] || DEFAULT_CURRENCY_RATES[currency];
    const converted = Math.round(priceUSD * activeRate.rate);
    const formatted = converted.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US');
    return `${activeRate.symbol}${formatted}`;
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currentRate,
        rates,
        isLoadingRates,
        lastUpdated,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

