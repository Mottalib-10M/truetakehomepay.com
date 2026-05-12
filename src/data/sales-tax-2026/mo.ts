/**
 * Missouri Sales Tax 2026
 *
 * Missouri has a 4.225% state sales tax rate. Local jurisdictions add
 * significant additional taxes. Groceries are taxed at a reduced
 * state rate of 1.225%.
 *
 * Sources:
 * - Missouri Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'MO',
  stateName: 'Missouri',
  stateRate: 0.04225,
  avgCombinedRate: 0.0827,
  maxLocalRate: 0.0588,
  groceryTax: 'reduced',
  groceryRate: 0.01225,
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual back-to-school sales tax holiday in August for clothing, computers, school supplies, and graphing calculators.',
  notes: 'Groceries are taxed at a reduced state rate of 1.225%. Local taxes may still apply to groceries at full local rates.',
};

export default config;
