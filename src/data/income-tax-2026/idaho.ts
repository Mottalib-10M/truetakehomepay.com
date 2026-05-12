/**
 * Idaho Income Tax 2026
 *
 * Idaho has a flat income tax rate of 5.8% (effective 2023).
 *
 * Sources:
 * - Idaho State Tax Commission
 * - HB 436 (2022) — Income Tax Reform
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.058 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.058 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.058 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.058 }],
  },
  flatRate: 0.058,
  standardDeduction: {
    single: 14600,
    mfj: 29200,
    mfs: 14600,
    hoh: 21900,
  },
};

export default config;
