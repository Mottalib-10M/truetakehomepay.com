/**
 * Massachusetts Sales Tax 2026
 *
 * Massachusetts has a 6.25% state sales tax rate with no local sales
 * taxes. Clothing items under $175 are exempt from sales tax.
 *
 * Sources:
 * - Massachusetts Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'MA',
  stateName: 'Massachusetts',
  stateRate: 0.0625,
  avgCombinedRate: 0.0625,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: true,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual sales tax holiday weekend in August for most items under $2,500.',
  notes: 'Clothing items under $175 are exempt. The portion of a clothing item over $175 is taxable. No local sales taxes.',
};

export default config;
