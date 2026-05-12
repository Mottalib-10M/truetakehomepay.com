/**
 * South Dakota Sales Tax 2026
 *
 * South Dakota has a 4.5% state sales tax rate. Municipalities may
 * add up to 2% in local taxes. South Dakota is one of the few states
 * that taxes groceries at the full rate.
 *
 * Sources:
 * - South Dakota Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'SD',
  stateName: 'South Dakota',
  stateRate: 0.045,
  avgCombinedRate: 0.064,
  maxLocalRate: 0.02,
  groceryTax: 'full',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'South Dakota taxes groceries at the full state rate. The state has no income tax, relying heavily on sales tax revenue.',
};

export default config;
