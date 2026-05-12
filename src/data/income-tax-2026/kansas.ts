/**
 * Kansas Income Tax 2026
 *
 * Kansas has 3 progressive brackets (3.1% to 5.7%).
 *
 * Sources:
 * - Kansas Department of Revenue
 * - K.S.A. § 79-32,110
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 15000, rate: 0.031 },
      { min: 15000, max: 30000, rate: 0.0525 },
      { min: 30000, max: Infinity, rate: 0.057 },
    ],
    mfj: [
      { min: 0, max: 30000, rate: 0.031 },
      { min: 30000, max: 60000, rate: 0.0525 },
      { min: 60000, max: Infinity, rate: 0.057 },
    ],
    mfs: [
      { min: 0, max: 15000, rate: 0.031 },
      { min: 15000, max: 30000, rate: 0.0525 },
      { min: 30000, max: Infinity, rate: 0.057 },
    ],
    hoh: [
      { min: 0, max: 15000, rate: 0.031 },
      { min: 15000, max: 30000, rate: 0.0525 },
      { min: 30000, max: Infinity, rate: 0.057 },
    ],
  },
  standardDeduction: {
    single: 3500,
    mfj: 8000,
    mfs: 4000,
    hoh: 6000,
  },
  personalExemption: {
    single: 2250,
    mfj: 4500,
    mfs: 2250,
    hoh: 2250,
  },
};

export default config;
