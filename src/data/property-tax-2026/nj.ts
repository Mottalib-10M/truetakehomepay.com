/**
 * New Jersey Property Tax 2026
 *
 * New Jersey has the highest effective property tax rate in the nation.
 * Property is assessed at 100% of true market value in most municipalities.
 *
 * Sources:
 * - New Jersey Division of Taxation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'NJ',
  stateName: 'New Jersey',
  effectiveRate: 0.0223,
  medianHomeValue: 425000,
  medianAnnualTax: 9478,
  assessmentRatio: 1.0,
  hasHomesteadExemption: false,
  hasSeniorExemption: true,
  notes: 'New Jersey has no traditional homestead exemption but offers the ANCHOR property tax relief program. Senior citizens and disabled individuals may qualify for a $250 deduction or tax freeze (Senior Freeze program).',
};

export default config;
