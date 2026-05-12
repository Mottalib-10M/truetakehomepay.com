/**
 * New Mexico Sales Tax 2026
 *
 * New Mexico imposes a Gross Receipts Tax (GRT) of 5.125% at the state
 * level. Local jurisdictions add significant additional rates. The GRT
 * applies broadly, including to many services.
 *
 * Sources:
 * - New Mexico Taxation and Revenue Department
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'NM',
  stateName: 'New Mexico',
  stateRate: 0.05125,
  avgCombinedRate: 0.0772,
  maxLocalRate: 0.0475,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: true,
  salesTaxHolidayDesc: 'Annual back-to-school tax holiday in August for clothing, computers, and school supplies.',
  notes: 'New Mexico uses a Gross Receipts Tax rather than a traditional sales tax. Grocery food is exempt. The GRT applies to many services that other states do not tax.',
};

export default config;
