/**
 * Missouri Income Tax 2026
 *
 * Missouri has 7 progressive brackets (2% to 4.8%).
 * Missouri is gradually reducing its top rate.
 *
 * Sources:
 * - Missouri Department of Revenue
 * - Mo. Rev. Stat. § 143.011
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 1207, rate: 0.02 },
      { min: 1207, max: 2414, rate: 0.025 },
      { min: 2414, max: 3621, rate: 0.03 },
      { min: 3621, max: 4828, rate: 0.035 },
      { min: 4828, max: 6035, rate: 0.04 },
      { min: 6035, max: 7242, rate: 0.045 },
      { min: 7242, max: Infinity, rate: 0.048 },
    ],
    mfj: [
      { min: 0, max: 1207, rate: 0.02 },
      { min: 1207, max: 2414, rate: 0.025 },
      { min: 2414, max: 3621, rate: 0.03 },
      { min: 3621, max: 4828, rate: 0.035 },
      { min: 4828, max: 6035, rate: 0.04 },
      { min: 6035, max: 7242, rate: 0.045 },
      { min: 7242, max: Infinity, rate: 0.048 },
    ],
    mfs: [
      { min: 0, max: 1207, rate: 0.02 },
      { min: 1207, max: 2414, rate: 0.025 },
      { min: 2414, max: 3621, rate: 0.03 },
      { min: 3621, max: 4828, rate: 0.035 },
      { min: 4828, max: 6035, rate: 0.04 },
      { min: 6035, max: 7242, rate: 0.045 },
      { min: 7242, max: Infinity, rate: 0.048 },
    ],
    hoh: [
      { min: 0, max: 1207, rate: 0.02 },
      { min: 1207, max: 2414, rate: 0.025 },
      { min: 2414, max: 3621, rate: 0.03 },
      { min: 3621, max: 4828, rate: 0.035 },
      { min: 4828, max: 6035, rate: 0.04 },
      { min: 6035, max: 7242, rate: 0.045 },
      { min: 7242, max: Infinity, rate: 0.048 },
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
