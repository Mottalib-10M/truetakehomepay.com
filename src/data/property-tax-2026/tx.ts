/**
 * Texas Property Tax 2026
 *
 * Texas has high property taxes as the state has no income tax and relies
 * heavily on property taxes for local government funding.
 *
 * Sources:
 * - Texas Comptroller of Public Accounts
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'TX',
  stateName: 'Texas',
  effectiveRate: 0.0160,
  medianHomeValue: 300000,
  medianAnnualTax: 4800,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$100,000 homestead exemption for school district taxes; additional exemptions available from cities and counties.',
  hasSeniorExemption: true,
  notes: 'Texas has no state income tax. Property is assessed at 100% of market value. The $100,000 school district homestead exemption was increased from $40,000 in 2023. A 10% annual appraisal cap applies to homesteads.',
};

export default config;
