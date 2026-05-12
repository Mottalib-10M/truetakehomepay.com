/**
 * Wyoming Sales Tax 2026
 *
 * Wyoming has a 4% state sales tax rate. Local jurisdictions may add
 * up to 2% in additional taxes. Most grocery food is exempt.
 *
 * Sources:
 * - Wyoming Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'WY',
  stateName: 'Wyoming',
  stateRate: 0.04,
  avgCombinedRate: 0.0536,
  maxLocalRate: 0.02,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Wyoming has no state income tax. Grocery food is exempt from sales tax. Local jurisdictions may add up to 2%.',
};

export default config;
