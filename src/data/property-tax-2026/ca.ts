/**
 * California Property Tax 2026
 *
 * California property taxes are governed by Proposition 13 (1978), which
 * limits the base tax rate to 1% of assessed value and caps annual assessment
 * increases at 2%.
 *
 * Sources:
 * - California State Board of Equalization
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'CA',
  stateName: 'California',
  effectiveRate: 0.0071,
  medianHomeValue: 750000,
  medianAnnualTax: 5325,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$7,000 reduction in assessed value for owner-occupied primary residence.',
  hasSeniorExemption: true,
  notes: 'Proposition 13 limits the base rate to 1% and annual assessment increases to 2%. Effective rates are low relative to home values.',
};

export default config;
