/**
 * Property Tax Configuration Interface – 2026 Tax Year
 */

export interface PropertyTaxConfig {
  stateCode: string;
  stateName: string;
  /** Effective property tax rate as a decimal (e.g., 0.0098 for 0.98%) */
  effectiveRate: number;
  /** Median home value in the state */
  medianHomeValue: number;
  /** Median annual property tax */
  medianAnnualTax: number;
  /** Assessment ratio (assessed value / market value) */
  assessmentRatio: number;
  /** Whether the state has a homestead exemption */
  hasHomesteadExemption: boolean;
  /** Homestead exemption description */
  homesteadExemptionDesc?: string;
  /** Senior exemption available */
  hasSeniorExemption: boolean;
  /** Notes about the state's property tax system */
  notes?: string;
}
