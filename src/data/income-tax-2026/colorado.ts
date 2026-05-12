/**
 * Colorado Income Tax 2026
 *
 * Colorado has a flat income tax rate of 4.4%.
 * Colorado taxable income starts from federal taxable income.
 *
 * Sources:
 * - Colorado Department of Revenue
 * - C.R.S. § 39-22-104
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.044 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.044 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.044 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.044 }],
  },
  flatRate: 0.044,
};

export default config;
