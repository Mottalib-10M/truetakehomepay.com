/**
 * Indiana Sales Tax 2026
 *
 * Indiana has a 7% state sales tax rate with no local sales taxes.
 * Most grocery food is exempt.
 *
 * Sources:
 * - Indiana Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'IN',
  stateName: 'Indiana',
  stateRate: 0.07,
  avgCombinedRate: 0.07,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Indiana has a uniform statewide rate with no local sales taxes. Grocery food is exempt.',
};

export default config;
