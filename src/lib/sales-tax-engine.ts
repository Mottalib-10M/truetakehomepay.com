/**
 * US Sales Tax Engine
 *
 * Calculates sales tax based on purchase amount, state, and locality.
 * Supports both forward (add tax) and reverse (remove tax) calculations.
 */

export interface SalesTaxConfig {
  /** State base sales tax rate (as decimal) */
  stateRate: number;
  /** Average combined rate (state + local average) */
  averageCombinedRate: number;
  /** Top cities/localities with rates */
  localities: { name: string; localRate: number; combinedRate: number }[];
  /** Exempt categories */
  exemptions: {
    groceries: 'exempt' | 'reduced' | 'taxed';
    groceryRate?: number;
    clothing: 'exempt' | 'taxed';
    prescriptionDrugs: 'exempt' | 'taxed';
  };
  /** Sales tax holidays */
  taxHolidays?: { name: string; dates: string; description: string }[];
  /** Whether state has no statewide sales tax */
  noStateSalesTax?: boolean;
}

export interface SalesTaxResult {
  purchaseAmount: number;
  stateTax: number;
  localTax: number;
  totalTax: number;
  totalPrice: number;
  effectiveRate: number;
}

/** Calculate sales tax (forward: add tax to purchase price) */
export function calculateSalesTax(
  purchaseAmount: number,
  stateRate: number,
  localRate = 0,
  category?: 'groceries' | 'clothing' | 'prescriptionDrugs',
  config?: SalesTaxConfig
): SalesTaxResult {
  let effectiveStateRate = stateRate;
  let effectiveLocalRate = localRate;

  // Check exemptions
  if (category && config) {
    const exemption = config.exemptions[category];
    if (exemption === 'exempt') {
      effectiveStateRate = 0;
      effectiveLocalRate = 0;
    } else if (exemption === 'reduced' && category === 'groceries' && config.exemptions.groceryRate !== undefined) {
      effectiveStateRate = config.exemptions.groceryRate;
    }
  }

  const stateTax = purchaseAmount * effectiveStateRate;
  const localTax = purchaseAmount * effectiveLocalRate;
  const totalTax = stateTax + localTax;

  return {
    purchaseAmount,
    stateTax,
    localTax,
    totalTax,
    totalPrice: purchaseAmount + totalTax,
    effectiveRate: effectiveStateRate + effectiveLocalRate,
  };
}

/** Remove sales tax (reverse: extract tax from total price) */
export function removeSalesTax(
  totalAmount: number,
  stateRate: number,
  localRate = 0
): SalesTaxResult {
  const combinedRate = stateRate + localRate;
  const purchaseAmount = totalAmount / (1 + combinedRate);
  const totalTax = totalAmount - purchaseAmount;
  const statePortion = combinedRate > 0 ? stateRate / combinedRate : 0;

  return {
    purchaseAmount,
    stateTax: totalTax * statePortion,
    localTax: totalTax * (1 - statePortion),
    totalTax,
    totalPrice: totalAmount,
    effectiveRate: combinedRate,
  };
}
