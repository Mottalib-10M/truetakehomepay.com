/**
 * Kansas Sales Tax 2026
 *
 * Kansas has a 6.5% state sales tax rate. Local jurisdictions may add
 * additional taxes. Kansas is one of the few states that taxes groceries
 * at the full rate, though the rate is being phased down.
 *
 * Sources:
 * - Kansas Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'KS',
  stateName: 'Kansas',
  stateRate: 0.065,
  avgCombinedRate: 0.0871,
  maxLocalRate: 0.05,
  groceryTax: 'full',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Kansas taxes groceries at the full state rate, though the state has been phasing down the grocery tax rate. Local taxes also apply to groceries.',
};

export default config;
