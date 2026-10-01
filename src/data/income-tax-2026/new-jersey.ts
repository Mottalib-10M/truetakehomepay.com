/**
 * New Jersey income tax, tax year 2026
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
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.05525 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
    mfj: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 50000, rate: 0.0175 },
      { min: 50000, max: 70000, rate: 0.0245 },
      { min: 70000, max: 80000, rate: 0.035 },
      { min: 80000, max: 150000, rate: 0.05525 },
      { min: 150000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
    mfs: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 35000, rate: 0.0175 },
      { min: 35000, max: 40000, rate: 0.035 },
      { min: 40000, max: 75000, rate: 0.05525 },
      { min: 75000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
    hoh: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20000, max: 50000, rate: 0.0175 },
      { min: 50000, max: 70000, rate: 0.0245 },
      { min: 70000, max: 80000, rate: 0.035 },
      { min: 80000, max: 150000, rate: 0.05525 },
      { min: 150000, max: 500000, rate: 0.0637 },
      { min: 500000, max: 1000000, rate: 0.0897 },
      { min: 1000000, max: Infinity, rate: 0.1075 },
    ],
  },
  personalExemption: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1000 },
  // Employee payroll contributions, 2026: temporary disability 0.19% and family
  // leave 0.23% on wages up to $171,100; unemployment 0.3825% and workforce
  // funds 0.0425% on wages up to $44,800.
  specialRules: {
    sdi: { rate: 0.0042, wageBase: 171100 },
    pfl: { rate: 0.00425, wageBase: 44800 },
  },
};

export default config;
