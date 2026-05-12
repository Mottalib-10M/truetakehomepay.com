/**
 * New York State Income Tax 2026
 *
 * New York has 9 progressive brackets (4% to 10.9%)
 * NYC has additional city income tax (handled in local-tax-2026.ts)
 * Yonkers has surcharge on NY state tax
 *
 * Sources:
 * - New York State Department of Taxation and Finance
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.0585 },
      { min: 80650, max: 215400, rate: 0.0625 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 },
    ],
    mfj: [
      { min: 0, max: 17150, rate: 0.04 },
      { min: 17150, max: 23600, rate: 0.045 },
      { min: 23600, max: 27900, rate: 0.0525 },
      { min: 27900, max: 161550, rate: 0.0585 },
      { min: 161550, max: 323200, rate: 0.0625 },
      { min: 323200, max: 2155350, rate: 0.0685 },
      { min: 2155350, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 },
    ],
    mfs: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.0585 },
      { min: 80650, max: 215400, rate: 0.0625 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 },
    ],
    hoh: [
      { min: 0, max: 12800, rate: 0.04 },
      { min: 12800, max: 17650, rate: 0.045 },
      { min: 17650, max: 20900, rate: 0.0525 },
      { min: 20900, max: 107650, rate: 0.0585 },
      { min: 107650, max: 269300, rate: 0.0625 },
      { min: 269300, max: 1616450, rate: 0.0685 },
      { min: 1616450, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 },
    ],
  },
  standardDeduction: {
    single: 8000,
    mfj: 16050,
    mfs: 8000,
    hoh: 11200,
  },
};

export default config;
