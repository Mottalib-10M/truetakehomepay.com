/**
 * South Carolina Income Tax 2026
 *
 * South Carolina has a simplified bracket structure after ongoing reform:
 * - 0% on first $3,460
 * - 3% on income from $3,460 to $17,330
 * - 6.4% on income above $17,330
 * The top rate is scheduled to continue decreasing.
 *
 * Sources:
 * - South Carolina Department of Revenue
 * - S.C. Code Ann. § 12-6-510
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17330, rate: 0.03 },
      { min: 17330, max: Infinity, rate: 0.064 },
    ],
    mfj: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17330, rate: 0.03 },
      { min: 17330, max: Infinity, rate: 0.064 },
    ],
    mfs: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17330, rate: 0.03 },
      { min: 17330, max: Infinity, rate: 0.064 },
    ],
    hoh: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17330, rate: 0.03 },
      { min: 17330, max: Infinity, rate: 0.064 },
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
