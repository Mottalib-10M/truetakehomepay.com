/**
 * Oregon Sales Tax 2026
 *
 * Oregon has no state or local sales tax, making it one of five states
 * with no general sales tax. The state does not allow local
 * jurisdictions to impose sales taxes.
 *
 * Sources:
 * - Oregon Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'OR',
  stateName: 'Oregon',
  stateRate: 0,
  avgCombinedRate: 0,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Oregon has no state or local sales tax. The state constitution has been interpreted to prohibit a general sales tax.',
};

export default config;
