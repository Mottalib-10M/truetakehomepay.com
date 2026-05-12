/**
 * Utah Property Tax 2026
 *
 * Utah provides a 45% residential exemption that reduces the taxable
 * value of primary residences.
 *
 * Sources:
 * - Utah State Tax Commission
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'UT',
  stateName: 'Utah',
  effectiveRate: 0.0058,
  medianHomeValue: 480000,
  medianAnnualTax: 2784,
  assessmentRatio: 0.55,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '45% residential exemption reduces taxable value of primary residences to 55% of fair market value.',
  hasSeniorExemption: true,
  notes: 'Utah applies a 45% exemption to the fair market value of primary residential property. The effective assessment ratio is 55% for owner-occupied homes.',
};

export default config;
