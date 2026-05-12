/**
 * Alabama Income Tax 2026
 *
 * Alabama has 3 progressive brackets (2% to 5%).
 * Alabama is unique in allowing a deduction for federal income taxes paid.
 * Standard deduction and personal exemption amounts vary by filing status.
 *
 * Sources:
 * - Alabama Department of Revenue
 * - Code of Alabama § 40-18-5
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 500, max: 3000, rate: 0.04 },
      { min: 3000, max: Infinity, rate: 0.05 },
    ],
    mfj: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 6000, rate: 0.04 },
      { min: 6000, max: Infinity, rate: 0.05 },
    ],
    mfs: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 500, max: 3000, rate: 0.04 },
      { min: 3000, max: Infinity, rate: 0.05 },
    ],
    hoh: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1000, max: 6000, rate: 0.04 },
      { min: 6000, max: Infinity, rate: 0.05 },
    ],
  },
  standardDeduction: {
    single: 2500,
    mfj: 7500,
    mfs: 3750,
    hoh: 2500,
  },
  personalExemption: {
    single: 1500,
    mfj: 3000,
    mfs: 1500,
    hoh: 3000,
  },
};

export default config;
