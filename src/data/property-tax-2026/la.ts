/**
 * Louisiana Property Tax 2026
 *
 * Louisiana has low property taxes with a generous homestead exemption
 * on the first $75,000 of assessed value. Residential property is
 * assessed at 10% of fair market value.
 *
 * Sources:
 * - Louisiana Tax Commission
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'LA',
  stateName: 'Louisiana',
  effectiveRate: 0.0055,
  medianHomeValue: 200000,
  medianAnnualTax: 1100,
  assessmentRatio: 0.10,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'First $75,000 of assessed value ($7,500 in assessed value at 10%) exempt from parish taxes.',
  hasSeniorExemption: true,
  notes: 'Louisiana assesses residential property at 10% of fair market value. The homestead exemption effectively exempts many lower-valued homes entirely from parish taxes.',
};

export default config;
