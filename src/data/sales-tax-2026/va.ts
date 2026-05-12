/**
 * Virginia Sales Tax 2026
 *
 * Virginia has a 5.3% combined state sales tax rate (4.3% state + 1%
 * local). Northern Virginia and Hampton Roads regions have an additional
 * 0.7% tax. Groceries are taxed at a reduced rate of 1%.
 *
 * Sources:
 * - Virginia Department of Taxation
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'VA',
  stateName: 'Virginia',
  stateRate: 0.053,
  avgCombinedRate: 0.0575,
  maxLocalRate: 0.017,
  groceryTax: 'reduced',
  groceryRate: 0.01,
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual sales tax holiday in August for school supplies, clothing under $100, Energy Star appliances, and hurricane preparedness items.',
  notes: 'Virginia combines the state and local rates into a single 5.3% rate (4.3% state + 1% local). Groceries are taxed at a reduced rate of 1%. Northern Virginia and Hampton Roads have an additional 0.7% regional tax.',
};

export default config;
