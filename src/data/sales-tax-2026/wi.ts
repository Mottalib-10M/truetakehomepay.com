/**
 * Wisconsin Sales Tax 2026
 *
 * Wisconsin has a 5% state sales tax rate. Counties may add up to
 * 0.5% in local taxes. Most grocery food is exempt.
 *
 * Sources:
 * - Wisconsin Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'WI',
  stateName: 'Wisconsin',
  stateRate: 0.05,
  avgCombinedRate: 0.0543,
  maxLocalRate: 0.005,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Grocery food is exempt from Wisconsin sales tax. Counties may impose a 0.5% county sales tax.',
};

export default config;
