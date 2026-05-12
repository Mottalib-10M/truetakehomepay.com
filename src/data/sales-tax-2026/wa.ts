/**
 * Washington Sales Tax 2026
 *
 * Washington has a 6.5% state sales tax rate. Local jurisdictions add
 * significant additional taxes. Most grocery food is exempt.
 *
 * Sources:
 * - Washington State Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'WA',
  stateName: 'Washington',
  stateRate: 0.065,
  avgCombinedRate: 0.0929,
  maxLocalRate: 0.04,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Washington has no state income tax and relies heavily on sales tax revenue. Grocery food is exempt. Seattle has among the highest combined rates in the state.',
};

export default config;
