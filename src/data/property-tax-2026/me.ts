/**
 * Maine Property Tax 2026
 *
 * Maine has above-average property tax rates. The state provides a
 * homestead exemption and a property tax fairness credit.
 *
 * Sources:
 * - Maine Revenue Services
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'ME',
  stateName: 'Maine',
  effectiveRate: 0.0124,
  medianHomeValue: 310000,
  medianAnnualTax: 3844,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '$25,000 homestead exemption on the assessed value of a primary residence.',
  hasSeniorExemption: true,
  notes: 'Maine offers a Property Tax Fairness Credit on the state income tax return for eligible residents. Rates vary significantly by municipality.',
};

export default config;
