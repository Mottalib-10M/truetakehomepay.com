/**
 * Arkansas Sales Tax 2026
 *
 * Arkansas has a 6.5% state sales tax rate with high local add-ons.
 * Groceries are taxed at a reduced rate of 0.125%.
 *
 * Sources:
 * - Arkansas Department of Finance and Administration
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'AR',
  stateName: 'Arkansas',
  stateRate: 0.065,
  avgCombinedRate: 0.0947,
  maxLocalRate: 0.0625,
  groceryTax: 'reduced',
  groceryRate: 0.00125,
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual back-to-school sales tax holiday in August for clothing and school supplies.',
  notes: 'Groceries are taxed at a reduced state rate of 0.125%. Local taxes may still apply to groceries.',
};

export default config;
