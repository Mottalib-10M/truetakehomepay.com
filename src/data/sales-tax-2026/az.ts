/**
 * Arizona Sales Tax 2026
 *
 * Arizona imposes a Transaction Privilege Tax (TPT) at 5.6% at the state level.
 * Local jurisdictions add additional rates. Arizona exempts most grocery food
 * from the state TPT.
 *
 * Sources:
 * - Arizona Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'AZ',
  stateName: 'Arizona',
  stateRate: 0.056,
  avgCombinedRate: 0.0805,
  maxLocalRate: 0.058,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Arizona uses a Transaction Privilege Tax (TPT) rather than a traditional sales tax. Grocery food is exempt from the state TPT but some cities may tax it.',
};

export default config;
