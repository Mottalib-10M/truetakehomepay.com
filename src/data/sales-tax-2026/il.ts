/**
 * Illinois Sales Tax 2026
 *
 * Illinois has a 6.25% state sales tax rate. Local taxes can add
 * significantly to the combined rate. Groceries are taxed at a
 * reduced rate of 1%.
 *
 * Sources:
 * - Illinois Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'IL',
  stateName: 'Illinois',
  stateRate: 0.0625,
  avgCombinedRate: 0.0883,
  maxLocalRate: 0.0475,
  groceryTax: 'reduced',
  groceryRate: 0.01,
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Groceries and drugs are taxed at a reduced 1% state rate. Chicago has some of the highest combined rates in the nation.',
};

export default config;
