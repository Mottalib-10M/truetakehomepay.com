/**
 * US-specific formatting utilities.
 * All money: $1,234.56 (dollar sign before, comma thousands, period decimal, two decimals)
 * All dates: m/d/yyyy
 */

/** Format a number as US currency: $1,234.56 */
export function formatCurrency(value: number, decimals = 2): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

/** Format a number as US currency with no decimals: $1,235 */
export function formatCurrencyRound(value: number): string {
  return formatCurrency(value, 0);
}

/** Format a number as a percentage: 6.20% */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format a number with comma separators: 1,234,567 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a Date as US-style: 1/15/2026 */
export function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/** Parse a US currency string back to a number */
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, '')) || 0;
}

/** Pay frequency labels and divisors */
export const PAY_FREQUENCIES = {
  weekly: { label: 'Weekly', periods: 52 },
  biweekly: { label: 'Bi-weekly', periods: 26 },
  semimonthly: { label: 'Semi-monthly', periods: 24 },
  monthly: { label: 'Monthly', periods: 12 },
  annual: { label: 'Annual', periods: 1 },
} as const;

export type PayFrequency = keyof typeof PAY_FREQUENCIES;

/** Filing status labels */
export const FILING_STATUSES = {
  single: 'Single',
  mfj: 'Married Filing Jointly',
  mfs: 'Married Filing Separately',
  hoh: 'Head of Household',
} as const;

export type FilingStatus = keyof typeof FILING_STATUSES;
