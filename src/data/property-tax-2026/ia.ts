/**
 * Iowa Property Tax 2026
 *
 * Iowa property taxes are levied by local governments. The state provides
 * a homestead credit and a rollback percentage to reduce taxable value.
 *
 * Sources:
 * - Iowa Department of Revenue
 * - U.S. Census Bureau, American Community Survey
 */

import type { PropertyTaxConfig } from './types';

const config: PropertyTaxConfig = {
  stateCode: 'IA',
  stateName: 'Iowa',
  effectiveRate: 0.0143,
  medianHomeValue: 205000,
  medianAnnualTax: 2932,
  assessmentRatio: 0.5569,
  hasHomesteadExemption: true,
  homesteadExemptionDesc: 'Homestead tax credit of up to $4,850 against the taxable value of the property.',
  hasSeniorExemption: true,
  notes: 'Iowa applies a rollback percentage to residential property, reducing the taxable value. Rates vary significantly by school district and locality.',
};

export default config;
