/**
 * Hawaii income tax, tax year 2026
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
      { min: 0, max: 9600, rate: 0.014 },
      { min: 9600, max: 14400, rate: 0.032 },
      { min: 14400, max: 19200, rate: 0.055 },
      { min: 19200, max: 24000, rate: 0.064 },
      { min: 24000, max: 36000, rate: 0.068 },
      { min: 36000, max: 48000, rate: 0.072 },
      { min: 48000, max: 125000, rate: 0.076 },
      { min: 125000, max: 175000, rate: 0.079 },
      { min: 175000, max: 225000, rate: 0.0825 },
      { min: 225000, max: 275000, rate: 0.09 },
      { min: 275000, max: 325000, rate: 0.1 },
      { min: 325000, max: Infinity, rate: 0.11 },
    ],
    mfj: [
      { min: 0, max: 19200, rate: 0.014 },
      { min: 19200, max: 28800, rate: 0.032 },
      { min: 28800, max: 38400, rate: 0.055 },
      { min: 38400, max: 48000, rate: 0.064 },
      { min: 48000, max: 72000, rate: 0.068 },
      { min: 72000, max: 96000, rate: 0.072 },
      { min: 96000, max: 250000, rate: 0.076 },
      { min: 250000, max: 350000, rate: 0.079 },
      { min: 350000, max: 450000, rate: 0.0825 },
      { min: 450000, max: 550000, rate: 0.09 },
      { min: 550000, max: 650000, rate: 0.1 },
      { min: 650000, max: Infinity, rate: 0.11 },
    ],
    mfs: [
      { min: 0, max: 9600, rate: 0.014 },
      { min: 9600, max: 14400, rate: 0.032 },
      { min: 14400, max: 19200, rate: 0.055 },
      { min: 19200, max: 24000, rate: 0.064 },
      { min: 24000, max: 36000, rate: 0.068 },
      { min: 36000, max: 48000, rate: 0.072 },
      { min: 48000, max: 125000, rate: 0.076 },
      { min: 125000, max: 175000, rate: 0.079 },
      { min: 175000, max: 225000, rate: 0.0825 },
      { min: 225000, max: 275000, rate: 0.09 },
      { min: 275000, max: 325000, rate: 0.1 },
      { min: 325000, max: Infinity, rate: 0.11 },
    ],
    hoh: [
      { min: 0, max: 14400, rate: 0.014 },
      { min: 14400, max: 21600, rate: 0.032 },
      { min: 21600, max: 28800, rate: 0.055 },
      { min: 28800, max: 36000, rate: 0.064 },
      { min: 36000, max: 54000, rate: 0.068 },
      { min: 54000, max: 72000, rate: 0.072 },
      { min: 72000, max: 187500, rate: 0.076 },
      { min: 187500, max: 262500, rate: 0.079 },
      { min: 262500, max: 337500, rate: 0.0825 },
      { min: 337500, max: 412500, rate: 0.09 },
      { min: 412500, max: 487500, rate: 0.1 },
      { min: 487500, max: Infinity, rate: 0.11 },
    ],
  },
  standardDeduction: { single: 4400, mfj: 8800, mfs: 4400, hoh: 6420 },
  personalExemption: { single: 1144, mfj: 2288, mfs: 1144, hoh: 1144 },
  specialRules: {
    sdi: { rate: 0.005, wageBase: 78132 },
  },
};

export default config;
