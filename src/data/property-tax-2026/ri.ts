/**
 * Rhode Island Property Tax 2026
 *
 * Rhode Island has above-average property tax rates. Property is assessed
 * by municipalities with varying assessment practices.
 *
 * Sources:
 * - Rhode Island Division of Municipal Finance
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'RI',
  stateName: 'Rhode Island',
  effectiveRate: 0.0140,
  medianHomeValue: 400000,
  medianAnnualTax: 5600,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead exemptions vary by municipality; some cities offer up to $41,850 in exemptions.',
  hasSeniorExemption: true,
  notes: 'Rhode Island requires revaluation of property every nine years. Rates vary considerably by municipality.',
};

export default config;
