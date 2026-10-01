/**
 * Minnesota income tax, tax year 2026
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
      { min: 0, max: 33310, rate: 0.0535 },
      { min: 33310, max: 109430, rate: 0.068 },
      { min: 109430, max: 203150, rate: 0.0785 },
      { min: 203150, max: Infinity, rate: 0.0985 },
    ],
    mfj: [
      { min: 0, max: 48700, rate: 0.0535 },
      { min: 48700, max: 193480, rate: 0.068 },
      { min: 193480, max: 337930, rate: 0.0785 },
      { min: 337930, max: Infinity, rate: 0.0985 },
    ],
    mfs: [
      { min: 0, max: 33310, rate: 0.0535 },
      { min: 33310, max: 109430, rate: 0.068 },
      { min: 109430, max: 203150, rate: 0.0785 },
      { min: 203150, max: Infinity, rate: 0.0985 },
    ],
    hoh: [
      { min: 0, max: 40710, rate: 0.0535 },
      { min: 40710, max: 163600, rate: 0.068 },
      { min: 163600, max: 268100, rate: 0.0785 },
      { min: 268100, max: Infinity, rate: 0.0985 },
    ],
  },
  standardDeduction: { single: 15300, mfj: 30600, mfs: 15300, hoh: 22940 },
  specialRules: {
    pfl: { rate: 0.0044, wageBase: 184500 },
  },
};

export default config;
