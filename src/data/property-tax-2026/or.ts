/**
 * Oregon Property Tax 2026
 *
 * Oregon's property tax system is governed by Measures 5 and 50, which
 * limit tax rates and assessed value growth.
 *
 * Sources:
 * - Oregon Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'OR',
  stateName: 'Oregon',
  effectiveRate: 0.0087,
  medianHomeValue: 480000,
  medianAnnualTax: 4176,
  assessmentRatio: 1.0,
  hasHomesteadExemption: false,
  hasSeniorExemption: true,
  notes: 'Oregon has no general homestead exemption. Measure 5 limits the tax rate to $15 per $1,000 of real market value. Measure 50 limits assessed value increases to 3% per year. Oregon has no sales tax.',
};

export default config;
