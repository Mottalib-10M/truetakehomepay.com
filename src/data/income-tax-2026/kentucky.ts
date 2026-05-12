/**
 * Kentucky Income Tax 2026
 *
 * Kentucky has a flat income tax rate of 4.0% (reduced from 4.5% in 2024).
 * Kentucky standard deduction follows federal.
 *
 * Sources:
 * - Kentucky Department of Revenue
 * - HB 8 (2022) — Kentucky Tax Modernization
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.04 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.04 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.04 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.04 }],
  },
  flatRate: 0.04,
  standardDeduction: {
    single: 3160,
    mfj: 6320,
    mfs: 3160,
    hoh: 3160,
  },
};

export default config;
