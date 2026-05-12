/**
 * Kentucky Property Tax 2026
 *
 * Kentucky assesses property at 100% of fair market value. The state
 * rate is relatively low and is supplemented by local rates.
 *
 * Sources:
 * - Kentucky Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'KY',
  stateName: 'Kentucky',
  effectiveRate: 0.0080,
  medianHomeValue: 185000,
  medianAnnualTax: 1480,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$46,800 homestead exemption for homeowners age 65 and older or totally disabled.',
  hasSeniorExemption: true,
  notes: 'Kentucky has a statewide property tax rate plus local rates set by counties, cities, and school districts. The homestead exemption is limited to seniors and disabled individuals.',
};

export default config;
