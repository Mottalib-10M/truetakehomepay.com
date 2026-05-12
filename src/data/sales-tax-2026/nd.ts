/**
 * North Dakota Sales Tax 2026
 *
 * North Dakota has a 5% state sales tax rate. Cities may add up to
 * 3% in local taxes. Most grocery food is exempt.
 *
 * Sources:
 * - North Dakota Office of State Tax Commissioner
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'ND',
  stateName: 'North Dakota',
  stateRate: 0.05,
  avgCombinedRate: 0.0696,
  maxLocalRate: 0.03,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Grocery food is exempt from North Dakota sales tax. Cities may impose up to 3% in local sales tax.',
};

export default config;
