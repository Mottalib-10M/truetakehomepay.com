/**
 * Colorado Sales Tax 2026
 *
 * Colorado has a low 2.9% state sales tax rate, but local taxes
 * significantly increase the effective rate. Colorado has one of the
 * most complex local tax systems in the country.
 *
 * Sources:
 * - Colorado Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'CO',
  stateName: 'Colorado',
  stateRate: 0.029,
  avgCombinedRate: 0.0778,
  maxLocalRate: 0.083,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Colorado has one of the most complex local sales tax systems in the nation. Groceries are exempt from the state tax but may be taxed locally.',
};

export default config;
