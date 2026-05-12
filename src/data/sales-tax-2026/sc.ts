/**
 * South Carolina Sales Tax 2026
 *
 * South Carolina has a 6% state sales tax rate. Local jurisdictions
 * may add up to 3% in additional taxes. Most grocery food is exempt
 * from the state tax.
 *
 * Sources:
 * - South Carolina Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'SC',
  stateName: 'South Carolina',
  stateRate: 0.06,
  avgCombinedRate: 0.0746,
  maxLocalRate: 0.03,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual sales tax free weekend in August for clothing, school supplies, computers, and accessories.',
  notes: 'Grocery food is exempt from the state sales tax. South Carolina caps sales tax at $500 per item for most goods.',
};

export default config;
