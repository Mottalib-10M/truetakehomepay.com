/**
 * Illinois Income Tax 2026
 *
 * Illinois has a flat income tax rate of 4.95%.
 * The Illinois Constitution requires a flat-rate income tax.
 * No standard deduction; Illinois provides a personal exemption instead.
 *
 * Sources:
 * - Illinois Department of Revenue
 * - 35 ILCS 5/201
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.0495 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.0495 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.0495 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.0495 }],
  },
  flatRate: 0.0495,
  personalExemption: {
    single: 2625,
    mfj: 5250,
    mfs: 2625,
    hoh: 2625,
  },
};

export default config;
