/**
 * Virginia income tax, tax year 2026
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
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3000, max: 5000, rate: 0.03 },
      { min: 5000, max: 17000, rate: 0.05 },
      { min: 17000, max: Infinity, rate: 0.0575 },
    ],
    mfj: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3000, max: 5000, rate: 0.03 },
      { min: 5000, max: 17000, rate: 0.05 },
      { min: 17000, max: Infinity, rate: 0.0575 },
    ],
    mfs: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3000, max: 5000, rate: 0.03 },
      { min: 5000, max: 17000, rate: 0.05 },
      { min: 17000, max: Infinity, rate: 0.0575 },
    ],
    hoh: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3000, max: 5000, rate: 0.03 },
      { min: 5000, max: 17000, rate: 0.05 },
      { min: 17000, max: Infinity, rate: 0.0575 },
    ],
  },
  standardDeduction: { single: 8750, mfj: 17500, mfs: 8750, hoh: 8750 },
  personalExemption: { single: 930, mfj: 1860, mfs: 930, hoh: 930 },
};

export default config;
