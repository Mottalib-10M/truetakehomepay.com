/**
 * Wisconsin Income Tax 2026
 *
 * Wisconsin has 4 progressive brackets (3.5% to 7.65%).
 *
 * Sources:
 * - Wisconsin Department of Revenue
 * - Wis. Stat. § 71.06
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 14320, rate: 0.035 },
      { min: 14320, max: 28640, rate: 0.044 },
      { min: 28640, max: 315310, rate: 0.053 },
      { min: 315310, max: Infinity, rate: 0.0765 },
    ],
    mfj: [
      { min: 0, max: 19090, rate: 0.035 },
      { min: 19090, max: 38190, rate: 0.044 },
      { min: 38190, max: 420420, rate: 0.053 },
      { min: 420420, max: Infinity, rate: 0.0765 },
    ],
    mfs: [
      { min: 0, max: 9550, rate: 0.035 },
      { min: 9550, max: 19090, rate: 0.044 },
      { min: 19090, max: 210210, rate: 0.053 },
      { min: 210210, max: Infinity, rate: 0.0765 },
    ],
    hoh: [
      { min: 0, max: 14320, rate: 0.035 },
      { min: 14320, max: 28640, rate: 0.044 },
      { min: 28640, max: 315310, rate: 0.053 },
      { min: 315310, max: Infinity, rate: 0.0765 },
    ],
  },
  standardDeduction: {
    single: 12760,
    mfj: 23620,
    mfs: 11810,
    hoh: 16390,
  },
};

export default config;
