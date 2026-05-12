/**
 * Connecticut Income Tax 2026
 *
 * Connecticut has 7 progressive brackets (3% to 6.99%).
 * Connecticut also has a "recapture" provision and CT tax credit
 * that effectively phases out lower brackets for high earners.
 *
 * Sources:
 * - Connecticut Department of Revenue Services
 * - C.G.S. § 12-700
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10000, max: 50000, rate: 0.05 },
      { min: 50000, max: 100000, rate: 0.055 },
      { min: 100000, max: 200000, rate: 0.06 },
      { min: 200000, max: 250000, rate: 0.065 },
      { min: 250000, max: 500000, rate: 0.069 },
      { min: 500000, max: Infinity, rate: 0.0699 },
    ],
    mfj: [
      { min: 0, max: 20000, rate: 0.03 },
      { min: 20000, max: 100000, rate: 0.05 },
      { min: 100000, max: 200000, rate: 0.055 },
      { min: 200000, max: 400000, rate: 0.06 },
      { min: 400000, max: 500000, rate: 0.065 },
      { min: 500000, max: 1000000, rate: 0.069 },
      { min: 1000000, max: Infinity, rate: 0.0699 },
    ],
    mfs: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10000, max: 50000, rate: 0.05 },
      { min: 50000, max: 100000, rate: 0.055 },
      { min: 100000, max: 200000, rate: 0.06 },
      { min: 200000, max: 250000, rate: 0.065 },
      { min: 250000, max: 500000, rate: 0.069 },
      { min: 500000, max: Infinity, rate: 0.0699 },
    ],
    hoh: [
      { min: 0, max: 16000, rate: 0.03 },
      { min: 16000, max: 80000, rate: 0.05 },
      { min: 80000, max: 160000, rate: 0.055 },
      { min: 160000, max: 320000, rate: 0.06 },
      { min: 320000, max: 400000, rate: 0.065 },
      { min: 400000, max: 800000, rate: 0.069 },
      { min: 800000, max: Infinity, rate: 0.0699 },
    ],
  },
  personalExemption: {
    single: 15000,
    mfj: 24000,
    mfs: 12000,
    hoh: 19000,
  },
};

export default config;
