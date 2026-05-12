/**
 * California Sales Tax 2026
 *
 * California has the highest base state sales tax rate at 7.25%.
 * Counties and cities may add up to 3.5% in local taxes. Most grocery
 * food is exempt from sales tax.
 *
 * Sources:
 * - California Department of Tax and Fee Administration (CDTFA)
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'CA',
  stateName: 'California',
  stateRate: 0.0725,
  avgCombinedRate: 0.0868,
  maxLocalRate: 0.035,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'California has the highest base state sales tax rate in the nation. Most grocery food is exempt, but prepared food and hot food are taxable.',
};

export default config;
