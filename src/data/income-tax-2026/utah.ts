/**
 * Utah income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * The taxpayer credit is 6% of the federal standard deduction and phases out at 1.3 cents per dollar of income above $18,213 (single) or $36,426 (joint).
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: Infinity, rate: 0.045 },
    ],
    mfj: [
      { min: 0, max: Infinity, rate: 0.045 },
    ],
    mfs: [
      { min: 0, max: Infinity, rate: 0.045 },
    ],
    hoh: [
      { min: 0, max: Infinity, rate: 0.045 },
    ],
  },
  flatRate: 0.045,
  personalCredit: { single: 966, mfj: 1932, mfs: 966, hoh: 1449 },
  creditPhaseOut: { rate: 0.013, start: { single: 18213, mfj: 36426, mfs: 18213, hoh: 27320 } },
};

export default config;
