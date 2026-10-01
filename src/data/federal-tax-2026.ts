/**
 * Federal Tax Data for Tax Year 2026
 *
 * Sources:
 * - IRS Rev. Proc. 2025-32 (inflation adjustments for tax year 2026, after
 *   the One Big Beautiful Bill Act made the 2017 rate structure permanent)
 * - IRS Publication 15-T (Federal Income Tax Withholding)
 * - SSA: contribution and benefit base of $184,500 for 2026
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
    { min: 0, max: 12400, rate: 0.10 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 640600, rate: 0.35 },
    { min: 640600, max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 24800, rate: 0.10 },
    { min: 24800, max: 100800, rate: 0.12 },
    { min: 100800, max: 211400, rate: 0.22 },
    { min: 211400, max: 403550, rate: 0.24 },
    { min: 403550, max: 512450, rate: 0.32 },
    { min: 512450, max: 768700, rate: 0.35 },
    { min: 768700, max: Infinity, rate: 0.37 },
  ],
  mfs: [
    { min: 0, max: 12400, rate: 0.10 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 384350, rate: 0.35 },
    { min: 384350, max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17700, rate: 0.10 },
    { min: 17700, max: 67450, rate: 0.12 },
    { min: 67450, max: 105700, rate: 0.22 },
    { min: 105700, max: 201750, rate: 0.24 },
    { min: 201750, max: 256200, rate: 0.32 },
    { min: 256200, max: 640600, rate: 0.35 },
    { min: 640600, max: Infinity, rate: 0.37 },
  ],
};

// ─── Standard Deduction ────────────────────────────────────────────────

export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 16100,
  mfj: 32200,
  mfs: 16100,
  hoh: 24150,
};

// ─── FICA ──────────────────────────────────────────────────────────────

export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE = 184500; // SSA, 2026
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
    { min: 0, max: 49450, rate: 0.00 },
    { min: 49450, max: 545500, rate: 0.15 },
    { min: 545500, max: Infinity, rate: 0.20 },
  ],
  mfj: [
    { min: 0, max: 98900, rate: 0.00 },
    { min: 98900, max: 613700, rate: 0.15 },
    { min: 613700, max: Infinity, rate: 0.20 },
  ],
  mfs: [
    { min: 0, max: 49450, rate: 0.00 },
    { min: 49450, max: 306850, rate: 0.15 },
    { min: 306850, max: Infinity, rate: 0.20 },
  ],
  hoh: [
    { min: 0, max: 66200, rate: 0.00 },
    { min: 66200, max: 579600, rate: 0.15 },
    { min: 579600, max: Infinity, rate: 0.20 },
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

export const CHILD_TAX_CREDIT = 2200; // Per qualifying child under 17
export const OTHER_DEPENDENT_CREDIT = 500; // Per other qualifying dependent

// ─── Federal Minimum Wage ──────────────────────────────────────────────

export const FEDERAL_MINIMUM_WAGE = 7.25; // Unchanged since 2009
