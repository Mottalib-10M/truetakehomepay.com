/**
 * Indiana income tax, tax year 2026
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
      { min: 0, max: Infinity, rate: 0.0295 },
    ],
    mfj: [
      { min: 0, max: Infinity, rate: 0.0295 },
    ],
    mfs: [
      { min: 0, max: Infinity, rate: 0.0295 },
    ],
    hoh: [
      { min: 0, max: Infinity, rate: 0.0295 },
    ],
  },
  flatRate: 0.0295,
  personalExemption: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1000 },
};

export default config;
