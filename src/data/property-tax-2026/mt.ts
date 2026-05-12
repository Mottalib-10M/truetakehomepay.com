/**
 * Montana Property Tax 2026
 *
 * Montana has no sales tax and relies partly on property taxes. Residential
 * property is taxed at a reduced rate compared to commercial property.
 *
 * Sources:
 * - Montana Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'MT',
  stateName: 'Montana',
  effectiveRate: 0.0074,
  medianHomeValue: 380000,
  medianAnnualTax: 2812,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$250,000 in market value of residential property is taxed at a reduced rate.',
  hasSeniorExemption: true,
  notes: 'Montana has no sales tax. Property tax is a significant revenue source. The state uses a tiered assessment system for residential property.',
};

export default config;
