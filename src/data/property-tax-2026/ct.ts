/**
 * Connecticut Property Tax 2026
 *
 * Connecticut has one of the highest effective property tax rates in the
 * nation. Property is assessed at 70% of fair market value.
 *
 * Sources:
 * - Connecticut Office of Policy and Management
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'CT',
  stateName: 'Connecticut',
  effectiveRate: 0.0200,
  medianHomeValue: 360000,
  medianAnnualTax: 7200,
  assessmentRatio: 0.70,
  hasHomesteadExemption: false,
  hasSeniorExemption: true,
  notes: 'Connecticut has no general homestead exemption but offers tax credits for elderly and disabled homeowners. Property is assessed at 70% of fair market value.',
};

export default config;
