/**
 * Mississippi Income Tax 2026
 *
 * Mississippi has a flat income tax rate of 4.7% (after eliminating lower brackets).
 * The first $10,000 of taxable income is exempt.
 *
 * Sources:
 * - Mississippi Department of Revenue
 * - HB 531 (2022) — Mississippi Tax Freedom Act
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.047 },
    ],
    mfj: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.047 },
    ],
    mfs: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.047 },
    ],
    hoh: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: Infinity, rate: 0.047 },
    ],
  },
  flatRate: 0.047,
  standardDeduction: {
    single: 2300,
    mfj: 4600,
    mfs: 2300,
    hoh: 2300,
  },
};

export default config;
