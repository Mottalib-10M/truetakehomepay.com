/**
 * Alabama Sales Tax 2026
 *
 * Alabama has a 4% state sales tax rate with significant local taxes,
 * resulting in one of the highest average combined rates in the nation.
 * Alabama is one of the few states that taxes groceries at the full rate.
 *
 * Sources:
 * - Alabama Department of Revenue
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'AL',
  stateName: 'Alabama',
  stateRate: 0.04,
  avgCombinedRate: 0.0924,
  maxLocalRate: 0.075,
  groceryTax: 'full',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Back-to-school sales tax holiday in July for clothing, computers, and school supplies.',
  notes: 'Alabama taxes groceries at the full state rate. Local jurisdictions may also tax groceries.',
};

export default config;
