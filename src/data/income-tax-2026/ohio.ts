/**
 * Ohio income tax, tax year 2026
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
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: Infinity, rate: 0.0275 },
    ],
    mfj: [
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: Infinity, rate: 0.0275 },
    ],
    mfs: [
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: Infinity, rate: 0.0275 },
    ],
    hoh: [
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: Infinity, rate: 0.0275 },
    ],
  },
  personalExemption: { single: 2400, mfj: 4800, mfs: 2400, hoh: 2400 },
};

export default config;
