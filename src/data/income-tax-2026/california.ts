/**
 * California Income Tax 2026
 *
 * California has 10 progressive brackets (1% to 12.3%)
 * Plus 1% Mental Health Services Tax on income over $1,000,000
 * Plus California SDI (State Disability Insurance)
 *
 * Sources:
 * - California Franchise Tax Board (FTB)
 * - EDD (Employment Development Department) for SDI rates
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 10756, rate: 0.01 },
      { min: 10756, max: 25499, rate: 0.02 },
      { min: 25499, max: 40245, rate: 0.04 },
      { min: 40245, max: 55866, rate: 0.06 },
      { min: 55866, max: 70611, rate: 0.08 },
      { min: 70611, max: 360660, rate: 0.093 },
      { min: 360660, max: 432792, rate: 0.103 },
      { min: 432792, max: 721320, rate: 0.113 },
      { min: 721320, max: 1000000, rate: 0.123 },
      { min: 1000000, max: Infinity, rate: 0.123 },
    ],
    mfj: [
      { min: 0, max: 21512, rate: 0.01 },
      { min: 21512, max: 50998, rate: 0.02 },
      { min: 50998, max: 80490, rate: 0.04 },
      { min: 80490, max: 111732, rate: 0.06 },
      { min: 111732, max: 141222, rate: 0.08 },
      { min: 141222, max: 721320, rate: 0.093 },
      { min: 721320, max: 865584, rate: 0.103 },
      { min: 865584, max: 1000000, rate: 0.113 },
      { min: 1000000, max: 1442640, rate: 0.123 },
      { min: 1442640, max: Infinity, rate: 0.123 },
    ],
    mfs: [
      { min: 0, max: 10756, rate: 0.01 },
      { min: 10756, max: 25499, rate: 0.02 },
      { min: 25499, max: 40245, rate: 0.04 },
      { min: 40245, max: 55866, rate: 0.06 },
      { min: 55866, max: 70611, rate: 0.08 },
      { min: 70611, max: 360660, rate: 0.093 },
      { min: 360660, max: 432792, rate: 0.103 },
      { min: 432792, max: 721320, rate: 0.113 },
      { min: 721320, max: 1000000, rate: 0.123 },
      { min: 1000000, max: Infinity, rate: 0.123 },
    ],
    hoh: [
      { min: 0, max: 21527, rate: 0.01 },
      { min: 21527, max: 51000, rate: 0.02 },
      { min: 51000, max: 65744, rate: 0.04 },
      { min: 65744, max: 81365, rate: 0.06 },
      { min: 81365, max: 96111, rate: 0.08 },
      { min: 96111, max: 490493, rate: 0.093 },
      { min: 490493, max: 588593, rate: 0.103 },
      { min: 588593, max: 980986, rate: 0.113 },
      { min: 980986, max: 1000000, rate: 0.123 },
      { min: 1000000, max: Infinity, rate: 0.123 },
    ],
  },
  standardDeduction: {
    single: 5540,
    mfj: 11080,
    mfs: 5540,
    hoh: 11080,
  },
  specialRules: {
    // California SDI — 1.1% with no wage base cap (as of 2024, verify for 2026)
    sdi: { rate: 0.011 },
    // Mental Health Services Tax: 1% on taxable income over $1,000,000
    mentalHealthSurtax: { rate: 0.01, threshold: 1000000 },
  },
};

export default config;
