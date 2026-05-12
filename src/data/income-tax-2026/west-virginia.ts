/**
 * West Virginia Income Tax 2026
 *
 * West Virginia has 4 progressive brackets (2.36% to 4.72%) after the
 * 2024 tax reform reduced rates from the previous structure.
 * Standard deduction follows federal amounts.
 *
 * Sources:
 * - West Virginia State Tax Department
 * - W. Va. Code § 11-21-4e
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 10000, rate: 0.0236 },
      { min: 10000, max: 25000, rate: 0.0315 },
      { min: 25000, max: 40000, rate: 0.0354 },
      { min: 40000, max: Infinity, rate: 0.0472 },
    ],
    mfj: [
      { min: 0, max: 10000, rate: 0.0236 },
      { min: 10000, max: 25000, rate: 0.0315 },
      { min: 25000, max: 40000, rate: 0.0354 },
      { min: 40000, max: Infinity, rate: 0.0472 },
    ],
    mfs: [
      { min: 0, max: 5000, rate: 0.0236 },
      { min: 5000, max: 12500, rate: 0.0315 },
      { min: 12500, max: 20000, rate: 0.0354 },
      { min: 20000, max: Infinity, rate: 0.0472 },
    ],
    hoh: [
      { min: 0, max: 10000, rate: 0.0236 },
      { min: 10000, max: 25000, rate: 0.0315 },
      { min: 25000, max: 40000, rate: 0.0354 },
      { min: 40000, max: Infinity, rate: 0.0472 },
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
