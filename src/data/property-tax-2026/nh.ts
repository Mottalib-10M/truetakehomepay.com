/**
 * New Hampshire Property Tax 2026
 *
 * New Hampshire has one of the highest effective property tax rates in the
 * country. With no income tax or sales tax, the state relies heavily on
 * property taxes for local government funding.
 *
 * Sources:
 * - New Hampshire Department of Revenue Administration
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'NH',
  stateName: 'New Hampshire',
  effectiveRate: 0.0193,
  medianHomeValue: 400000,
  medianAnnualTax: 7720,
  assessmentRatio: 1.0,
  hasHomesteadExemption: false,
  hasSeniorExemption: true,
  notes: 'New Hampshire has no broad-based homestead exemption. Municipalities may adopt local optional exemptions. Property taxes fund most local services due to the absence of income and sales taxes.',
};

export default config;
