/**
 * Ohio Income Tax 2026
 *
 * Ohio has a simplified bracket structure after 2024 reforms:
 * - 0% on first $26,050
 * - 2.75% on income from $26,050 to $100,000
 * - 3.5% on income above $100,000
 * Ohio does not have a standard deduction but provides a personal exemption.
 * Ohio cities may levy local income taxes (handled in local-tax-2026.ts).
 *
 * Sources:
 * - Ohio Department of Taxation
 * - O.R.C. § 5747.02
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: 100000, rate: 0.0275 },
      { min: 100000, max: Infinity, rate: 0.035 },
    ],
    mfj: [
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: 100000, rate: 0.0275 },
      { min: 100000, max: Infinity, rate: 0.035 },
    ],
    mfs: [
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: 100000, rate: 0.0275 },
      { min: 100000, max: Infinity, rate: 0.035 },
    ],
    hoh: [
      { min: 0, max: 26050, rate: 0 },
      { min: 26050, max: 100000, rate: 0.0275 },
      { min: 100000, max: Infinity, rate: 0.035 },
    ],
  },
  personalExemption: {
    single: 2400,
    mfj: 4800,
    mfs: 2400,
    hoh: 2400,
  },
};

export default config;
