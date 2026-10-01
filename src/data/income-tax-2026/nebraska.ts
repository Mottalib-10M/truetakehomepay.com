/**
 * Nebraska income tax, tax year 2026
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
      { min: 0, max: 4130, rate: 0.0246 },
      { min: 4130, max: 24760, rate: 0.0351 },
      { min: 24760, max: Infinity, rate: 0.0455 },
    ],
    mfj: [
      { min: 0, max: 8250, rate: 0.0246 },
      { min: 8250, max: 49530, rate: 0.0351 },
      { min: 49530, max: Infinity, rate: 0.0455 },
    ],
    mfs: [
      { min: 0, max: 4130, rate: 0.0246 },
      { min: 4130, max: 24760, rate: 0.0351 },
      { min: 24760, max: Infinity, rate: 0.0455 },
    ],
    hoh: [
      { min: 0, max: 4130, rate: 0.0246 },
      { min: 4130, max: 24760, rate: 0.0351 },
      { min: 24760, max: Infinity, rate: 0.0455 },
    ],
  },
  standardDeduction: { single: 8850, mfj: 17700, mfs: 8850, hoh: 12990 },
  personalCredit: { single: 176, mfj: 352, mfs: 176, hoh: 176 },
};

export default config;
