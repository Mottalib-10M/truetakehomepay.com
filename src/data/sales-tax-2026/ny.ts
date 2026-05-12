/**
 * New York Sales Tax 2026
 *
 * New York has a 4% state sales tax rate. Local jurisdictions add
 * substantial additional taxes, particularly in New York City.
 * Clothing and footwear under $110 are exempt from the state sales tax.
 *
 * Sources:
 * - New York State Department of Taxation and Finance
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'NY',
  stateName: 'New York',
  stateRate: 0.04,
  avgCombinedRate: 0.0852,
  maxLocalRate: 0.0875,
  groceryTax: 'exempt',
  clothingExempt: true,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Clothing and footwear under $110 per item are exempt from the state 4% sales tax. New York City also exempts clothing under $110 from its local tax. Grocery food is exempt.',
};

export default config;
