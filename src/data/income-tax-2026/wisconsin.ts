/**
 * Wisconsin income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * The standard deduction phases out between $20,119 and $136,453 of income (single) and between $29,039 and $159,690 (joint).
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 15110, rate: 0.035 },
      { min: 15110, max: 51950, rate: 0.044 },
      { min: 51950, max: 332720, rate: 0.053 },
      { min: 332720, max: Infinity, rate: 0.0765 },
    ],
    mfj: [
      { min: 0, max: 20150, rate: 0.035 },
      { min: 20150, max: 69260, rate: 0.044 },
      { min: 69260, max: 443630, rate: 0.053 },
      { min: 443630, max: Infinity, rate: 0.0765 },
    ],
    mfs: [
      { min: 0, max: 15110, rate: 0.035 },
      { min: 15110, max: 51950, rate: 0.044 },
      { min: 51950, max: 332720, rate: 0.053 },
      { min: 332720, max: Infinity, rate: 0.0765 },
    ],
    hoh: [
      { min: 0, max: 15110, rate: 0.035 },
      { min: 15110, max: 51950, rate: 0.044 },
      { min: 51950, max: 332720, rate: 0.053 },
      { min: 332720, max: Infinity, rate: 0.0765 },
    ],
  },
  standardDeduction: { single: 13960, mfj: 25840, mfs: 13960, hoh: 17930 },
  personalExemption: { single: 700, mfj: 1400, mfs: 700, hoh: 700 },
  deductionPhaseOut: {
    single: { start: 20119, range: 116334 },
    mfj: { start: 29039, range: 130651 },
    mfs: { start: 20119, range: 116334 },
    hoh: { start: 20119, range: 116334 },
  },
};

export default config;
