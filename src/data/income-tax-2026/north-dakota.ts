/**
 * North Dakota Income Tax 2026
 *
 * North Dakota simplified its income tax in 2023 (SB 2032):
 * - 0% on first $44,725 (effectively exempt)
 * - 1.95% on income from $44,725 to $225,975
 * - 2.5% on income above $225,975
 * Standard deduction follows federal.
 *
 * Sources:
 * - North Dakota Office of State Tax Commissioner
 * - N.D.C.C. § 57-38-30.3
 * - SB 2032 (2023) — Income Tax Reform
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 44725, rate: 0 },
      { min: 44725, max: 225975, rate: 0.0195 },
      { min: 225975, max: Infinity, rate: 0.025 },
    ],
    mfj: [
      { min: 0, max: 74750, rate: 0 },
      { min: 74750, max: 275100, rate: 0.0195 },
      { min: 275100, max: Infinity, rate: 0.025 },
    ],
    mfs: [
      { min: 0, max: 44725, rate: 0 },
      { min: 44725, max: 225975, rate: 0.0195 },
      { min: 225975, max: Infinity, rate: 0.025 },
    ],
    hoh: [
      { min: 0, max: 59750, rate: 0 },
      { min: 59750, max: 250500, rate: 0.0195 },
      { min: 250500, max: Infinity, rate: 0.025 },
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
