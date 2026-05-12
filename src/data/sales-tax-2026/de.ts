/**
 * Delaware Sales Tax 2026
 *
 * Delaware has no state or local sales tax, making it one of five
 * states with no sales tax. Delaware does impose a gross receipts tax
 * on businesses.
 *
 * Sources:
 * - Delaware Division of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'DE',
  stateName: 'Delaware',
  stateRate: 0,
  avgCombinedRate: 0,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Delaware has no state or local sales tax. The state imposes a gross receipts tax on businesses instead.',
};

export default config;
