/**
 * Maryland income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
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
      { min: 250000, max: 500000, rate: 0.0575 },
      { min: 500000, max: 1000000, rate: 0.0625 },
      { min: 1000000, max: Infinity, rate: 0.065 },
    ],
    mfj: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 150000, rate: 0.0475 },
      { min: 150000, max: 175000, rate: 0.05 },
      { min: 175000, max: 225000, rate: 0.0525 },
      { min: 225000, max: 300000, rate: 0.055 },
      { min: 300000, max: 600000, rate: 0.0575 },
      { min: 600000, max: 1200000, rate: 0.0625 },
      { min: 1200000, max: Infinity, rate: 0.065 },
    ],
    mfs: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 100000, rate: 0.0475 },
      { min: 100000, max: 125000, rate: 0.05 },
      { min: 125000, max: 150000, rate: 0.0525 },
      { min: 150000, max: 250000, rate: 0.055 },
      { min: 250000, max: 500000, rate: 0.0575 },
      { min: 500000, max: 1000000, rate: 0.0625 },
      { min: 1000000, max: Infinity, rate: 0.065 },
    ],
    hoh: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 2000, rate: 0.03 },
      { min: 2000, max: 3000, rate: 0.04 },
      { min: 3000, max: 150000, rate: 0.0475 },
      { min: 150000, max: 175000, rate: 0.05 },
      { min: 175000, max: 225000, rate: 0.0525 },
      { min: 225000, max: 300000, rate: 0.055 },
      { min: 300000, max: 600000, rate: 0.0575 },
      { min: 600000, max: 1200000, rate: 0.0625 },
      { min: 1200000, max: Infinity, rate: 0.065 },
    ],
  },
  standardDeduction: { single: 3350, mfj: 6700, mfs: 3350, hoh: 3350 },
  personalExemption: { single: 3200, mfj: 6400, mfs: 3200, hoh: 3200 },
};

export default config;
