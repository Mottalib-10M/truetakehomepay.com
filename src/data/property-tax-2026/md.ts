/**
 * Maryland Property Tax 2026
 *
 * Maryland assesses property at 100% of fair market value. The Homestead
 * Tax Credit caps annual assessment increases.
 *
 * Sources:
 * - Maryland Department of Assessments and Taxation
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'MD',
  stateName: 'Maryland',
  effectiveRate: 0.0105,
  medianHomeValue: 400000,
  medianAnnualTax: 4200,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead Tax Credit limits annual assessment increases to 10% (lower in some jurisdictions).',
  hasSeniorExemption: true,
  notes: 'Property is assessed at 100% of fair market value and reassessed every three years. The Homeowners Tax Credit provides relief for low-income homeowners.',
};

export default config;
