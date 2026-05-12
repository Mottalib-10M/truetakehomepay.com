/**
 * Alaska Sales Tax 2026
 *
 * Alaska has no state-level sales tax, but local jurisdictions may impose
 * sales taxes up to approximately 7.5%. It is one of five states with no
 * statewide sales tax.
 *
 * Sources:
 * - Alaska Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'AK',
  stateName: 'Alaska',
  stateRate: 0,
  avgCombinedRate: 0.0182,
  maxLocalRate: 0.075,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'No state sales tax. Some local jurisdictions impose sales taxes up to ~7.5%.',
};

export default config;
