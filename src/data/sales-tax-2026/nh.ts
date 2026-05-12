/**
 * New Hampshire Sales Tax 2026
 *
 * New Hampshire has no state or local sales tax, making it one of five
 * states with no sales tax. The state has a 9% tax on prepared meals
 * and room rentals.
 *
 * Sources:
 * - New Hampshire Department of Revenue Administration
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'NH',
  stateName: 'New Hampshire',
  stateRate: 0,
  avgCombinedRate: 0,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'New Hampshire has no general sales tax. A 9% meals and rooms tax applies to restaurant meals and hotel accommodations.',
};

export default config;
