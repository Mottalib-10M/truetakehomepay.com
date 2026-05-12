/**
 * Mississippi Property Tax 2026
 *
 * Mississippi assesses residential property at 10% of true value.
 * The state offers a homestead exemption for qualifying homeowners.
 *
 * Sources:
 * - Mississippi Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'MS',
  stateName: 'Mississippi',
  effectiveRate: 0.0065,
  medianHomeValue: 155000,
  medianAnnualTax: 1008,
  assessmentRatio: 0.10,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead exemption on the first $7,500 of assessed value for owner-occupied residences.',
  hasSeniorExemption: true,
  notes: 'Residential property is assessed at 10% of true value. The homestead exemption applies to the first $75,000 of market value.',
};

export default config;
