/**
 * Massachusetts income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * The 9% rate is the 5% base rate plus the 4% surtax above $1,083,150.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 1083150, rate: 0.05 },
      { min: 1083150, max: Infinity, rate: 0.09 },
    ],
    mfj: [
      { min: 0, max: 1083150, rate: 0.05 },
      { min: 1083150, max: Infinity, rate: 0.09 },
    ],
    mfs: [
      { min: 0, max: 1083150, rate: 0.05 },
      { min: 1083150, max: Infinity, rate: 0.09 },
    ],
    hoh: [
      { min: 0, max: 1083150, rate: 0.05 },
      { min: 1083150, max: Infinity, rate: 0.09 },
    ],
  },
  personalExemption: { single: 4400, mfj: 8800, mfs: 4400, hoh: 4400 },
  specialRules: {
    pfl: { rate: 0.0046, wageBase: 184500 },
  },
};

export default config;
