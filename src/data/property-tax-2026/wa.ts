/**
 * Washington Property Tax 2026
 *
 * Washington has no state income tax. Property taxes are limited by
 * a 1% annual levy growth cap.
 *
 * Sources:
 * - Washington Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'WA',
  stateName: 'Washington',
  effectiveRate: 0.0093,
  medianHomeValue: 575000,
  medianAnnualTax: 5348,
  assessmentRatio: 1.0,
  hasHomesteadExemption: false,
  hasSeniorExemption: true,
  notes: 'Washington has no traditional homestead exemption but provides a senior/disabled persons exemption and deferral program. Property is assessed at 100% of market value. The state has no income tax.',
};

export default config;
