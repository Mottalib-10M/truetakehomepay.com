/**
 * Oregon income tax, tax year 2026
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
      { min: 0, max: 4550, rate: 0.0475 },
      { min: 4550, max: 11400, rate: 0.0675 },
      { min: 11400, max: 125000, rate: 0.0875 },
      { min: 125000, max: Infinity, rate: 0.099 },
    ],
    mfj: [
      { min: 0, max: 9100, rate: 0.0475 },
      { min: 9100, max: 22800, rate: 0.0675 },
      { min: 22800, max: 250000, rate: 0.0875 },
      { min: 250000, max: Infinity, rate: 0.099 },
    ],
    mfs: [
      { min: 0, max: 4550, rate: 0.0475 },
      { min: 4550, max: 11400, rate: 0.0675 },
      { min: 11400, max: 125000, rate: 0.0875 },
      { min: 125000, max: Infinity, rate: 0.099 },
    ],
    hoh: [
      { min: 0, max: 9100, rate: 0.0475 },
      { min: 9100, max: 22800, rate: 0.0675 },
      { min: 22800, max: 250000, rate: 0.0875 },
      { min: 250000, max: Infinity, rate: 0.099 },
    ],
  },
  standardDeduction: { single: 2910, mfj: 5820, mfs: 2910, hoh: 4690 },
  personalCredit: { single: 256, mfj: 512, mfs: 256, hoh: 256 },
  specialRules: {
    pfl: { rate: 0.006, wageBase: 184500 },
  },
};

export default config;
