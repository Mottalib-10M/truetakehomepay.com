/**
 * Vermont Income Tax 2026
 *
 * Vermont has 4 progressive brackets (3.35% to 8.75%).
 * Vermont standard deduction follows federal amounts.
 *
 * Sources:
 * - Vermont Department of Taxes
 * - 32 V.S.A. § 5822
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 45400, rate: 0.0335 },
      { min: 45400, max: 110050, rate: 0.066 },
      { min: 110050, max: 229550, rate: 0.076 },
      { min: 229550, max: Infinity, rate: 0.0875 },
    ],
    mfj: [
      { min: 0, max: 75850, rate: 0.0335 },
      { min: 75850, max: 183700, rate: 0.066 },
      { min: 183700, max: 279750, rate: 0.076 },
      { min: 279750, max: Infinity, rate: 0.0875 },
    ],
    mfs: [
      { min: 0, max: 45400, rate: 0.0335 },
      { min: 45400, max: 110050, rate: 0.066 },
      { min: 110050, max: 229550, rate: 0.076 },
      { min: 229550, max: Infinity, rate: 0.0875 },
    ],
    hoh: [
      { min: 0, max: 60600, rate: 0.0335 },
      { min: 60600, max: 146900, rate: 0.066 },
      { min: 146900, max: 229550, rate: 0.076 },
      { min: 229550, max: Infinity, rate: 0.0875 },
    ],
  },
  standardDeduction: {
    single: 14600,
    mfj: 29200,
    mfs: 14600,
    hoh: 21900,
  },
  personalExemption: {
    single: 4700,
    mfj: 9400,
    mfs: 4700,
    hoh: 4700,
  },
};

export default config;
