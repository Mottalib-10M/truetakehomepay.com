/**
 * Ohio Property Tax 2026
 *
 * Ohio assesses property at 35% of appraised market value. Counties
 * reappraise property every six years with triennial updates.
 *
 * Sources:
 * - Ohio Department of Taxation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'OH',
  stateName: 'Ohio',
  effectiveRate: 0.0136,
  medianHomeValue: 190000,
  medianAnnualTax: 2584,
  assessmentRatio: 0.35,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead exemption of $26,200 in market value for seniors 65+ and permanently disabled.',
  hasSeniorExemption: true,
  notes: 'Property is assessed at 35% of appraised value. Ohio has a 10% rollback and 2.5% rollback that reduce taxes for all owner-occupied homes.',
};

export default config;
