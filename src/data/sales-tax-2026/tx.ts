/**
 * Texas Sales Tax 2026
 *
 * Texas has a 6.25% state sales tax rate. Local jurisdictions may add
 * up to 2%, bringing the maximum combined rate to 8.25%. Most grocery
 * food is exempt.
 *
 * Sources:
 * - Texas Comptroller of Public Accounts
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'TX',
  stateName: 'Texas',
  stateRate: 0.0625,
  avgCombinedRate: 0.082,
  maxLocalRate: 0.02,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Multiple sales tax holidays: back-to-school in August for clothing and school supplies, Energy Star in May, and emergency preparation supplies in April.',
  notes: 'Texas has no state income tax. Grocery food and prescription drugs are exempt. The maximum combined rate is capped at 8.25%.',
};

export default config;
