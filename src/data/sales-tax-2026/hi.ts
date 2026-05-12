/**
 * Hawaii Sales Tax 2026
 *
 * Hawaii imposes a General Excise Tax (GET) of 4% rather than a
 * traditional sales tax. The GET applies to nearly all goods and
 * services, including many items exempt in other states.
 *
 * Sources:
 * - Hawaii Department of Taxation
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'HI',
  stateName: 'Hawaii',
  stateRate: 0.04,
  avgCombinedRate: 0.0444,
  maxLocalRate: 0.005,
  groceryTax: 'full',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Hawaii uses a General Excise Tax (GET) instead of a traditional sales tax. The GET is levied on businesses but often passed on to consumers. Most goods and services are taxable, including groceries.',
};

export default config;
