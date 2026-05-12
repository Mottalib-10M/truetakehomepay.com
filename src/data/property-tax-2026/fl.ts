/**
 * Florida Property Tax 2026
 *
 * Florida has no state income tax and relies heavily on property taxes.
 * The Save Our Homes amendment caps annual assessment increases at 3%
 * for homesteaded properties.
 *
 * Sources:
 * - Florida Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'FL',
  stateName: 'Florida',
  effectiveRate: 0.0086,
  medianHomeValue: 380000,
  medianAnnualTax: 3268,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Up to $50,000 exemption on assessed value for primary residence ($25,000 applies to all taxes; additional $25,000 applies to non-school taxes).',
  hasSeniorExemption: true,
  notes: 'Save Our Homes caps annual assessment increases at 3% for homesteaded properties. Rates vary significantly by county.',
};

export default config;
