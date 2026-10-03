/**
 * Dimension Normalization & Parsing Utility
 * Keeps variant dimensionsFt and size fields in 100% sync,
 * supporting flexible formats like "4x6", "4' × 6'", "5' × 8' (152 × 244 cm)".
 */

export interface ParsedDimensions {
  dimensionsFt: string; // e.g. "4' × 6'"
  size: string;         // e.g. "4' × 6' (122 × 183 cm)"
}

export function parseRugDimensions(input: string | undefined | null): ParsedDimensions {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return {
      dimensionsFt: "8' × 10'",
      size: "8' × 10' (244 × 305 cm)",
    };
  }

  const str = input.trim();

  // 1. If already contains parentheses with metric details, e.g. "5' × 8' (152 × 244 cm)"
  if (str.includes('(') && str.includes(')')) {
    const parts = str.split('(');
    const ftPart = parts[0].trim().replace(/\s+x\s+/i, ' × ');
    const cmPart = parts[1].replace(')', '').trim();
    return {
      dimensionsFt: ftPart,
      size: `${ftPart} (${cmPart})`,
    };
  }

  // 2. Parse standard dimension patterns: "4x6", "4 x 6", "4' x 6'", "2.5 x 10 runner", "6 round"
  const match = str.match(
    /([0-9]+(?:\.[0-9]+)?)\s*(?:'|ft|feet)?\s*(?:[x×*]|by)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:'|ft|feet)?(?:\s*([a-zA-Z]+))?/i
  );

  if (match) {
    const wFt = parseFloat(match[1]);
    const lFt = parseFloat(match[2]);
    const extra = match[3] ? ` ${match[3].charAt(0).toUpperCase()}${match[3].slice(1).toLowerCase()}` : '';

    const wCm = Math.round(wFt * 30.48);
    const lCm = Math.round(lFt * 30.48);

    const ftStr = `${wFt}' × ${lFt}'${extra}`;
    const cmStr = `${wCm} × ${lCm} cm`;

    return {
      dimensionsFt: ftStr,
      size: `${ftStr} (${cmStr})`,
    };
  }

  // 3. Single dimension for round rugs: e.g. "6' Round" or "6ft Round"
  const roundMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:'|ft|feet)?\s*(round|circle|diameter)/i);
  if (roundMatch) {
    const dFt = parseFloat(roundMatch[1]);
    const dCm = Math.round(dFt * 30.48);
    const ftStr = `${dFt}' Round`;
    const cmStr = `${dCm} cm Dia.`;
    return {
      dimensionsFt: ftStr,
      size: `${ftStr} (${cmStr})`,
    };
  }

  // Fallback to the raw string if non-standard
  return {
    dimensionsFt: str,
    size: str,
  };
}

/**
 * Returns safe primary (imperial) and secondary (metric) dimensions for UI buttons,
 * resolving any conflicts between variant.size and variant.dimensionsFt.
 */
export function getVariantDisplayDimensions(variant: {
  size?: string;
  dimensionsFt?: string;
}): { primary: string; secondary: string } {
  const rawSize = (variant.size || '').trim();
  const rawDim = (variant.dimensionsFt || '').trim();

  // If size is provided and has metric details, e.g. "5' × 8' (152 × 244 cm)"
  if (rawSize.includes('(') && rawSize.includes(')')) {
    const parts = rawSize.split('(');
    const primary = rawDim && !rawDim.includes('(') ? rawDim : parts[0].trim();
    const secondary = parts[1].replace(')', '').trim();
    return { primary, secondary };
  }

  // If size was updated to a custom dimension (like "4x6" or "4' × 6'"):
  // Check if rawDim is outdated (e.g. rawDim says 8x10 while rawSize says 4x6)
  if (rawSize) {
    const parsed = parseRugDimensions(rawSize);
    const secondary = parsed.size.includes('(')
      ? parsed.size.split('(')[1].replace(')', '').trim()
      : '';
    return {
      primary: parsed.dimensionsFt || rawSize,
      secondary,
    };
  }

  // Fallback to dimensionsFt
  if (rawDim) {
    const parsed = parseRugDimensions(rawDim);
    const secondary = parsed.size.includes('(')
      ? parsed.size.split('(')[1].replace(')', '').trim()
      : '';
    return {
      primary: parsed.dimensionsFt || rawDim,
      secondary,
    };
  }

  return { primary: "8' × 10'", secondary: '244 × 305 cm' };
}
