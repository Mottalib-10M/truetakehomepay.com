/**
 * Maine income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * Maine sets its own standard deduction from 2026: $15,300 single, $30,600 joint, $22,950 head of household.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 27399, rate: 0.058 },
      { min: 27399, max: 64849, rate: 0.0675 },
      { min: 64849, max: Infinity, rate: 0.0715 },
    ],
    mfj: [
      { min: 0, max: 54849, rate: 0.058 },
      { min: 54849, max: 129749, rate: 0.0675 },
      { min: 129749, max: Infinity, rate: 0.0715 },
    ],
    mfs: [
      { min: 0, max: 27399, rate: 0.058 },
      { min: 27399, max: 64849, rate: 0.0675 },
      { min: 64849, max: Infinity, rate: 0.0715 },
    ],
    hoh: [
      { min: 0, max: 41100, rate: 0.058 },
      { min: 41100, max: 97300, rate: 0.0675 },
      { min: 97300, max: Infinity, rate: 0.0715 },
    ],
  },
  standardDeduction: { single: 15300, mfj: 30600, mfs: 15300, hoh: 22950 },
  personalExemption: { single: 5300, mfj: 10600, mfs: 5300, hoh: 5300 },
  specialRules: {
    pfl: { rate: 0.005, wageBase: 184500 },
  },
};

export default config;
