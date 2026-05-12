/**
 * Wyoming Property Tax 2026
 *
 * Wyoming has no state income tax and moderate property taxes. Residential
 * property is assessed at 9.5% of fair market value.
 *
 * Sources:
 * - Wyoming Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'WY',
  stateName: 'Wyoming',
  effectiveRate: 0.0057,
  medianHomeValue: 310000,
  medianAnnualTax: 1767,
  assessmentRatio: 0.095,
  hasHomesteadExemption: false,
  hasSeniorExemption: true,
  notes: 'Wyoming has no state income tax. Residential property is assessed at 9.5% of fair market value. The state provides a property tax refund program for qualifying low-income residents.',
};

export default config;
