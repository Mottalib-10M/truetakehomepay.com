/**
 * Utah Sales Tax 2026
 *
 * Utah has a 6.1% combined state sales tax rate (including the state,
 * county, mass transit, and other mandatory components). Local
 * jurisdictions may add additional taxes. Groceries are taxed at a
 * reduced rate of 3%.
 *
 * Sources:
 * - Utah State Tax Commission
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'UT',
  stateName: 'Utah',
  stateRate: 0.061,
  avgCombinedRate: 0.0719,
  maxLocalRate: 0.029,
  groceryTax: 'reduced',
  groceryRate: 0.03,
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'The 6.1% state rate includes state, county option, mass transit, and other components. Groceries are taxed at a reduced combined rate of 3%.',
};

export default config;
