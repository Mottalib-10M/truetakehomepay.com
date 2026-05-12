/**
 * Arizona Income Tax 2026
 *
 * Arizona has a flat income tax rate of 2.5% (effective 2023).
 *
 * Sources:
 * - Arizona Department of Revenue
 * - A.R.S. § 43-1011
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.025 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.025 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.025 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.025 }],
  },
  flatRate: 0.025,
  standardDeduction: {
    single: 14600,
    mfj: 29200,
    mfs: 14600,
    hoh: 21900,
  },
};

export default config;
