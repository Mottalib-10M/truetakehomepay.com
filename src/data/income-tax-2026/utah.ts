/**
 * Utah Income Tax 2026
 *
 * Utah has a flat income tax rate of 4.65%.
 * Utah provides a taxpayer tax credit that effectively creates a
 * zero-bracket amount for lower incomes.
 *
 * Sources:
 * - Utah State Tax Commission
 * - Utah Code § 59-10-104
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.0465 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.0465 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.0465 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.0465 }],
  },
  flatRate: 0.0465,
};

export default config;
