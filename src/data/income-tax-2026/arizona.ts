/**
 * Arizona income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * Standard deduction follows the federal amount (conformity law signed in June 2026).
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: Infinity, rate: 0.025 },
    ],
    mfj: [
      { min: 0, max: Infinity, rate: 0.025 },
    ],
    mfs: [
      { min: 0, max: Infinity, rate: 0.025 },
    ],
    hoh: [
      { min: 0, max: Infinity, rate: 0.025 },
    ],
  },
  flatRate: 0.025,
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 },
};

export default config;
