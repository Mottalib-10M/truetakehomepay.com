/**
 * Alaska Property Tax 2026
 *
 * Alaska has no state income tax or sales tax, but municipalities levy
 * property taxes at varying rates. The effective rate is moderate.
 *
 * Sources:
 * - Alaska Department of Commerce, Community, and Economic Development
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'AK',
  stateName: 'Alaska',
  effectiveRate: 0.0119,
  medianHomeValue: 310000,
  medianAnnualTax: 3689,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Up to $150,000 exemption on assessed value for primary residence (varies by borough).',
  hasSeniorExemption: true,
  notes: 'Property tax rates vary significantly by borough and municipality. Some remote areas have no property tax.',
};

export default config;
