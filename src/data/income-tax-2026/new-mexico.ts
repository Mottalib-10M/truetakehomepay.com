/**
 * New Mexico income tax, tax year 2026
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
      { min: 0, max: 5500, rate: 0.015 },
      { min: 5500, max: 16500, rate: 0.032 },
      { min: 16500, max: 33500, rate: 0.043 },
      { min: 33500, max: 66500, rate: 0.047 },
      { min: 66500, max: 210000, rate: 0.049 },
      { min: 210000, max: Infinity, rate: 0.059 },
    ],
    mfj: [
      { min: 0, max: 8000, rate: 0.015 },
      { min: 8000, max: 25000, rate: 0.032 },
      { min: 25000, max: 50000, rate: 0.043 },
      { min: 50000, max: 100000, rate: 0.047 },
      { min: 100000, max: 315000, rate: 0.049 },
      { min: 315000, max: Infinity, rate: 0.059 },
    ],
    mfs: [
      { min: 0, max: 5500, rate: 0.015 },
      { min: 5500, max: 16500, rate: 0.032 },
      { min: 16500, max: 33500, rate: 0.043 },
      { min: 33500, max: 66500, rate: 0.047 },
      { min: 66500, max: 210000, rate: 0.049 },
      { min: 210000, max: Infinity, rate: 0.059 },
    ],
    hoh: [
      { min: 0, max: 5500, rate: 0.015 },
      { min: 5500, max: 16500, rate: 0.032 },
      { min: 16500, max: 33500, rate: 0.043 },
      { min: 33500, max: 66500, rate: 0.047 },
      { min: 66500, max: 210000, rate: 0.049 },
      { min: 210000, max: Infinity, rate: 0.059 },
    ],
  },
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 },
};

export default config;
