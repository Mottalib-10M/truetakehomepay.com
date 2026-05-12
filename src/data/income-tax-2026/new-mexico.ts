/**
 * New Mexico Income Tax 2026
 *
 * New Mexico has 5 progressive brackets (1.7% to 5.9%).
 *
 * Sources:
 * - New Mexico Taxation and Revenue Department
 * - NMSA § 7-2-7
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 5500, rate: 0.017 },
      { min: 5500, max: 11000, rate: 0.032 },
      { min: 11000, max: 16000, rate: 0.047 },
      { min: 16000, max: 210000, rate: 0.049 },
      { min: 210000, max: Infinity, rate: 0.059 },
    ],
    mfj: [
      { min: 0, max: 11000, rate: 0.017 },
      { min: 11000, max: 22000, rate: 0.032 },
      { min: 22000, max: 32000, rate: 0.047 },
      { min: 32000, max: 420000, rate: 0.049 },
      { min: 420000, max: Infinity, rate: 0.059 },
    ],
    mfs: [
      { min: 0, max: 5500, rate: 0.017 },
      { min: 5500, max: 11000, rate: 0.032 },
      { min: 11000, max: 16000, rate: 0.047 },
      { min: 16000, max: 210000, rate: 0.049 },
      { min: 210000, max: Infinity, rate: 0.059 },
    ],
    hoh: [
      { min: 0, max: 8250, rate: 0.017 },
      { min: 8250, max: 16500, rate: 0.032 },
      { min: 16500, max: 24000, rate: 0.047 },
      { min: 24000, max: 315000, rate: 0.049 },
      { min: 315000, max: Infinity, rate: 0.059 },
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
