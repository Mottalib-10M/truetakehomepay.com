/**
 * Tennessee Sales Tax 2026
 *
 * Tennessee has a 7% state sales tax rate. Combined with local taxes,
 * Tennessee has one of the highest average combined rates in the nation.
 * Groceries are taxed at a reduced state rate of 4%.
 *
 * Sources:
 * - Tennessee Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'TN',
  stateName: 'Tennessee',
  stateRate: 0.07,
  avgCombinedRate: 0.0955,
  maxLocalRate: 0.0275,
  groceryTax: 'reduced',
  groceryRate: 0.04,
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual sales tax holiday in late July for clothing under $100, school supplies under $100, and computers under $1,500.',
  notes: 'Tennessee has no state income tax. Groceries are taxed at a reduced state rate of 4%. Combined state and local rates are among the highest nationally.',
};

export default config;
