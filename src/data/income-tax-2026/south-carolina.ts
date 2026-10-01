/**
 * South Carolina income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * H.4216 (signed 30 March 2026): 1.99% below $30,000 and 5.21% above; the South Carolina Income Adjusted Deduction replaces the federal standard deduction and phases out with federal AGI.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 30000, rate: 0.0199 },
      { min: 30000, max: Infinity, rate: 0.0521 },
    ],
    mfj: [
      { min: 0, max: 30000, rate: 0.0199 },
      { min: 30000, max: Infinity, rate: 0.0521 },
    ],
    mfs: [
      { min: 0, max: 30000, rate: 0.0199 },
      { min: 30000, max: Infinity, rate: 0.0521 },
    ],
    hoh: [
      { min: 0, max: 30000, rate: 0.0199 },
      { min: 30000, max: Infinity, rate: 0.0521 },
    ],
  },
  standardDeduction: { single: 15000, mfj: 30000, mfs: 15000, hoh: 22500 },
  deductionPhaseOut: {
    single: { start: 40000, range: 55000 },
    mfj: { start: 80000, range: 110000 },
    mfs: { start: 40000, range: 55000 },
    hoh: { start: 60000, range: 82500 },
  },
};

export default config;
