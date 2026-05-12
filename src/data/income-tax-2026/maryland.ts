/**
 * Maryland Income Tax 2026
 *
 * Maryland has 8 progressive brackets (2% to 5.75%).
 * Maryland counties also levy local income taxes (handled in local-tax-2026.ts).
 * Standard deduction is 15% of AGI with min/max limits.
 *
 * Sources:
 * - Comptroller of Maryland
 * - Md. Tax-General Code Ann. § 10-105
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 100000, rate: 0.0475 },
      { min: 100000, max: 125000, rate: 0.05 },
      { min: 125000, max: 150000, rate: 0.0525 },
      { min: 150000, max: 250000, rate: 0.055 },
      { min: 250000, max: Infinity, rate: 0.0575 },
    ],
    mfj: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 150000, rate: 0.0475 },
      { min: 150000, max: 175000, rate: 0.05 },
      { min: 175000, max: 225000, rate: 0.0525 },
      { min: 225000, max: 300000, rate: 0.055 },
      { min: 300000, max: Infinity, rate: 0.0575 },
    ],
    mfs: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 100000, rate: 0.0475 },
      { min: 100000, max: 125000, rate: 0.05 },
      { min: 125000, max: 150000, rate: 0.0525 },
      { min: 150000, max: 250000, rate: 0.055 },
      { min: 250000, max: Infinity, rate: 0.0575 },
    ],
    hoh: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 150000, rate: 0.0475 },
      { min: 150000, max: 175000, rate: 0.05 },
      { min: 175000, max: 225000, rate: 0.0525 },
      { min: 225000, max: 300000, rate: 0.055 },
      { min: 300000, max: Infinity, rate: 0.0575 },
    ],
  },
  standardDeduction: {
    single: 2550,
    mfj: 5150,
    mfs: 2550,
    hoh: 2550,
  },
  personalExemption: {
    single: 3200,
    mfj: 6400,
    mfs: 3200,
    hoh: 3200,
  },
};

export default config;
