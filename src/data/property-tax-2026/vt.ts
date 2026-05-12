/**
 * Vermont Property Tax 2026
 *
 * Vermont has high property taxes that fund education. The education
 * tax rate is set statewide while municipal rates vary.
 *
 * Sources:
 * - Vermont Department of Taxes
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'VT',
  stateName: 'Vermont',
  effectiveRate: 0.0183,
  medianHomeValue: 310000,
  medianAnnualTax: 5673,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Income-based property tax credit adjusts taxes based on household income for qualifying homeowners.',
  hasSeniorExemption: true,
  notes: 'Vermont has a split education tax system with a homestead rate and a non-residential rate. The homestead education tax rate is adjusted based on per-pupil spending in each town.',
};

export default config;
