/**
 * Rhode Island Sales Tax 2026
 *
 * Rhode Island has a 7% state sales tax rate with no local sales taxes.
 * Clothing items under $250 are exempt from sales tax.
 *
 * Sources:
 * - Rhode Island Division of Taxation
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'RI',
  stateName: 'Rhode Island',
  stateRate: 0.07,
  avgCombinedRate: 0.07,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: true,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Clothing and footwear items under $250 are exempt from Rhode Island sales tax. Grocery food is exempt. No local sales taxes.',
};

export default config;
