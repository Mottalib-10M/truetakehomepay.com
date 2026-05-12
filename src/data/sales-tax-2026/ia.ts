/**
 * Iowa Sales Tax 2026
 *
 * Iowa has a 6% state sales tax rate. Most counties impose an additional
 * 1% local option sales tax. Most grocery food is exempt.
 *
 * Sources:
 * - Iowa Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'IA',
  stateName: 'Iowa',
  stateRate: 0.06,
  avgCombinedRate: 0.0694,
  maxLocalRate: 0.01,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual two-day sales tax holiday in August for clothing and footwear under $100.',
  notes: 'Most counties levy the maximum 1% local option sales tax. Grocery food is exempt.',
};

export default config;
