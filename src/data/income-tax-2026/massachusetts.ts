/**
 * Massachusetts Income Tax 2026
 *
 * Massachusetts has a flat income tax rate of 5.0%.
 * Plus a 4% surtax on taxable income over $1,000,000 (the "Millionaire's Tax" /
 * Fair Share Amendment, approved by voters in November 2022).
 * The $1M threshold is adjusted annually for inflation.
 *
 * Sources:
 * - Massachusetts Department of Revenue
 * - Article XLIV of the Massachusetts Constitution (Fair Share Amendment)
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [{ min: 0, max: Infinity, rate: 0.05 }],
    mfj: [{ min: 0, max: Infinity, rate: 0.05 }],
    mfs: [{ min: 0, max: Infinity, rate: 0.05 }],
    hoh: [{ min: 0, max: Infinity, rate: 0.05 }],
  },
  flatRate: 0.05,
  personalExemption: {
    single: 4400,
    mfj: 8800,
    mfs: 4400,
    hoh: 6800,
  },
  specialRules: {
    mentalHealthSurtax: { rate: 0.04, threshold: 1000000 },
  },
};

export default config;
