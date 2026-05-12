/**
 * Nevada Sales Tax 2026
 *
 * Nevada has a 6.85% state sales tax rate. Counties add additional
 * local taxes. Most grocery food is exempt.
 *
 * Sources:
 * - Nevada Department of Taxation
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'NV',
  stateName: 'Nevada',
  stateRate: 0.0685,
  avgCombinedRate: 0.0823,
  maxLocalRate: 0.0153,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Grocery food is exempt from Nevada sales tax. Clark County (Las Vegas) has one of the highest combined rates in the state.',
};

export default config;
