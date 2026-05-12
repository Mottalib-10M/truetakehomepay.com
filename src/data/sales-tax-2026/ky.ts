/**
 * Kentucky Sales Tax 2026
 *
 * Kentucky has a 6% state sales tax rate with no local sales taxes.
 * Most grocery food is exempt from sales tax.
 *
 * Sources:
 * - Kentucky Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'KY',
  stateName: 'Kentucky',
  stateRate: 0.06,
  avgCombinedRate: 0.06,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Kentucky has a uniform statewide rate with no local sales taxes. Grocery food is exempt.',
};

export default config;
