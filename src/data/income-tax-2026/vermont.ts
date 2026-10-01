/**
 * Vermont income tax, tax year 2026
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
      { min: 0, max: 49400, rate: 0.0335 },
      { min: 49400, max: 119700, rate: 0.066 },
      { min: 119700, max: 249700, rate: 0.076 },
      { min: 249700, max: Infinity, rate: 0.0875 },
    ],
    mfj: [
      { min: 0, max: 82500, rate: 0.0335 },
      { min: 82500, max: 199450, rate: 0.066 },
      { min: 199450, max: 304000, rate: 0.076 },
      { min: 304000, max: Infinity, rate: 0.0875 },
    ],
    mfs: [
      { min: 0, max: 49400, rate: 0.0335 },
      { min: 49400, max: 119700, rate: 0.066 },
      { min: 119700, max: 249700, rate: 0.076 },
      { min: 249700, max: Infinity, rate: 0.0875 },
    ],
    hoh: [
      { min: 0, max: 65940, rate: 0.0335 },
      { min: 65940, max: 159780, rate: 0.066 },
      { min: 159780, max: 249700, rate: 0.076 },
      { min: 249700, max: Infinity, rate: 0.0875 },
    ],
  },
  standardDeduction: { single: 7650, mfj: 15300, mfs: 7650, hoh: 11480 },
  personalExemption: { single: 5300, mfj: 10600, mfs: 5300, hoh: 5300 },
};

export default config;
