/**
 * Oklahoma Income Tax 2026
 *
 * Oklahoma has 6 progressive brackets (0.25% to 4.75%).
 *
 * Sources:
 * - Oklahoma Tax Commission
 * - 68 O.S. § 2355
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 1000, rate: 0.0025 },
      { min: 1000, max: 2500, rate: 0.0075 },
      { min: 2500, max: 3750, rate: 0.0175 },
      { min: 3750, max: 4900, rate: 0.0275 },
      { min: 4900, max: 7200, rate: 0.0375 },
      { min: 7200, max: Infinity, rate: 0.0475 },
    ],
    mfj: [
      { min: 0, max: 2000, rate: 0.0025 },
      { min: 2000, max: 5000, rate: 0.0075 },
      { min: 5000, max: 7500, rate: 0.0175 },
      { min: 7500, max: 9800, rate: 0.0275 },
      { min: 9800, max: 14400, rate: 0.0375 },
      { min: 14400, max: Infinity, rate: 0.0475 },
    ],
    mfs: [
      { min: 0, max: 1000, rate: 0.0025 },
      { min: 1000, max: 2500, rate: 0.0075 },
      { min: 2500, max: 3750, rate: 0.0175 },
      { min: 3750, max: 4900, rate: 0.0275 },
      { min: 4900, max: 7200, rate: 0.0375 },
      { min: 7200, max: Infinity, rate: 0.0475 },
    ],
    hoh: [
      { min: 0, max: 2000, rate: 0.0025 },
      { min: 2000, max: 5000, rate: 0.0075 },
      { min: 5000, max: 7500, rate: 0.0175 },
      { min: 7500, max: 9800, rate: 0.0275 },
      { min: 9800, max: 14400, rate: 0.0375 },
      { min: 14400, max: Infinity, rate: 0.0475 },
    ],
  },
  standardDeduction: {
    single: 6350,
    mfj: 12700,
    mfs: 6350,
    hoh: 9500,
  },
};

export default config;
