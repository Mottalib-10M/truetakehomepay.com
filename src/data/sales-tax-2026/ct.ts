/**
 * Connecticut Sales Tax 2026
 *
 * Connecticut has a 6.35% state sales tax rate with no local taxes.
 * Most clothing under $50 is exempt from sales tax.
 *
 * Sources:
 * - Connecticut Department of Revenue Services
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'CT',
  stateName: 'Connecticut',
  stateRate: 0.0635,
  avgCombinedRate: 0.0635,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual sales tax free week in August for clothing and footwear under $100.',
  notes: 'No local sales taxes. Clothing under $50 is exempt. A luxury tax of 7.75% applies to certain items over $5,000.',
};

export default config;
