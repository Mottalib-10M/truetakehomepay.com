/**
 * Tennessee Property Tax 2026
 *
 * Tennessee has low property taxes. Residential property is assessed at
 * 25% of appraised value.
 *
 * Sources:
 * - Tennessee Comptroller of the Treasury
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'TN',
  stateName: 'Tennessee',
  effectiveRate: 0.0056,
  medianHomeValue: 280000,
  medianAnnualTax: 1568,
  assessmentRatio: 0.25,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Tax Relief Program for elderly, disabled, and disabled veteran homeowners (reimbursement of taxes on first $30,000 of market value).',
  hasSeniorExemption: true,
  notes: 'Residential property is assessed at 25% of appraised value. Tennessee has no state income tax on wages. Counties reappraise property every 4 to 6 years.',
};

export default config;
