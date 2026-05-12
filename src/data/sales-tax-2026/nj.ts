/**
 * New Jersey Sales Tax 2026
 *
 * New Jersey has a 6.625% state sales tax rate. Certain Urban Enterprise
 * Zones have a reduced rate of 3.3125%. Clothing, grocery food, and
 * prescription drugs are exempt.
 *
 * Sources:
 * - New Jersey Division of Taxation
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'NJ',
  stateName: 'New Jersey',
  stateRate: 0.06625,
  avgCombinedRate: 0.066,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: true,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'New Jersey exempts clothing and grocery food from sales tax. Urban Enterprise Zones have a reduced rate of 3.3125% on eligible purchases.',
};

export default config;
