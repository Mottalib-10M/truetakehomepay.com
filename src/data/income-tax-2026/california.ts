/**
 * California income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * The 13.3% top rate includes the 1% mental health services tax above $1 million. State disability insurance is 1.3% of all wages.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 11079, rate: 0.01 },
      { min: 11079, max: 26264, rate: 0.02 },
      { min: 26264, max: 41452, rate: 0.04 },
      { min: 41452, max: 57542, rate: 0.06 },
      { min: 57542, max: 72724, rate: 0.08 },
      { min: 72724, max: 371479, rate: 0.093 },
      { min: 371479, max: 445771, rate: 0.103 },
      { min: 445771, max: 742953, rate: 0.113 },
      { min: 742953, max: 1000000, rate: 0.123 },
      { min: 1000000, max: Infinity, rate: 0.133 },
    ],
    mfj: [
      { min: 0, max: 22158, rate: 0.01 },
      { min: 22158, max: 52528, rate: 0.02 },
      { min: 52528, max: 82904, rate: 0.04 },
      { min: 82904, max: 115084, rate: 0.06 },
      { min: 115084, max: 145448, rate: 0.08 },
      { min: 145448, max: 742958, rate: 0.093 },
      { min: 742958, max: 891542, rate: 0.103 },
      { min: 891542, max: 1000000, rate: 0.113 },
      { min: 1000000, max: 1485906, rate: 0.123 },
      { min: 1485906, max: Infinity, rate: 0.133 },
    ],
    mfs: [
      { min: 0, max: 11079, rate: 0.01 },
      { min: 11079, max: 26264, rate: 0.02 },
      { min: 26264, max: 41452, rate: 0.04 },
      { min: 41452, max: 57542, rate: 0.06 },
      { min: 57542, max: 72724, rate: 0.08 },
      { min: 72724, max: 371479, rate: 0.093 },
      { min: 371479, max: 445771, rate: 0.103 },
      { min: 445771, max: 742953, rate: 0.113 },
      { min: 742953, max: 1000000, rate: 0.123 },
      { min: 1000000, max: Infinity, rate: 0.133 },
    ],
    hoh: [
      { min: 0, max: 22170, rate: 0.01 },
      { min: 22170, max: 52530, rate: 0.02 },
      { min: 52530, max: 67720, rate: 0.04 },
      { min: 67720, max: 83810, rate: 0.06 },
      { min: 83810, max: 98990, rate: 0.08 },
      { min: 98990, max: 505210, rate: 0.093 },
      { min: 505210, max: 606240, rate: 0.103 },
      { min: 606240, max: 1000000, rate: 0.113 },
      { min: 1000000, max: 1010410, rate: 0.123 },
      { min: 1010410, max: Infinity, rate: 0.133 },
    ],
  },
  standardDeduction: { single: 5540, mfj: 11080, mfs: 5540, hoh: 11080 },
  personalCredit: { single: 153, mfj: 306, mfs: 153, hoh: 153 },
  specialRules: {
    sdi: { rate: 0.013 },
  },
};

export default config;
