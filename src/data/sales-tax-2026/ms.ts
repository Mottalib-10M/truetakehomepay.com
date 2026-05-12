/**
 * Mississippi Sales Tax 2026
 *
 * Mississippi has a 7% state sales tax rate. Mississippi is one of the
 * few states that taxes groceries at the full state rate.
 *
 * Sources:
 * - Mississippi Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'MS',
  stateName: 'Mississippi',
  stateRate: 0.07,
  avgCombinedRate: 0.0707,
  maxLocalRate: 0.01,
  groceryTax: 'full',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Mississippi taxes groceries at the full 7% state rate. Local taxes are minimal.',
};

export default config;
