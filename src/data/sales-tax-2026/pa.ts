/**
 * Pennsylvania Sales Tax 2026
 *
 * Pennsylvania has a 6% state sales tax rate. Philadelphia adds 2%
 * and Allegheny County adds 1% in local taxes. Clothing and most
 * grocery food are exempt.
 *
 * Sources:
 * - Pennsylvania Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'PA',
  stateName: 'Pennsylvania',
  stateRate: 0.06,
  avgCombinedRate: 0.0634,
  maxLocalRate: 0.02,
  groceryTax: 'exempt',
  clothingExempt: true,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Pennsylvania exempts most clothing and grocery food from sales tax. Philadelphia imposes a 2% local tax and Allegheny County (Pittsburgh) imposes 1%.',
};

export default config;
