/**
 * Oregon Income Tax 2026
 *
 * Oregon has 4 progressive brackets (4.75% to 9.9%).
 * Oregon has no sales tax, making income tax the primary revenue source.
 * Oregon also has Paid Family & Medical Leave Insurance (PFMLI).
 *
 * Sources:
 * - Oregon Department of Revenue
 * - ORS § 316.037
 * - Oregon Employment Department (PFMLI rates)
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 4050, rate: 0.0475 },
      { min: 4050, max: 10200, rate: 0.0675 },
      { min: 10200, max: 125000, rate: 0.0875 },
      { min: 125000, max: Infinity, rate: 0.099 },
    ],
    mfj: [
      { min: 0, max: 8100, rate: 0.0475 },
      { min: 8100, max: 20400, rate: 0.0675 },
      { min: 20400, max: 250000, rate: 0.0875 },
      { min: 250000, max: Infinity, rate: 0.099 },
    ],
    mfs: [
      { min: 0, max: 4050, rate: 0.0475 },
      { min: 4050, max: 10200, rate: 0.0675 },
      { min: 10200, max: 125000, rate: 0.0875 },
      { min: 125000, max: Infinity, rate: 0.099 },
    ],
    hoh: [
      { min: 0, max: 8100, rate: 0.0475 },
      { min: 8100, max: 20400, rate: 0.0675 },
      { min: 20400, max: 250000, rate: 0.0875 },
      { min: 250000, max: Infinity, rate: 0.099 },
    ],
  },
  standardDeduction: {
    single: 2605,
    mfj: 5210,
    mfs: 2605,
    hoh: 4195,
  },
  specialRules: {
    pfl: { rate: 0.006, wageBase: 176100 },
  },
};

export default config;
