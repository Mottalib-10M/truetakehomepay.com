/**
 * Maine Income Tax 2026
 *
 * Maine has 3 progressive brackets (5.8% to 7.15%).
 *
 * Sources:
 * - Maine Revenue Services
 * - 36 M.R.S. § 5111
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 24500, rate: 0.058 },
      { min: 24500, max: 58050, rate: 0.0675 },
      { min: 58050, max: Infinity, rate: 0.0715 },
    ],
    mfj: [
      { min: 0, max: 49050, rate: 0.058 },
      { min: 49050, max: 116100, rate: 0.0675 },
      { min: 116100, max: Infinity, rate: 0.0715 },
    ],
    mfs: [
      { min: 0, max: 24500, rate: 0.058 },
      { min: 24500, max: 58050, rate: 0.0675 },
      { min: 58050, max: Infinity, rate: 0.0715 },
    ],
    hoh: [
      { min: 0, max: 36750, rate: 0.058 },
      { min: 36750, max: 87100, rate: 0.0675 },
      { min: 87100, max: Infinity, rate: 0.0715 },
    ],
  },
  standardDeduction: {
    single: 14600,
    mfj: 29200,
    mfs: 14600,
    hoh: 21900,
  },
  personalExemption: {
    single: 4700,
    mfj: 9400,
    mfs: 4700,
    hoh: 4700,
  },
};

export default config;
