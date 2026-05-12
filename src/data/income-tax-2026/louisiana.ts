/**
 * Louisiana Income Tax 2026
 *
 * Louisiana has 3 progressive brackets (1.85% to 4.25%).
 * Brackets are the same for all filing statuses.
 * Louisiana uses the federal standard deduction.
 *
 * Sources:
 * - Louisiana Department of Revenue
 * - La. R.S. 47:32
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 12500, rate: 0.0185 },
      { min: 12500, max: 50000, rate: 0.035 },
      { min: 50000, max: Infinity, rate: 0.0425 },
    ],
    mfj: [
      { min: 0, max: 25000, rate: 0.0185 },
      { min: 25000, max: 100000, rate: 0.035 },
      { min: 100000, max: Infinity, rate: 0.0425 },
    ],
    mfs: [
      { min: 0, max: 12500, rate: 0.0185 },
      { min: 12500, max: 50000, rate: 0.035 },
      { min: 50000, max: Infinity, rate: 0.0425 },
    ],
    hoh: [
      { min: 0, max: 12500, rate: 0.0185 },
      { min: 12500, max: 50000, rate: 0.035 },
      { min: 50000, max: Infinity, rate: 0.0425 },
    ],
  },
  standardDeduction: {
    single: 14600,
    mfj: 29200,
    mfs: 14600,
    hoh: 21900,
  },
};

export default config;
