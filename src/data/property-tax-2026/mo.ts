/**
 * Missouri Property Tax 2026
 *
 * Missouri assesses residential property at 19% of appraised value.
 * Property is reassessed every two years (odd-numbered years).
 *
 * Sources:
 * - Missouri State Tax Commission
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'MO',
  stateName: 'Missouri',
  effectiveRate: 0.0091,
  medianHomeValue: 225000,
  medianAnnualTax: 2048,
  assessmentRatio: 0.19,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Property Tax Credit (Circuit Breaker) for low-income seniors and disabled homeowners.',
  hasSeniorExemption: true,
  notes: 'Residential property is assessed at 19% of appraised value. Missouri has a property tax credit program for eligible seniors and disabled individuals.',
};

export default config;
