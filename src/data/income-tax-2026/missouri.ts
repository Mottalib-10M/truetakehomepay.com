/**
 * Missouri income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 0.02 },
      { min: 2696, max: 4044, rate: 0.025 },
      { min: 4044, max: 5392, rate: 0.03 },
      { min: 5392, max: 6740, rate: 0.035 },
      { min: 6740, max: 8088, rate: 0.04 },
      { min: 8088, max: 9436, rate: 0.045 },
      { min: 9436, max: Infinity, rate: 0.047 },
    ],
    mfj: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 0.02 },
      { min: 2696, max: 4044, rate: 0.025 },
      { min: 4044, max: 5392, rate: 0.03 },
      { min: 5392, max: 6740, rate: 0.035 },
      { min: 6740, max: 8088, rate: 0.04 },
      { min: 8088, max: 9436, rate: 0.045 },
      { min: 9436, max: Infinity, rate: 0.047 },
    ],
    mfs: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 0.02 },
      { min: 2696, max: 4044, rate: 0.025 },
      { min: 4044, max: 5392, rate: 0.03 },
      { min: 5392, max: 6740, rate: 0.035 },
      { min: 6740, max: 8088, rate: 0.04 },
      { min: 8088, max: 9436, rate: 0.045 },
      { min: 9436, max: Infinity, rate: 0.047 },
    ],
    hoh: [
      { min: 0, max: 1348, rate: 0 },
      { min: 1348, max: 2696, rate: 0.02 },
      { min: 2696, max: 4044, rate: 0.025 },
      { min: 4044, max: 5392, rate: 0.03 },
      { min: 5392, max: 6740, rate: 0.035 },
      { min: 6740, max: 8088, rate: 0.04 },
      { min: 8088, max: 9436, rate: 0.045 },
      { min: 9436, max: Infinity, rate: 0.047 },
    ],
  },
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 },
};

export default config;
