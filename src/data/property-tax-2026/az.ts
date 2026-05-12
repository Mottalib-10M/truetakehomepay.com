/**
 * Arizona Property Tax 2026
 *
 * Arizona assesses residential property at a limited value with a relatively
 * low effective rate. The state offers multiple exemptions.
 *
 * Sources:
 * - Arizona Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'AZ',
  stateName: 'Arizona',
  effectiveRate: 0.0060,
  medianHomeValue: 375000,
  medianAnnualTax: 2250,
  assessmentRatio: 0.10,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Primary residence assessed at limited property value (lower than full cash value).',
  hasSeniorExemption: true,
  notes: 'Arizona uses a "limited property value" system that caps annual increases in assessed value.',
};

export default config;
