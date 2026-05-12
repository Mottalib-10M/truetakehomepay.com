/**
 * Hawaii Property Tax 2026
 *
 * Hawaii has the lowest effective property tax rate in the nation despite
 * having the highest median home values. Rates are set by each county.
 *
 * Sources:
 * - Hawaii Department of Taxation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'HI',
  stateName: 'Hawaii',
  effectiveRate: 0.0027,
  medianHomeValue: 850000,
  medianAnnualTax: 2295,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homeowner exemption ranges from $100,000 to $160,000 depending on county and age.',
  hasSeniorExemption: true,
  notes: 'Hawaii has only four counties, each setting its own rates. Owner-occupied homes receive a lower tax rate than investment properties.',
};

export default config;
