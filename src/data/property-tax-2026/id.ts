/**
 * Idaho Property Tax 2026
 *
 * Idaho property taxes are levied by local taxing districts. The state
 * offers a homeowner exemption that reduces taxable value.
 *
 * Sources:
 * - Idaho State Tax Commission
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'ID',
  stateName: 'Idaho',
  effectiveRate: 0.0063,
  medianHomeValue: 410000,
  medianAnnualTax: 2583,
  assessmentRatio: 1.0,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: '50% of the assessed value up to a maximum of $125,000 for owner-occupied primary residence.',
  hasSeniorExemption: true,
  notes: 'Idaho has seen rapid home value growth. The homeowner exemption is significant and reduces the taxable value substantially.',
};

export default config;
