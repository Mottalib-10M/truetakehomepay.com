/**
 * Minnesota Property Tax 2026
 *
 * Minnesota has a class-based property tax system where different types
 * of property are assessed at different percentages.
 *
 * Sources:
 * - Minnesota Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'MN',
  stateName: 'Minnesota',
  effectiveRate: 0.0111,
  medianHomeValue: 310000,
  medianAnnualTax: 3441,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead Market Value Exclusion reduces taxable value by up to 40% of the first $76,000 in value.',
  hasSeniorExemption: true,
  notes: 'Minnesota uses a class rate system. Residential homestead property has a class rate of 1.00% on the first $500,000 and 1.25% on the remainder.',
};

export default config;
