/**
 * Louisiana Sales Tax 2026
 *
 * Louisiana has a 4.45% state sales tax rate. Combined with high local
 * rates, Louisiana has one of the highest average combined sales tax
 * rates in the nation.
 *
 * Sources:
 * - Louisiana Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'LA',
  stateName: 'Louisiana',
  stateRate: 0.0445,
  avgCombinedRate: 0.0955,
  maxLocalRate: 0.07,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Louisiana has among the highest combined state and local sales tax rates in the nation. Grocery food is exempt from the state tax.',
};

export default config;
