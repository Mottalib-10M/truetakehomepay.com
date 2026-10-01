/**
 * Rhode Island income tax, tax year 2026
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
      { min: 0, max: 82050, rate: 0.0375 },
      { min: 82050, max: 186450, rate: 0.0475 },
      { min: 186450, max: Infinity, rate: 0.0599 },
    ],
    mfj: [
      { min: 0, max: 82050, rate: 0.0375 },
      { min: 82050, max: 186450, rate: 0.0475 },
      { min: 186450, max: Infinity, rate: 0.0599 },
    ],
    mfs: [
      { min: 0, max: 82050, rate: 0.0375 },
      { min: 82050, max: 186450, rate: 0.0475 },
      { min: 186450, max: Infinity, rate: 0.0599 },
    ],
    hoh: [
      { min: 0, max: 82050, rate: 0.0375 },
      { min: 82050, max: 186450, rate: 0.0475 },
      { min: 186450, max: Infinity, rate: 0.0599 },
    ],
  },
  standardDeduction: { single: 11200, mfj: 22400, mfs: 11200, hoh: 11200 },
  personalExemption: { single: 5250, mfj: 10500, mfs: 5250, hoh: 5250 },
  specialRules: {
    sdi: { rate: 0.011, wageBase: 100000 },
  },
};

export default config;
