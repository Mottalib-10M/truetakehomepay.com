/**
 * Mississippi income tax, tax year 2026
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
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.04 },
    ],
    mfj: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.04 },
    ],
    mfs: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.04 },
    ],
    hoh: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.04 },
    ],
  },
  standardDeduction: { single: 2300, mfj: 4600, mfs: 2300, hoh: 2300 },
  personalExemption: { single: 6000, mfj: 12000, mfs: 6000, hoh: 6000 },
};

export default config;
