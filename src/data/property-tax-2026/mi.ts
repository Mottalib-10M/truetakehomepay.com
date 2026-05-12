/**
 * Michigan Property Tax 2026
 *
 * Michigan assesses property at 50% of true cash value (State Equalized
 * Value). Proposal A caps annual taxable value increases.
 *
 * Sources:
 * - Michigan Department of Treasury
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'MI',
  stateName: 'Michigan',
  effectiveRate: 0.0138,
  medianHomeValue: 230000,
  medianAnnualTax: 3174,
  assessmentRatio: 0.50,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Principal Residence Exemption (PRE) exempts the property from 18 mills of school operating taxes.',
  hasSeniorExemption: true,
  notes: 'Michigan assesses property at 50% of market value. Proposal A (1994) caps annual taxable value increases at the lesser of 5% or inflation.',
};

export default config;
