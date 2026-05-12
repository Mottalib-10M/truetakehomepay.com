/**
 * North Dakota Property Tax 2026
 *
 * North Dakota has moderate property tax rates. Residential property
 * is assessed at 50% of true and full value, then a 9% assessment ratio
 * is applied.
 *
 * Sources:
 * - North Dakota Office of State Tax Commissioner
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'ND',
  stateName: 'North Dakota',
  effectiveRate: 0.0098,
  medianHomeValue: 240000,
  medianAnnualTax: 2352,
  assessmentRatio: 0.045,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead credit reduces taxable value for qualifying homeowners.',
  hasSeniorExemption: true,
  notes: 'North Dakota applies a 50% assessment ratio then a 9% rate, resulting in an effective assessment of about 4.5% of market value. The state has a property tax credit program.',
};

export default config;
