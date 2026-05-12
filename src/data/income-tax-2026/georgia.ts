/**
 * Georgia Income Tax 2026
 *
 * Georgia transitioned to a flat income tax rate of 5.49% effective 2024,
 * with scheduled reductions in future years. For 2026, the rate is 5.49%.
 * Georgia adopted a standard deduction aligned with simplified flat tax structure.
 *
 * Sources:
 * - Georgia Department of Revenue
 * - HB 1015 (2022) — Tax Reduction and Reform Act
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.0549 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.0549 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.0549 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.0549 }],
  },
  flatRate: 0.0549,
  standardDeduction: {
    single: 12000,
    mfj: 24000,
    mfs: 12000,
    hoh: 18000,
  },
};

export default config;
