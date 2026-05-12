/**
 * Washington Income Tax 2026
 *
 * Washington has NO state income tax on earned income.
 * Washington does have a 7% capital gains tax on gains over $250,000,
 * but this does not apply to paycheck withholding.
 *
 * Washington has Paid Family & Medical Leave (PFML).
 *
 * Sources:
 * - Washington State Department of Revenue
 * - Washington Employment Security Department (PFML)
 */

import type { StateIncomeTaxConfig } from '../../lib/tax-engine';

const config: StateIncomeTaxConfig = {
  brackets: null,
  specialRules: {
    pfl: { rate: 0.0058, wageBase: 176100 },
  },
};

export default config;
