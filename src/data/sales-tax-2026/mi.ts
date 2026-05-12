/**
 * Michigan Sales Tax 2026
 *
 * Michigan has a 6% state sales tax rate with no local sales taxes.
 * Most grocery food is exempt from sales tax.
 *
 * Sources:
 * - Michigan Department of Treasury
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'MI',
  stateName: 'Michigan',
  stateRate: 0.06,
  avgCombinedRate: 0.06,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Michigan has a uniform statewide rate with no local sales taxes. Grocery food is exempt.',
};

export default config;
