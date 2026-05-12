/**
 * South Carolina Property Tax 2026
 *
 * South Carolina has one of the lowest effective property tax rates due to
 * its extremely low assessment ratio of 4% for primary residences.
 *
 * Sources:
 * - South Carolina Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'SC',
  stateName: 'South Carolina',
  effectiveRate: 0.0055,
  medianHomeValue: 250000,
  medianAnnualTax: 1375,
  assessmentRatio: 0.04,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$50,000 exemption off fair market value for residents 65+ or totally disabled.',
  hasSeniorExemption: true,
  notes: 'Owner-occupied primary residences are assessed at only 4% of fair market value. Other property is assessed at 6%. A 15% cap limits annual reassessment increases.',
};

export default config;
