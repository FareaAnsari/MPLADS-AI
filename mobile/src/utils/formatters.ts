/**
 * Formats a numeric currency value into Indian Rupee standard format (e.g. ₹5,00,000 or ₹1.25 Cr)
 */
export const formatINR = (amount: number, compact = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats standard ISO timestamps into readable localized dates (e.g., "15 Aug 2024")
 */
export const formatDateIN = (isoDateString?: string | null, locale: 'en-IN' | 'hi-IN' = 'en-IN'): string => {
  if (!isoDateString) return '—';
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return isoDateString;
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDateString;
  }
};

/**
 * Formats a percentage value (e.g. 85.5% or 100%)
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  if (isNaN(value) || value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Formats integer count with Indian numbering system (e.g., 1,25,000)
 */
export const formatNumberIN = (count: number): string => {
  if (isNaN(count) || count === null || count === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(count);
};

/**
 * Formats a risk score with appropriate textual label and semantic variant
 */
export const formatRiskScore = (
  score: number,
  isHindi = false
): {
  score: number;
  label: string;
  variant: 'riskLow' | 'riskMedium' | 'riskHigh' | 'riskCritical';
} => {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s >= 90) {
    return {
      score: s,
      label: isHindi ? 'गंभीर जोखिम' : 'Critical Risk',
      variant: 'riskCritical',
    };
  }
  if (s >= 70) {
    return {
      score: s,
      label: isHindi ? 'उच्च जोखिम' : 'High Risk',
      variant: 'riskHigh',
    };
  }
  if (s >= 40) {
    return {
      score: s,
      label: isHindi ? 'मध्यम जोखिम' : 'Medium Risk',
      variant: 'riskMedium',
    };
  }
  return {
    score: s,
    label: isHindi ? 'कम जोखिम' : 'Low Risk',
    variant: 'riskLow',
  };
};
