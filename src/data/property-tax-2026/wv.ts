/**
 * West Virginia Property Tax 2026
 *
 * West Virginia has low property taxes. Residential property is assessed
 * at 60% of appraised value.
 *
 * Sources:
 * - West Virginia State Tax Department
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'WV',
  stateName: 'West Virginia',
  effectiveRate: 0.0055,
  medianHomeValue: 145000,
  medianAnnualTax: 798,
  assessmentRatio: 0.60,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$20,000 homestead exemption on assessed value for homeowners 65+ or permanently disabled.',
  hasSeniorExemption: true,
  notes: 'Residential property is assessed at 60% of appraised value. West Virginia has one of the lowest median home values in the nation.',
};

export default config;
