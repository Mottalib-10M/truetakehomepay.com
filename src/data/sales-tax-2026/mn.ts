/**
 * Minnesota Sales Tax 2026
 *
 * Minnesota has a 6.875% state sales tax rate. Local jurisdictions may
 * add additional taxes. Clothing and most grocery food are exempt.
 *
 * Sources:
 * - Minnesota Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'MN',
  stateName: 'Minnesota',
  stateRate: 0.06875,
  avgCombinedRate: 0.0783,
  maxLocalRate: 0.02,
  groceryTax: 'exempt',
  clothingExempt: true,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Minnesota exempts clothing and grocery food from sales tax. Some local jurisdictions impose additional taxes.',
};

export default config;
