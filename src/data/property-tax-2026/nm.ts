/**
 * New Mexico Property Tax 2026
 *
 * New Mexico assesses residential property at 33.33% of market value.
 * The state offers a head-of-family exemption and a veterans exemption.
 *
 * Sources:
 * - New Mexico Taxation and Revenue Department
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'NM',
  stateName: 'New Mexico',
  effectiveRate: 0.0067,
  medianHomeValue: 275000,
  medianAnnualTax: 1843,
  assessmentRatio: 0.333,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Head-of-family exemption of $2,000 off taxable value; veterans exemption of $4,000.',
  hasSeniorExemption: true,
  notes: 'Property is assessed at 33.33% of market value. Annual valuation increases are limited. The state also provides a low-income property tax rebate.',
};

export default config;
