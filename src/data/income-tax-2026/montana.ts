/**
 * Montana income tax, tax year 2026
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
      { min: 0, max: 47500, rate: 0.047 },
      { min: 47500, max: Infinity, rate: 0.0565 },
    ],
    mfj: [
      { min: 0, max: 95000, rate: 0.047 },
      { min: 95000, max: Infinity, rate: 0.0565 },
    ],
    mfs: [
      { min: 0, max: 47500, rate: 0.047 },
      { min: 47500, max: Infinity, rate: 0.0565 },
    ],
    hoh: [
      { min: 0, max: 47500, rate: 0.047 },
      { min: 47500, max: Infinity, rate: 0.0565 },
    ],
  },
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 },
};

export default config;
