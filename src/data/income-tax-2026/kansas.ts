/**
 * Kansas income tax, tax year 2026
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
      { min: 0, max: 23000, rate: 0.052 },
      { min: 23000, max: Infinity, rate: 0.0558 },
    ],
    mfj: [
      { min: 0, max: 46000, rate: 0.052 },
      { min: 46000, max: Infinity, rate: 0.0558 },
    ],
    mfs: [
      { min: 0, max: 23000, rate: 0.052 },
      { min: 23000, max: Infinity, rate: 0.0558 },
    ],
    hoh: [
      { min: 0, max: 23000, rate: 0.052 },
      { min: 23000, max: Infinity, rate: 0.0558 },
    ],
  },
  standardDeduction: { single: 3605, mfj: 8240, mfs: 3605, hoh: 6180 },
  personalExemption: { single: 9160, mfj: 18320, mfs: 9160, hoh: 9160 },
};

export default config;
