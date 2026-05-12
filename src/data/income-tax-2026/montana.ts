/**
 * Montana Income Tax 2026
 *
 * Montana has 2 progressive brackets (4.7% and 5.9%) after the
 * 2023 tax reform (SB 121/HB 222) simplified the bracket structure.
 *
 * Sources:
 * - Montana Department of Revenue
 * - MCA § 15-30-2103
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 20500, rate: 0.047 },
      { min: 20500, max: Infinity, rate: 0.059 },
    ],
    mfj: [
      { min: 0, max: 41000, rate: 0.047 },
      { min: 41000, max: Infinity, rate: 0.059 },
    ],
    mfs: [
      { min: 0, max: 20500, rate: 0.047 },
      { min: 20500, max: Infinity, rate: 0.059 },
    ],
    hoh: [
      { min: 0, max: 20500, rate: 0.047 },
      { min: 20500, max: Infinity, rate: 0.059 },
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
