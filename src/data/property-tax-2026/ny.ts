/**
 * New York Property Tax 2026
 *
 * New York has high property taxes, particularly outside New York City.
 * The STAR program provides school tax relief for homeowners.
 *
 * Sources:
 * - New York State Department of Taxation and Finance
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'NY',
  stateName: 'New York',
  effectiveRate: 0.0140,
  medianHomeValue: 380000,
  medianAnnualTax: 5320,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'STAR (School Tax Relief) program provides exemptions of up to $30,000 for Basic STAR and $74,900 for Enhanced STAR (seniors).',
  hasSeniorExemption: true,
  notes: 'Property tax rates vary enormously across the state. NYC has its own complex system. A 2% annual levy cap (tax cap) applies to most local governments and school districts outside NYC.',
};

export default config;
