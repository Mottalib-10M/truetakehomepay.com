/**
 * Colorado Property Tax 2026
 *
 * Colorado has one of the lowest effective property tax rates in the country.
 * Residential property is assessed at a reduced ratio set by the legislature.
 *
 * Sources:
 * - Colorado Department of Local Affairs, Division of Property Taxation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'CO',
  stateName: 'Colorado',
  effectiveRate: 0.0049,
  medianHomeValue: 550000,
  medianAnnualTax: 2695,
  assessmentRatio: 0.0655,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Senior homestead exemption of 50% of the first $200,000 in actual value for qualifying seniors.',
  hasSeniorExemption: true,
  notes: 'Colorado assesses residential property at 6.55% of actual value (Gallagher Amendment replacement). Rates vary by county.',
};

export default config;
