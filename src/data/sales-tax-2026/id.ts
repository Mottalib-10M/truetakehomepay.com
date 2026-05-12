/**
 * Idaho Sales Tax 2026
 *
 * Idaho has a 6% state sales tax rate with minimal local additions.
 * Most grocery food is exempt from sales tax.
 *
 * Sources:
 * - Idaho State Tax Commission
 */

import type { SalesTaxConfig } from './index';

const config: SalesTaxConfig = {
  stateCode: 'ID',
  stateName: 'Idaho',
  stateRate: 0.06,
  avgCombinedRate: 0.0603,
  maxLocalRate: 0.03,
  groceryTax: 'exempt',
  clothingExempt: false,
  prescriptionDrugExempt: true,
  hasSalesTaxHoliday: false,
  notes: 'Idaho exempts groceries from sales tax. Resort cities may impose an additional local option tax.',
};

export default config;
