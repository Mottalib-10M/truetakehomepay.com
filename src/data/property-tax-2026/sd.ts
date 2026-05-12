/**
 * South Dakota Property Tax 2026
 *
 * South Dakota has no state income tax and relies on property taxes as
 * a significant revenue source. Assessment is at full and true value.
 *
 * Sources:
 * - South Dakota Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'SD',
  stateName: 'South Dakota',
  effectiveRate: 0.0122,
  medianHomeValue: 260000,
  medianAnnualTax: 3172,
  assessmentRatio: 0.85,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Owner-occupied single-family dwellings receive a reduced assessment rate. Tax freeze available for seniors.',
  hasSeniorExemption: true,
  notes: 'South Dakota has no state income tax. Property taxes are the primary funding source for local governments and schools. Assessment is at 85% of full and true value for owner-occupied homes.',
};

export default config;
