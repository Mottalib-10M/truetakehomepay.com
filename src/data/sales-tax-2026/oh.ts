/**
 * Ohio Sales Tax 2026
 *
 * Ohio has a 5.75% state sales tax rate. Counties may add up to 2.25%
 * in local taxes. Most grocery food is exempt.
 *
 * Sources:
 * - Ohio Department of Taxation
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'OH',
  stateName: 'Ohio',
  stateRate: 0.0575,
  avgCombinedRate: 0.0724,
  maxLocalRate: 0.0225,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual sales tax holiday in August for clothing under $75, school supplies under $20, and school instructional materials under $20.',
  notes: 'Grocery food is exempt from Ohio sales tax. Counties impose additional permissive taxes.',
};

export default config;
