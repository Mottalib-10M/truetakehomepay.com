/**
 * Colorado income tax, tax year 2026
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
      { min: 0, max: Infinity, rate: 0.044 },
    ],
    mfj: [
      { min: 0, max: Infinity, rate: 0.044 },
    ],
    mfs: [
      { min: 0, max: Infinity, rate: 0.044 },
    ],
    hoh: [
      { min: 0, max: Infinity, rate: 0.044 },
    ],
  },
  flatRate: 0.044,
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 },
  specialRules: {
    pfl: { rate: 0.0044, wageBase: 184500 },
  },
};

export default config;
