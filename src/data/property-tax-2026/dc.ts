/**
 * District of Columbia Property Tax 2026
 *
 * DC levies property taxes on real property at rates that vary by class.
 * Residential property receives a homestead deduction.
 *
 * Sources:
 * - DC Office of Tax and Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'DC',
  stateName: 'District of Columbia',
  effectiveRate: 0.0056,
  medianHomeValue: 650000,
  medianAnnualTax: 3640,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$87,500 reduction in assessed value for owner-occupied residential property.',
  hasSeniorExemption: true,
  notes: 'DC assesses property at 100% of estimated market value. The residential tax rate is $0.85 per $100 of assessed value. A 10% annual assessment cap applies to homestead properties.',
};

export default config;
