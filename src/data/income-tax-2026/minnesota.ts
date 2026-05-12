/**
 * Minnesota Income Tax 2026
 *
 * Minnesota has 4 progressive brackets (5.35% to 9.85%).
 *
 * Sources:
 * - Minnesota Department of Revenue
 * - Minn. Stat. § 290.06
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 31690, rate: 0.0535 },
      { min: 31690, max: 104090, rate: 0.068 },
      { min: 104090, max: 183340, rate: 0.0785 },
      { min: 183340, max: Infinity, rate: 0.0985 },
    ],
    mfj: [
      { min: 0, max: 63380, rate: 0.0535 },
      { min: 63380, max: 208180, rate: 0.068 },
      { min: 208180, max: 366680, rate: 0.0785 },
      { min: 366680, max: Infinity, rate: 0.0985 },
    ],
    mfs: [
      { min: 0, max: 31690, rate: 0.0535 },
      { min: 31690, max: 104090, rate: 0.068 },
      { min: 104090, max: 183340, rate: 0.0785 },
      { min: 183340, max: Infinity, rate: 0.0985 },
    ],
    hoh: [
      { min: 0, max: 47540, rate: 0.0535 },
      { min: 47540, max: 156140, rate: 0.068 },
      { min: 156140, max: 275010, rate: 0.0785 },
      { min: 275010, max: Infinity, rate: 0.0985 },
    ],
  },
  standardDeduction: {
    single: 14575,
    mfj: 29150,
    mfs: 14575,
    hoh: 21850,
  },
};

export default config;
