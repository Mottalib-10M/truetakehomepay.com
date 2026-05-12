/**
 * Vermont Sales Tax 2026
 *
 * Vermont has a 6% state sales tax rate. Local jurisdictions may add
 * up to 1% in local option taxes. Clothing, grocery food, and
 * prescription drugs are exempt.
 *
 * Sources:
 * - Vermont Department of Taxes
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'VT',
  stateName: 'Vermont',
  stateRate: 0.06,
  avgCombinedRate: 0.0636,
  maxLocalRate: 0.01,
  groceryTax: 'exempt',
  clothingExempt: true,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Vermont exempts clothing and grocery food from sales tax. Some municipalities impose a 1% local option tax.',
};

export default config;
