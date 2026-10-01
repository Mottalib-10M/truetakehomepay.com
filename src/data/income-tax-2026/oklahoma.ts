/**
 * Oklahoma income tax, tax year 2026
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
      { min: 0, max: 3750, rate: 0 },
      { min: 3750, max: 4900, rate: 0.025 },
      { min: 4900, max: 7200, rate: 0.035 },
      { min: 7200, max: Infinity, rate: 0.045 },
    ],
    mfj: [
      { min: 0, max: 7500, rate: 0 },
      { min: 7500, max: 9800, rate: 0.025 },
      { min: 9800, max: 14400, rate: 0.035 },
      { min: 14400, max: Infinity, rate: 0.045 },
    ],
    mfs: [
      { min: 0, max: 3750, rate: 0 },
      { min: 3750, max: 4900, rate: 0.025 },
      { min: 4900, max: 7200, rate: 0.035 },
      { min: 7200, max: Infinity, rate: 0.045 },
    ],
    hoh: [
      { min: 0, max: 7500, rate: 0 },
      { min: 7500, max: 9800, rate: 0.025 },
      { min: 9800, max: 14400, rate: 0.035 },
      { min: 14400, max: Infinity, rate: 0.045 },
    ],
  },
  standardDeduction: { single: 6350, mfj: 12700, mfs: 6350, hoh: 9500 },
  personalExemption: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1000 },
};

export default config;
