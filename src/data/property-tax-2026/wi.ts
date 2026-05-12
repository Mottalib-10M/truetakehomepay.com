/**
 * Wisconsin Property Tax 2026
 *
 * Wisconsin has high property taxes. Property is assessed at fair
 * market value with rates set by local governments.
 *
 * Sources:
 * - Wisconsin Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'WI',
  stateName: 'Wisconsin',
  effectiveRate: 0.0161,
  medianHomeValue: 265000,
  medianAnnualTax: 4267,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Lottery and Gaming Property Tax Credit applied to property tax bills; Homestead Credit for low-income residents.',
  hasSeniorExemption: true,
  notes: 'Wisconsin has a levy limit that restricts annual property tax increases. The state provides a School Levy Tax Credit and a Lottery Credit to reduce property tax bills.',
};

export default config;
