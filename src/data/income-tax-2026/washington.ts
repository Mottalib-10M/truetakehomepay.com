/**
 * Washington income tax, tax year 2026
 *
 * Source: Tax Foundation, State Individual Income Tax Rates and Brackets, 2026
 * (rates, brackets, standard deduction and personal exemption as of 1 January 2026).
 * No tax on wages. Payroll deductions: WA Cares 0.58% and the employee share of Paid Family and Medical Leave.
 * Head of household and married filing separately follow the single schedule
 * unless the state publishes its own; local income taxes are handled separately.
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: null,
  specialRules: {
    sdi: { rate: 0.0058 },
    pfl: { rate: 0.00807, wageBase: 184500 },
  },
};

export default config;
