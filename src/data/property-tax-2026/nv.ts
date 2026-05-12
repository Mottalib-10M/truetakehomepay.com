/**
 * Nevada Property Tax 2026
 *
 * Nevada has low property taxes. A tax cap limits annual increases in
 * property taxes to 3% for primary residences and 8% for other property.
 *
 * Sources:
 * - Nevada Department of Taxation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'NV',
  stateName: 'Nevada',
  effectiveRate: 0.0053,
  medianHomeValue: 420000,
  medianAnnualTax: 2226,
  assessmentRatio: 0.35,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'No direct exemption but a 3% annual cap on property tax increases for primary residences.',
  hasSeniorExemption: true,
  notes: 'Nevada assesses property at 35% of taxable value. A partial abatement caps annual tax increases at 3% for owner-occupied homes. No state income tax.',
};

export default config;
