/**
 * Rhode Island Income Tax 2026
 *
 * Rhode Island has 3 progressive brackets (3.75% to 5.99%).
 * Rhode Island also has Temporary Disability Insurance (TDI).
 *
 * Sources:
 * - Rhode Island Division of Taxation
 * - R.I. Gen. Laws § 44-30-2.6
 * - RI Department of Labor and Training (TDI rates)
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 73450, rate: 0.0375 },
      { min: 73450, max: 166950, rate: 0.0475 },
      { min: 166950, max: Infinity, rate: 0.0599 },
    ],
    mfj: [
      { min: 0, max: 73450, rate: 0.0375 },
      { min: 73450, max: 166950, rate: 0.0475 },
      { min: 166950, max: Infinity, rate: 0.0599 },
    ],
    mfs: [
      { min: 0, max: 73450, rate: 0.0375 },
      { min: 73450, max: 166950, rate: 0.0475 },
      { min: 166950, max: Infinity, rate: 0.0599 },
    ],
    hoh: [
      { min: 0, max: 73450, rate: 0.0375 },
      { min: 73450, max: 166950, rate: 0.0475 },
      { min: 166950, max: Infinity, rate: 0.0599 },
    ],
  },
  standardDeduction: {
    single: 10550,
    mfj: 21100,
    mfs: 10550,
    hoh: 10550,
  },
  specialRules: {
    sdi: { rate: 0.012, wageBase: 89600 },
  },
};

export default config;
