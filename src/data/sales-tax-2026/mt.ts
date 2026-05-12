/**
 * Montana Sales Tax 2026
 *
 * Montana has no state or local general sales tax, making it one of
 * five states with no sales tax. Some resort communities may impose
 * a local resort tax.
 *
 * Sources:
 * - Montana Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'MT',
  stateName: 'Montana',
  stateRate: 0,
  avgCombinedRate: 0,
  maxLocalRate: 0.03,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Montana has no general sales tax. Some resort communities (e.g., Big Sky, Red Lodge, West Yellowstone) may impose a local resort tax up to 3%.',
};

export default config;
