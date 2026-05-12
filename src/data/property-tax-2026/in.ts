/**
 * Indiana Property Tax 2026
 *
 * Indiana caps property tax rates constitutionally: 1% for homesteads,
 * 2% for other residential and agricultural, 3% for commercial/industrial.
 *
 * Sources:
 * - Indiana Department of Local Government Finance
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'IN',
  stateName: 'Indiana',
  effectiveRate: 0.0081,
  medianHomeValue: 210000,
  medianAnnualTax: 1701,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Standard deduction of the lesser of 60% of assessed value or $48,000 for owner-occupied primary residence.',
  hasSeniorExemption: true,
  notes: 'Indiana has a constitutional cap of 1% of assessed value for homesteads. The standard deduction and supplemental deductions reduce the tax base significantly.',
};

export default config;
