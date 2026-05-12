/**
 * Oklahoma Sales Tax 2026
 *
 * Oklahoma has a 4.5% state sales tax rate. Combined with high local
 * taxes, the average combined rate is among the highest in the nation.
 * Most grocery food is exempt from the state tax.
 *
 * Sources:
 * - Oklahoma Tax Commission
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'OK',
  stateName: 'Oklahoma',
  stateRate: 0.045,
  avgCombinedRate: 0.0898,
  maxLocalRate: 0.07,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual sales tax holiday in August for clothing under $100.',
  notes: 'Grocery food is exempt from the state sales tax. Local jurisdictions may still tax groceries. High local rates push the combined average near the top nationally.',
};

export default config;
