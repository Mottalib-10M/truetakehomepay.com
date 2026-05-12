/**
 * Massachusetts Property Tax 2026
 *
 * Massachusetts has a uniform property tax system where all property
 * is assessed at 100% of fair cash value. Rates vary by municipality.
 *
 * Sources:
 * - Massachusetts Department of Revenue, Division of Local Services
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'MA',
  stateName: 'Massachusetts',
  effectiveRate: 0.0114,
  medianHomeValue: 575000,
  medianAnnualTax: 6555,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Residential exemption available in municipalities that adopt it; varies by city/town.',
  hasSeniorExemption: true,
  notes: 'Proposition 2½ limits the annual increase in total property taxes levied to 2.5%. Individual municipalities set their own tax rates.',
};

export default config;
