/**
 * District of Columbia Sales Tax 2026
 *
 * The District of Columbia has a 6% general sales tax rate with no
 * additional local taxes. Grocery food and prescription drugs are exempt.
 *
 * Sources:
 * - DC Office of Tax and Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'DC',
  stateName: 'District of Columbia',
  stateRate: 0.06,
  avgCombinedRate: 0.06,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'DC has a higher rate of 10% for restaurant meals and liquor, and 10.25% for hotel accommodations.',
};

export default config;
