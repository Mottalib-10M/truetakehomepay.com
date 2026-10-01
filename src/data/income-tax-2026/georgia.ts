/**
 * Georgia income tax, tax year 2026
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
      { min: 0, max: Infinity, rate: 0.0519 },
    ],
    mfj: [
      { min: 0, max: Infinity, rate: 0.0519 },
    ],
    mfs: [
      { min: 0, max: Infinity, rate: 0.0519 },
    ],
    hoh: [
      { min: 0, max: Infinity, rate: 0.0519 },
    ],
  },
  flatRate: 0.0519,
  standardDeduction: { single: 12000, mfj: 24000, mfs: 12000, hoh: 18000 },
};

export default config;
