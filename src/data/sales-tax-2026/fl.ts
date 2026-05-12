/**
 * Florida Sales Tax 2026
 *
 * Florida has a 6% state sales tax rate. Counties may add up to 2.5%
 * in local discretionary surcharges. Most grocery food is exempt.
 *
 * Sources:
 * - Florida Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'FL',
  stateName: 'Florida',
  stateRate: 0.06,
  avgCombinedRate: 0.0702,
  maxLocalRate: 0.025,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Multiple sales tax holidays including back-to-school, disaster preparedness, and Freedom Month.',
  notes: 'Florida has several annual sales tax holidays. Counties may add a discretionary sales surtax.',
};

export default config;
