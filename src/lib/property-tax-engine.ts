/**
 * US Property Tax Engine
 *
 * Calculates estimated annual property tax based on home value,
 * state, county, and applicable exemptions.
 */

export interface PropertyTaxConfig {
  /** State average effective property tax rate (as decimal, e.g., 0.0099 = 0.99%) */
  averageRate: number;
  /** Top counties with their effective rates */
  counties: { name: string; rate: number }[];
  /** Homestead exemption */
  homesteadExemption?: {
    type: 'amount' | 'percentage';
    value: number;
    description: string;
  };
  /** Senior exemption */
  seniorExemption?: {
    description: string;
  };
  /** Assessment ratio (some states assess at less than 100% of market value) */
  assessmentRatio?: number;
  /** Tax due dates */
  dueDates?: string;
}

export interface PropertyTaxResult {
  annualTax: number;
  monthlyTax: number;
  effectiveRate: number;
  assessedValue: number;
  exemptionAmount: number;
  taxableValue: number;
}

/** Calculate property tax */
export function calculatePropertyTax(
  homeValue: number,
  rate: number,
  options?: {
    assessmentRatio?: number;
    homesteadExemption?: { type: 'amount' | 'percentage'; value: number };
  }
): PropertyTaxResult {
  const assessmentRatio = options?.assessmentRatio ?? 1;
  const assessedValue = homeValue * assessmentRatio;

  let exemptionAmount = 0;
  if (options?.homesteadExemption) {
    if (options.homesteadExemption.type === 'amount') {
      exemptionAmount = Math.min(options.homesteadExemption.value, assessedValue);
    } else {
      exemptionAmount = assessedValue * options.homesteadExemption.value;
    }
  }

  const taxableValue = Math.max(0, assessedValue - exemptionAmount);
  const annualTax = taxableValue * rate;

  return {
    annualTax,
    monthlyTax: annualTax / 12,
    effectiveRate: homeValue > 0 ? annualTax / homeValue : 0,
    assessedValue,
    exemptionAmount,
    taxableValue,
  };
}

/** Compare property tax across all states for a given home value */
export function comparePropertyTaxByState(
  homeValue: number,
  stateConfigs: Record<string, PropertyTaxConfig>
): { state: string; annualTax: number; effectiveRate: number }[] {
  return Object.entries(stateConfigs)
    .map(([state, config]) => {
      const result = calculatePropertyTax(homeValue, config.averageRate, {
        assessmentRatio: config.assessmentRatio,
      });
      return { state, annualTax: result.annualTax, effectiveRate: result.effectiveRate };
    })
    .sort((a, b) => a.annualTax - b.annualTax);
}
