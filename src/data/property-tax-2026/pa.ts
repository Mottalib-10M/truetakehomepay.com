/**
 * Pennsylvania Property Tax 2026
 *
 * Pennsylvania property taxes are levied by local governments and school
 * districts. Assessment practices vary widely by county.
 *
 * Sources:
 * - Pennsylvania Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'PA',
  stateName: 'Pennsylvania',
  effectiveRate: 0.0136,
  medianHomeValue: 240000,
  medianAnnualTax: 3264,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead exclusion funded by gaming revenue reduces assessed value for school taxes (amount varies by district).',
  hasSeniorExemption: true,
  notes: 'Assessment ratios vary significantly by county. Pennsylvania has a Property Tax/Rent Rebate Program for eligible seniors and disabled residents.',
};

export default config;
