/**
 * Alabama income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * Standard deduction shown at its floor ($2,500 single, $5,000 joint), reached above about $35,000 of AGI. Federal income tax deductibility is not modelled.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 500, max: 3000, rate: 0.04 },
      { min: 3000, max: Infinity, rate: 0.05 },
    ],
    mfj: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 6000, rate: 0.04 },
      { min: 6000, max: Infinity, rate: 0.05 },
    ],
    mfs: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 500, max: 3000, rate: 0.04 },
      { min: 3000, max: Infinity, rate: 0.05 },
    ],
    hoh: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 6000, rate: 0.04 },
      { min: 6000, max: Infinity, rate: 0.05 },
    ],
  },
  standardDeduction: { single: 2500, mfj: 5000, mfs: 2500, hoh: 2500 },
  personalExemption: { single: 1500, mfj: 3000, mfs: 1500, hoh: 3000 },
};

export default config;
