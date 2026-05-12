/**
 * Nebraska Property Tax 2026
 *
 * Nebraska has above-average property taxes. The state has been working
 * to provide property tax relief through income tax credits.
 *
 * Sources:
 * - Nebraska Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'NE',
  stateName: 'Nebraska',
  effectiveRate: 0.0154,
  medianHomeValue: 225000,
  medianAnnualTax: 3465,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead exemption for qualifying low-income homeowners, seniors, and disabled veterans.',
  hasSeniorExemption: true,
  notes: 'Nebraska provides a refundable income tax credit for property taxes paid on a primary residence. Residential property is assessed at 100% of market value.',
};

export default config;
