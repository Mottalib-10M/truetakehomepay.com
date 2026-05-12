/**
 * Georgia Property Tax 2026
 *
 * Georgia assesses property at 40% of fair market value. Counties and
 * cities set their own millage rates.
 *
 * Sources:
 * - Georgia Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'GA',
  stateName: 'Georgia',
  effectiveRate: 0.0083,
  medianHomeValue: 310000,
  medianAnnualTax: 2573,
  assessmentRatio: 0.40,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Standard homestead exemption of $2,000 off assessed value for state taxes; local exemptions vary by county.',
  hasSeniorExemption: true,
  notes: 'Property is assessed at 40% of fair market value. Local jurisdictions set millage rates independently.',
};

export default config;
