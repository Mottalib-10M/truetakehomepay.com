/**
 * West Virginia Sales Tax 2026
 *
 * West Virginia has a 6% state sales tax rate. Municipalities may add
 * up to 1% in local taxes. Most grocery food is exempt.
 *
 * Sources:
 * - West Virginia State Tax Department
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'WV',
  stateName: 'West Virginia',
  stateRate: 0.06,
  avgCombinedRate: 0.0657,
  maxLocalRate: 0.01,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual back-to-school sales tax holiday in August for clothing under $125, school supplies under $50, and computers under $500.',
  notes: 'Grocery food is exempt from West Virginia sales tax. Municipalities may impose up to 1% in local sales tax.',
};

export default config;
