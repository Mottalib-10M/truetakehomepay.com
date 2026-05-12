/**
 * Virginia Property Tax 2026
 *
 * Virginia property taxes are administered by cities and counties.
 * Property is generally assessed at 100% of fair market value.
 *
 * Sources:
 * - Virginia Department of Taxation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'VA',
  stateName: 'Virginia',
  effectiveRate: 0.0082,
  medianHomeValue: 380000,
  medianAnnualTax: 3116,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Real estate tax relief for elderly and disabled available at the local level; localities set their own programs.',
  hasSeniorExemption: true,
  notes: 'Virginia is one of the few states where cities and counties are independent taxing jurisdictions. Rates vary widely from rural areas to Northern Virginia.',
};

export default config;
