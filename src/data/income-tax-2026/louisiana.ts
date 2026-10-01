/**
 * Louisiana income tax, tax year 2026
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
      { min: 0, max: Infinity, rate: 0.03 },
    ],
    mfj: [
      { min: 0, max: Infinity, rate: 0.03 },
    ],
    mfs: [
      { min: 0, max: Infinity, rate: 0.03 },
    ],
    hoh: [
      { min: 0, max: Infinity, rate: 0.03 },
    ],
  },
  flatRate: 0.03,
  standardDeduction: { single: 12875, mfj: 25750, mfs: 12875, hoh: 19310 },
};

export default config;
