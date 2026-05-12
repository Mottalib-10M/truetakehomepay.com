/**
 * Iowa Income Tax 2026
 *
 * Iowa has a flat income tax rate of 3.8% (effective 2026).
 * Iowa transitioned from progressive brackets to a flat rate through
 * the 2022 tax reform (SF 2417), with gradual rate reductions.
 *
 * Sources:
 * - Iowa Department of Revenue
 * - SF 2417 (2022) — Iowa Tax Reform
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.038 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.038 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.038 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.038 }],
  },
  flatRate: 0.038,
  standardDeduction: {
    single: 14600,
    mfj: 29200,
    mfs: 14600,
    hoh: 21900,
  },
};

export default config;
