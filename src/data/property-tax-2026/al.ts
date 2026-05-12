/**
 * Alabama Property Tax 2026
 *
 * Alabama has one of the lowest effective property tax rates in the nation.
 * The state offers a generous homestead exemption and assesses property at
 * varying percentages depending on use class.
 *
 * Sources:
 * - Alabama Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'AL',
  stateName: 'Alabama',
  effectiveRate: 0.0040,
  medianHomeValue: 180000,
  medianAnnualTax: 720,
  assessmentRatio: 0.10,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Up to $4,000 in assessed value for state taxes; up to $2,000 for county taxes on primary residence.',
  hasSeniorExemption: true,
  notes: 'Alabama assesses residential property at 10% of market value. Property taxes are among the lowest in the U.S.',
};

export default config;
