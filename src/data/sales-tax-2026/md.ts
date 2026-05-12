/**
 * Maryland Sales Tax 2026
 *
 * Maryland has a 6% state sales tax rate with no local sales taxes.
 * Most grocery food is exempt from sales tax.
 *
 * Sources:
 * - Maryland Comptroller of the Treasury
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'MD',
  stateName: 'Maryland',
  stateRate: 0.06,
  avgCombinedRate: 0.06,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Shop Maryland Tax-Free Week in August for clothing and footwear under $100.',
  notes: 'Maryland has a uniform statewide rate with no local sales taxes. Grocery food is exempt. Alcoholic beverages are taxed at 9%.',
};

export default config;
