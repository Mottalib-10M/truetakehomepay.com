/**
 * Illinois Property Tax 2026
 *
 * Illinois has one of the highest effective property tax rates in the nation.
 * Property is assessed at 33.33% of fair market value (varies by county).
 *
 * Sources:
 * - Illinois Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'IL',
  stateName: 'Illinois',
  effectiveRate: 0.0208,
  medianHomeValue: 250000,
  medianAnnualTax: 5200,
  assessmentRatio: 0.333,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'General Homestead Exemption of up to $10,000 reduction in EAV ($18,000 in Cook County).',
  hasSeniorExemption: true,
  notes: 'Property is assessed at 33.33% of fair market value. Cook County uses a different classification system. Illinois has among the highest property taxes in the U.S.',
};

export default config;
