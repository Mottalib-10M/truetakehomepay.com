/**
 * Delaware Property Tax 2026
 *
 * Delaware has relatively low property taxes. Assessments in many counties
 * are based on outdated valuations.
 *
 * Sources:
 * - Delaware Division of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'DE',
  stateName: 'Delaware',
  effectiveRate: 0.0056,
  medianHomeValue: 310000,
  medianAnnualTax: 1736,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'School property tax credit of up to $400 for owner-occupied primary residences.',
  hasSeniorExemption: true,
  notes: 'Property assessments in Delaware are based on older valuations in most counties, leading to lower effective rates. No state-level property tax is imposed.',
};

export default config;
