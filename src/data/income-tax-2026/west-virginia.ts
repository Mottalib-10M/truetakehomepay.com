/**
 * West Virginia income tax, tax year 2026
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
      { min: 0, max: 10000, rate: 0.0222 },
      { min: 10000, max: 25000, rate: 0.0296 },
      { min: 25000, max: 40000, rate: 0.0333 },
      { min: 40000, max: 60000, rate: 0.0444 },
      { min: 60000, max: Infinity, rate: 0.0482 },
    ],
    mfj: [
      { min: 0, max: 10000, rate: 0.0222 },
      { min: 10000, max: 25000, rate: 0.0296 },
      { min: 25000, max: 40000, rate: 0.0333 },
      { min: 40000, max: 60000, rate: 0.0444 },
      { min: 60000, max: Infinity, rate: 0.0482 },
    ],
    mfs: [
      { min: 0, max: 10000, rate: 0.0222 },
      { min: 10000, max: 25000, rate: 0.0296 },
      { min: 25000, max: 40000, rate: 0.0333 },
      { min: 40000, max: 60000, rate: 0.0444 },
      { min: 60000, max: Infinity, rate: 0.0482 },
    ],
    hoh: [
      { min: 0, max: 10000, rate: 0.0222 },
      { min: 10000, max: 25000, rate: 0.0296 },
      { min: 25000, max: 40000, rate: 0.0333 },
      { min: 40000, max: 60000, rate: 0.0444 },
      { min: 60000, max: Infinity, rate: 0.0482 },
    ],
  },
  personalExemption: { single: 2000, mfj: 4000, mfs: 2000, hoh: 2000 },
};

export default config;
