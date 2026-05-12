/**
 * Hawaii Income Tax 2026
 *
 * Hawaii has 12 progressive brackets (1.4% to 11%).
 * Hawaii also has Temporary Disability Insurance (TDI).
 *
 * Sources:
 * - Hawaii Department of Taxation
 * - HRS § 235-51
 * - Hawaii Disability Compensation Division (TDI)
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: {
    single: [
      { min: 0, max: 2400, rate: 0.014 },
      { min: 2400, max: 4800, rate: 0.032 },
      { min: 4800, max: 9600, rate: 0.055 },
      { min: 9600, max: 14400, rate: 0.064 },
      { min: 14400, max: 19200, rate: 0.068 },
      { min: 19200, max: 24000, rate: 0.072 },
      { min: 24000, max: 36000, rate: 0.076 },
      { min: 36000, max: 48000, rate: 0.079 },
      { min: 48000, max: 150000, rate: 0.0825 },
      { min: 150000, max: 175000, rate: 0.09 },
      { min: 175000, max: 200000, rate: 0.10 },
      { min: 200000, max: Infinity, rate: 0.11 },
    ],
    mfj: [
      { min: 0, max: 4800, rate: 0.014 },
      { min: 4800, max: 9600, rate: 0.032 },
      { min: 9600, max: 19200, rate: 0.055 },
      { min: 19200, max: 28800, rate: 0.064 },
      { min: 28800, max: 38400, rate: 0.068 },
      { min: 38400, max: 48000, rate: 0.072 },
      { min: 48000, max: 72000, rate: 0.076 },
      { min: 72000, max: 96000, rate: 0.079 },
      { min: 96000, max: 300000, rate: 0.0825 },
      { min: 300000, max: 350000, rate: 0.09 },
      { min: 350000, max: 400000, rate: 0.10 },
      { min: 400000, max: Infinity, rate: 0.11 },
    ],
    mfs: [
      { min: 0, max: 2400, rate: 0.014 },
      { min: 2400, max: 4800, rate: 0.032 },
      { min: 4800, max: 9600, rate: 0.055 },
      { min: 9600, max: 14400, rate: 0.064 },
      { min: 14400, max: 19200, rate: 0.068 },
      { min: 19200, max: 24000, rate: 0.072 },
      { min: 24000, max: 36000, rate: 0.076 },
      { min: 36000, max: 48000, rate: 0.079 },
      { min: 48000, max: 150000, rate: 0.0825 },
      { min: 150000, max: 175000, rate: 0.09 },
      { min: 175000, max: 200000, rate: 0.10 },
      { min: 200000, max: Infinity, rate: 0.11 },
    ],
    hoh: [
      { min: 0, max: 3600, rate: 0.014 },
      { min: 3600, max: 7200, rate: 0.032 },
      { min: 7200, max: 14400, rate: 0.055 },
      { min: 14400, max: 21600, rate: 0.064 },
      { min: 21600, max: 28800, rate: 0.068 },
      { min: 28800, max: 36000, rate: 0.072 },
      { min: 36000, max: 54000, rate: 0.076 },
      { min: 54000, max: 72000, rate: 0.079 },
      { min: 72000, max: 225000, rate: 0.0825 },
      { min: 225000, max: 262500, rate: 0.09 },
      { min: 262500, max: 300000, rate: 0.10 },
      { min: 300000, max: Infinity, rate: 0.11 },
    ],
  },
  standardDeduction: {
    single: 2200,
    mfj: 4400,
    mfs: 2200,
    hoh: 3212,
  },
  specialRules: {
    sdi: { rate: 0.005, wageBase: 72246 },
  },
};

export default config;
