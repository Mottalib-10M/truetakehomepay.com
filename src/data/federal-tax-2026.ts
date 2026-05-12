/**
 * Federal Tax Data for Tax Year 2026
 *
 * Sources:
 * - IRS Rev. Proc. 2025-11 (inflation adjustments for 2026)
 * - IRS Publication 15-T (Federal Income Tax Withholding)
 * - SSA wage base announcement
 *
 * Note: 2026 values are projected based on IRS inflation adjustment methodology.
 * The Tax Cuts and Jobs Act (TCJA) provisions are set to expire after 2025.
 * These brackets assume TCJA extension or similar legislation for 2026.
 * If TCJA expires, brackets revert to pre-2018 rates — update this file accordingly.
 */

import type { FilingStatus } from '../lib/format-us';

// ─── Federal Income Tax Brackets ───────────────────────────────────────

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export const FEDERAL_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 752800, rate: 0.35 },
    { min: 752800, max: Infinity, rate: 0.37 },
  ],
  mfs: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 376400, rate: 0.35 },
    { min: 376400, max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

// ─── Standard Deduction ────────────────────────────────────────────────

export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15700,
  mfj: 31400,
  mfs: 15700,
  hoh: 23600,
};

// ─── FICA ──────────────────────────────────────────────────────────────

export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE = 176100; // 2026 projected
export const MEDICARE_RATE = 0.0145;
export const ADDITIONAL_MEDICARE_RATE = 0.009;

/** Additional Medicare Tax threshold by filing status */
export const ADDITIONAL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  mfs: 125000,
  hoh: 200000,
};

// ─── Self-Employment Tax ───────────────────────────────────────────────

export const SE_TAX_RATE = 0.9235; // 92.35% of net SE income is subject to SE tax
export const SE_SOCIAL_SECURITY_RATE = 0.124; // Both halves
export const SE_MEDICARE_RATE = 0.029; // Both halves
export const SE_DEDUCTION_FACTOR = 0.5; // Deduct half of SE tax from income

// ─── Supplemental Wage Withholding ─────────────────────────────────────

export const SUPPLEMENTAL_RATE = 0.22; // Flat rate for bonus withholding
export const SUPPLEMENTAL_RATE_OVER_1M = 0.37; // For supplemental wages over $1M

// ─── Capital Gains ─────────────────────────────────────────────────────

export interface CapitalGainsBracket {
  min: number;
  max: number;
  rate: number;
}

export const LONG_TERM_CG_BRACKETS: Record<FilingStatus, CapitalGainsBracket[]> = {
  single: [
    { min: 0, max: 48350, rate: 0.00 },
    { min: 48350, max: 533400, rate: 0.15 },
    { min: 533400, max: Infinity, rate: 0.20 },
  ],
  mfj: [
    { min: 0, max: 96700, rate: 0.00 },
    { min: 96700, max: 600050, rate: 0.15 },
    { min: 600050, max: Infinity, rate: 0.20 },
  ],
  mfs: [
    { min: 0, max: 48350, rate: 0.00 },
    { min: 48350, max: 300025, rate: 0.15 },
    { min: 300025, max: Infinity, rate: 0.20 },
  ],
  hoh: [
    { min: 0, max: 64750, rate: 0.00 },
    { min: 64750, max: 566700, rate: 0.15 },
    { min: 566700, max: Infinity, rate: 0.20 },
  ],
};

// Short-term capital gains taxed as ordinary income (uses FEDERAL_BRACKETS)

// ─── Net Investment Income Tax (NIIT) ──────────────────────────────────

export const NIIT_RATE = 0.038;
export const NIIT_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  mfs: 125000,
  hoh: 200000,
};

// ─── Lottery / Gambling Withholding ────────────────────────────────────

export const LOTTERY_FEDERAL_WITHHOLDING = 0.24; // Mandatory federal withholding
// Actual tax owed depends on total income and bracket

// ─── W-4 Credits (Post-2020 Form) ─────────────────────────────────────

export const CHILD_TAX_CREDIT = 2000; // Per qualifying child under 17
export const OTHER_DEPENDENT_CREDIT = 500; // Per other qualifying dependent

// ─── Federal Minimum Wage ──────────────────────────────────────────────

export const FEDERAL_MINIMUM_WAGE = 7.25; // Unchanged since 2009
