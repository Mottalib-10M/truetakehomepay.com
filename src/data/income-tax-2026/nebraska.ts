/**
 * Nebraska Income Tax 2026
 *
 * Nebraska has 4 progressive brackets (2.46% to 5.84%).
 *
 * Sources:
 * - Nebraska Department of Revenue
 * - Neb. Rev. Stat. § 77-2715.03
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 3700, rate: 0.0246 },
      { min: 3700, max: 22170, rate: 0.0351 },
      { min: 22170, max: 35730, rate: 0.0501 },
      { min: 35730, max: Infinity, rate: 0.0584 },
    ],
    mfj: [
      { min: 0, max: 7400, rate: 0.0246 },
      { min: 7400, max: 44340, rate: 0.0351 },
      { min: 44340, max: 71460, rate: 0.0501 },
      { min: 71460, max: Infinity, rate: 0.0584 },
    ],
    mfs: [
      { min: 0, max: 3700, rate: 0.0246 },
      { min: 3700, max: 22170, rate: 0.0351 },
      { min: 22170, max: 35730, rate: 0.0501 },
      { min: 35730, max: Infinity, rate: 0.0584 },
    ],
    hoh: [
      { min: 0, max: 5550, rate: 0.0246 },
      { min: 5550, max: 33260, rate: 0.0351 },
      { min: 33260, max: 53600, rate: 0.0501 },
      { min: 53600, max: Infinity, rate: 0.0584 },
    ],
  },
  standardDeduction: {
    single: 7900,
    mfj: 15800,
    mfs: 7900,
    hoh: 11600,
  },
};

export default config;
