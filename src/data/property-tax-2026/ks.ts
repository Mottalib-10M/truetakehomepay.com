/**
 * Kansas Property Tax 2026
 *
 * Kansas assesses residential property at 11.5% of appraised value.
 * Local jurisdictions set mill levies.
 *
 * Sources:
 * - Kansas Department of Revenue, Division of Property Valuation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'KS',
  stateName: 'Kansas',
  effectiveRate: 0.0133,
  medianHomeValue: 210000,
  medianAnnualTax: 2793,
  assessmentRatio: 0.115,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead refund available for qualifying low-income homeowners and seniors.',
  hasSeniorExemption: true,
  notes: 'Residential property is assessed at 11.5% of appraised value. The SAFESR program provides refunds for qualifying seniors.',
};

export default config;
