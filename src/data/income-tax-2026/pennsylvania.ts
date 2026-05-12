/**
 * Pennsylvania Income Tax 2026
 *
 * Pennsylvania has a FLAT income tax rate of 3.07%.
 * No standard deduction.
 * Philadelphia has its own city wage tax (handled in local-tax-2026.ts).
 *
 * Sources:
 * - Pennsylvania Department of Revenue
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.0307 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.0307 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.0307 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.0307 }],
  },
  flatRate: 0.0307,
};

export default config;
