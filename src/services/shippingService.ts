export const shippingService = {
  // Calculate shipping cost based on destination, weight, and order value
  calculateShipping(params: {
    destinationCountry: string;
    totalWeightKg: number;
    subtotalUSD: number;
    freeShippingThresholdUSD?: number;
  }): { costUSD: number; carrier: string; estimatedDays: string; isComplimentary: boolean } {
    const threshold = params.freeShippingThresholdUSD || 1500;

    if (params.subtotalUSD >= threshold) {
      return {
        costUSD: 0,
        carrier: 'Insured Express International',
        estimatedDays: '5–7 business days',
        isComplimentary: true,
      };
    }

    const country = params.destinationCountry.toLowerCase();
    let baseCost = 120; // Default international air freight
    let days = '5–7 business days';
    let carrier = 'Insured Express International';

    if (country.includes('india')) {
      baseCost = 35;
      days = '3–5 business days';
      carrier = 'Express Air (Domestic)';
    } else if (country.includes('united states') || country.includes('canada')) {
      baseCost = 120 + Math.max(0, (params.totalWeightKg - 15) * 4);
      days = '5–7 business days';
      carrier = 'Insured Express Air';
    } else if (
      country.includes('kingdom') ||
      country.includes('germany') ||
      country.includes('france') ||
      country.includes('italy') ||
      country.includes('netherlands') ||
      country.includes('switzerland')
    ) {
      baseCost = 110 + Math.max(0, (params.totalWeightKg - 15) * 4);
      days = '5–7 business days';
      carrier = 'Insured Express Air';
    } else if (country.includes('australia') || country.includes('zealand')) {
      baseCost = 145 + Math.max(0, (params.totalWeightKg - 15) * 5);
      days = '7–10 business days';
      carrier = 'Insured Express Air';
    } else {
      baseCost = 150 + Math.max(0, (params.totalWeightKg - 15) * 5);
      days = '7–12 business days';
      carrier = 'Insured International Express Air';
    }

    return {
      costUSD: Math.round(baseCost),
      carrier,
      estimatedDays: days,
      isComplimentary: false,
    };
  },

  // Generate carrier tracking URL
  getTrackingUrl(carrier: string, trackingNumber: string): string {
    return `https://www.google.com/search?q=${encodeURIComponent(carrier + ' ' + trackingNumber)}`;
  },
};
