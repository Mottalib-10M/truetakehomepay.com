/**
 * Maine Sales Tax 2026
 *
 * Maine has a 5.5% state sales tax rate with no local sales taxes.
 * Most grocery food is exempt from sales tax.
 *
 * Sources:
 * - Maine Revenue Services
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'ME',
  stateName: 'Maine',
  stateRate: 0.055,
  avgCombinedRate: 0.055,
  maxLocalRate: 0,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Maine has a uniform statewide rate with no local sales taxes. Grocery food is exempt. Prepared food is taxed at 8%.',
};

export default config;
