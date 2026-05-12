/**
 * North Carolina Property Tax 2026
 *
 * North Carolina property taxes are administered by counties. Property
 * is assessed at 100% of appraised value.
 *
 * Sources:
 * - North Carolina Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'NC',
  stateName: 'North Carolina',
  effectiveRate: 0.0077,
  medianHomeValue: 310000,
  medianAnnualTax: 2387,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead exclusion of $25,000 or 50% of appraised value (whichever is greater) for qualifying elderly or disabled owners.',
  hasSeniorExemption: true,
  notes: 'Counties reappraise property every 4 to 8 years. There is no state property tax; all property taxes are levied by local governments.',
};

export default config;
