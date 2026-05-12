/**
 * Arkansas Income Tax 2026
 *
 * Arkansas has 3 progressive brackets (2% to 4.4%).
 * Brackets are the same for all filing statuses.
 *
 * Sources:
 * - Arkansas Department of Finance and Administration
 * - A.C.A. § 26-51-201
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 5100, rate: 0.02 },
      { min: 5100, max: 10200, rate: 0.04 },
      { min: 10200, max: Infinity, rate: 0.044 },
    ],
    mfj: [
      { min: 0, max: 5100, rate: 0.02 },
      { min: 5100, max: 10200, rate: 0.04 },
      { min: 10200, max: Infinity, rate: 0.044 },
    ],
    mfs: [
      { min: 0, max: 5100, rate: 0.02 },
      { min: 5100, max: 10200, rate: 0.04 },
      { min: 10200, max: Infinity, rate: 0.044 },
    ],
    hoh: [
      { min: 0, max: 5100, rate: 0.02 },
      { min: 5100, max: 10200, rate: 0.04 },
      { min: 10200, max: Infinity, rate: 0.044 },
    ],
  },
  standardDeduction: {
    single: 2340,
    mfj: 4680,
    mfs: 2340,
    hoh: 2340,
  },
};

export default config;
