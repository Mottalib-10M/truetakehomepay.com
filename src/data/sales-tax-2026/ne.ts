/**
 * Nebraska Sales Tax 2026
 *
 * Nebraska has a 5.5% state sales tax rate. Cities may add up to 2%
 * in local taxes. Most grocery food is exempt.
 *
 * Sources:
 * - Nebraska Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'NE',
  stateName: 'Nebraska',
  stateRate: 0.055,
  avgCombinedRate: 0.0697,
  maxLocalRate: 0.02,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Grocery food is exempt from Nebraska sales tax. Cities may impose up to 2% in local sales taxes.',
};

export default config;
