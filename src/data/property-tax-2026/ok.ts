/**
 * Oklahoma Property Tax 2026
 *
 * Oklahoma assesses residential property at 11% of fair market value.
 * A homestead exemption is available for primary residences.
 *
 * Sources:
 * - Oklahoma Tax Commission
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'OK',
  stateName: 'Oklahoma',
  effectiveRate: 0.0087,
  medianHomeValue: 195000,
  medianAnnualTax: 1697,
  assessmentRatio: 0.11,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$1,000 off assessed value (approximately $9,091 off market value at 11% assessment ratio).',
  hasSeniorExemption: true,
  notes: 'Residential property is assessed at 11% of fair market value. Oklahoma offers a double homestead exemption for qualifying low-income households.',
};

export default config;
