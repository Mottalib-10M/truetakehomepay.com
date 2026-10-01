/**
 * North Dakota income tax, tax year 2026
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
      { min: 0, max: 48475, rate: 0 },
      { min: 48475, max: 244825, rate: 0.0195 },
      { min: 244825, max: Infinity, rate: 0.025 },
    ],
    mfj: [
      { min: 0, max: 80975, rate: 0 },
      { min: 80975, max: 298075, rate: 0.0195 },
      { min: 298075, max: Infinity, rate: 0.025 },
    ],
    mfs: [
      { min: 0, max: 48475, rate: 0 },
      { min: 48475, max: 244825, rate: 0.0195 },
      { min: 244825, max: Infinity, rate: 0.025 },
    ],
    hoh: [
      { min: 0, max: 64760, rate: 0 },
      { min: 64760, max: 271400, rate: 0.0195 },
      { min: 271400, max: Infinity, rate: 0.025 },
    ],
  },
  standardDeduction: { single: 16100, mfj: 32200, mfs: 16100, hoh: 24150 },
};

export default config;
