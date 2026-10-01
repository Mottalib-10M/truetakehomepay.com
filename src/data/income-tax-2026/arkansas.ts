/**
 * Arkansas income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * Table for net income up to $92,300; above that level the 2% and 3.9% rates apply with a bracket adjustment.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 5500, rate: 0 },
      { min: 5500, max: 10900, rate: 0.02 },
      { min: 10900, max: 15600, rate: 0.03 },
      { min: 15600, max: 25700, rate: 0.034 },
      { min: 25700, max: Infinity, rate: 0.039 },
    ],
    mfj: [
      { min: 0, max: 5500, rate: 0 },
      { min: 5500, max: 10900, rate: 0.02 },
      { min: 10900, max: 15600, rate: 0.03 },
      { min: 15600, max: 25700, rate: 0.034 },
      { min: 25700, max: Infinity, rate: 0.039 },
    ],
    mfs: [
      { min: 0, max: 5500, rate: 0 },
      { min: 5500, max: 10900, rate: 0.02 },
      { min: 10900, max: 15600, rate: 0.03 },
      { min: 15600, max: 25700, rate: 0.034 },
      { min: 25700, max: Infinity, rate: 0.039 },
    ],
    hoh: [
      { min: 0, max: 5500, rate: 0 },
      { min: 5500, max: 10900, rate: 0.02 },
      { min: 10900, max: 15600, rate: 0.03 },
      { min: 15600, max: 25700, rate: 0.034 },
      { min: 25700, max: Infinity, rate: 0.039 },
    ],
  },
  standardDeduction: { single: 2470, mfj: 4940, mfs: 2470, hoh: 2470 },
  personalCredit: { single: 29, mfj: 58, mfs: 29, hoh: 29 },
};

export default config;
