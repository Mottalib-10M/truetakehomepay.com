/**
 * North Carolina Sales Tax 2026
 *
 * North Carolina has a 4.75% state sales tax rate. Counties may add
 * up to 2.75% in local taxes. Most grocery food is exempt from the
 * state tax but subject to a reduced 2% local rate.
 *
 * Sources:
 * - North Carolina Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'NC',
  stateName: 'North Carolina',
  stateRate: 0.0475,
  avgCombinedRate: 0.0698,
  maxLocalRate: 0.0275,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual back-to-school sales tax holiday in August for clothing, school supplies, computers, and sports equipment.',
  notes: 'Grocery food is exempt from the state sales tax but subject to a 2% local tax in most counties.',
};

export default config;
