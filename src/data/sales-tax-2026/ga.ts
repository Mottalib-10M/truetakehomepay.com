/**
 * Georgia Sales Tax 2026
 *
 * Georgia has a 4% state sales tax rate. Counties add local option sales
 * taxes bringing the combined rate higher. Most grocery food is exempt
 * from the state sales tax.
 *
 * Sources:
 * - Georgia Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'GA',
  stateName: 'Georgia',
  stateRate: 0.04,
  avgCombinedRate: 0.0737,
  maxLocalRate: 0.05,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Grocery food is exempt from the state sales tax but local taxes may still apply.',
};

export default config;
