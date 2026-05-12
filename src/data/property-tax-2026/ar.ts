/**
 * Arkansas Property Tax 2026
 *
 * Arkansas has a relatively low effective property tax rate. The state
 * assesses property at 20% of market value for residential properties.
 *
 * Sources:
 * - Arkansas Assessment Coordination Department
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'AR',
  stateName: 'Arkansas',
  effectiveRate: 0.0061,
  medianHomeValue: 175000,
  medianAnnualTax: 1068,
  assessmentRatio: 0.20,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead tax credit of up to $375 per year on primary residence.',
  hasSeniorExemption: true,
  notes: 'Residential property is assessed at 20% of market value. The homestead credit offsets a portion of property taxes.',
};

export default config;
