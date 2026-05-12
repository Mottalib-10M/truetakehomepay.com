/**
 * US Income Tax Engine
 *
 * Calculates federal income tax, FICA (Social Security + Medicare),
 * state income tax, local income tax, and pre-tax deductions.
 *
 * Key design decisions:
 * - All calculations are annual, then divided by pay period
 * - Pre-tax deductions (401k traditional, HSA, FSA, health premiums)
 *   reduce taxable income differently for federal/state vs FICA
 * - 401(k) traditional reduces federal + state taxable income but NOT FICA
 * - HSA/FSA/Section 125 reduces federal + state + FICA taxable income
 */

import {
  FEDERAL_BRACKETS,
  STANDARD_DEDUCTION,
  SOCIAL_SECURITY_RATE,
  SOCIAL_SECURITY_WAGE_BASE,
  MEDICARE_RATE,
  ADDITIONAL_MEDICARE_RATE,
  ADDITIONAL_MEDICARE_THRESHOLD,
  SUPPLEMENTAL_RATE,
  SUPPLEMENTAL_RATE_OVER_1M,
  LONG_TERM_CG_BRACKETS,
  NIIT_RATE,
  NIIT_THRESHOLD,
  LOTTERY_FEDERAL_WITHHOLDING,
  SE_TAX_RATE,
  SE_SOCIAL_SECURITY_RATE,
  SE_MEDICARE_RATE,
  SE_DEDUCTION_FACTOR,
  CHILD_TAX_CREDIT,
  OTHER_DEPENDENT_CREDIT,
  type TaxBracket,
} from '../data/federal-tax-2026';
import type { FilingStatus, PayFrequency } from './format-us';
import { PAY_FREQUENCIES } from './format-us';

// ─── Types ─────────────────────────────────────────────────────────────

export interface PaycheckInput {
  grossAnnual: number;
  filingStatus: FilingStatus;
  state: string; // USPS abbreviation
  payFrequency: PayFrequency;

  // W-4 inputs
  dependentsUnder17?: number;
  otherDependents?: number;
  otherIncome?: number; // Step 4a
  otherDeductions?: number; // Step 4b
  additionalWithholding?: number; // Step 4c per period

  // Pre-tax deductions (annual amounts)
  traditional401k?: number;
  roth401k?: number; // Post-tax, no tax benefit
  hsa?: number;
  fsa?: number;
  healthPremiums?: number; // Section 125 cafeteria plan

  // Local tax overlay
  localTaxCode?: string;
}

export interface BracketDetail {
  rate: number;
  min: number;
  max: number;
  taxableInBracket: number;
  taxInBracket: number;
}

export interface PaycheckResult {
  // Annual amounts
  grossAnnual: number;
  federalTax: number;
  stateTax: number;
  localTax: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  stateDisability: number;
  statePFL: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
  netAnnual: number;

  // Per-period amounts
  grossPerPeriod: number;
  federalTaxPerPeriod: number;
  stateTaxPerPeriod: number;
  localTaxPerPeriod: number;
  socialSecurityPerPeriod: number;
  medicarePerPeriod: number;
  additionalMedicarePerPeriod: number;
  stateDisabilityPerPeriod: number;
  statePFLPerPeriod: number;
  preTaxDeductionsPerPeriod: number;
  postTaxDeductionsPerPeriod: number;
  netPerPeriod: number;

  // Breakdown details
  effectiveFederalRate: number;
  effectiveStateRate: number;
  effectiveTotalRate: number;
  marginalFederalRate: number;
  marginalStateRate: number;
  federalBrackets: BracketDetail[];
  stateBrackets: BracketDetail[];

  // Metadata
  payFrequency: PayFrequency;
  periods: number;
  filingStatus: FilingStatus;
  state: string;
  standardDeduction: number;
  taxableIncome: number;
}

// ─── Federal Income Tax ────────────────────────────────────────────────

/** Calculate tax through progressive brackets */
export function calculateBracketTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): { total: number; marginalRate: number; details: BracketDetail[] } {
  let total = 0;
  let marginalRate = 0;
  const details: BracketDetail[] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      details.push({
        rate: bracket.rate,
        min: bracket.min,
        max: bracket.max,
        taxableInBracket: 0,
        taxInBracket: 0,
      });
      continue;
    }

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const taxInBracket = taxableInBracket * bracket.rate;
    total += taxInBracket;
    marginalRate = bracket.rate;

    details.push({
      rate: bracket.rate,
      min: bracket.min,
      max: bracket.max,
      taxableInBracket,
      taxInBracket,
    });
  }

  return { total, marginalRate, details };
}

/** Calculate federal income tax */
export function calculateFederalTax(
  grossAnnual: number,
  filingStatus: FilingStatus,
  options?: {
    traditional401k?: number;
    hsa?: number;
    fsa?: number;
    healthPremiums?: number;
    otherDeductions?: number;
    dependentsUnder17?: number;
    otherDependents?: number;
    otherIncome?: number;
  }
): { tax: number; marginalRate: number; brackets: BracketDetail[]; taxableIncome: number; standardDeduction: number } {
  const {
    traditional401k = 0,
    hsa = 0,
    fsa = 0,
    healthPremiums = 0,
    otherDeductions = 0,
    dependentsUnder17 = 0,
    otherDependents = 0,
    otherIncome = 0,
  } = options || {};

  // AGI: gross - pre-tax 401k - HSA - FSA - health premiums + other income
  const agi = grossAnnual - traditional401k - hsa - fsa - healthPremiums + otherIncome;

  // Taxable income: AGI - standard deduction - other deductions
  const standardDeduction = STANDARD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, agi - standardDeduction - otherDeductions);

  // Calculate bracket tax
  const { total, marginalRate, details } = calculateBracketTax(
    taxableIncome,
    FEDERAL_BRACKETS[filingStatus]
  );

  // Apply credits
  const childCredit = dependentsUnder17 * CHILD_TAX_CREDIT;
  const otherDependentCredit = otherDependents * OTHER_DEPENDENT_CREDIT;
  const totalCredits = childCredit + otherDependentCredit;

  const tax = Math.max(0, total - totalCredits);

  return { tax, marginalRate, brackets: details, taxableIncome, standardDeduction };
}

// ─── FICA ──────────────────────────────────────────────────────────────

export interface FICAResult {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
}

/** Calculate FICA taxes (Social Security + Medicare + Additional Medicare) */
export function calculateFICA(
  grossAnnual: number,
  filingStatus: FilingStatus,
  options?: {
    hsa?: number;
    fsa?: number;
    healthPremiums?: number;
  }
): FICAResult {
  const { hsa = 0, fsa = 0, healthPremiums = 0 } = options || {};

  // HSA, FSA, and Section 125 health premiums reduce FICA wages
  // 401(k) does NOT reduce FICA wages
  const ficaWages = grossAnnual - hsa - fsa - healthPremiums;

  const socialSecurity = Math.min(ficaWages, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;
  const medicare = ficaWages * MEDICARE_RATE;

  const additionalMedicareThreshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
  const additionalMedicare =
    ficaWages > additionalMedicareThreshold
      ? (ficaWages - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE
      : 0;

  return {
    socialSecurity,
    medicare,
    additionalMedicare,
    total: socialSecurity + medicare + additionalMedicare,
  };
}

// ─── State Income Tax ──────────────────────────────────────────────────

/** State tax config — imported dynamically per state */
export interface StateIncomeTaxConfig {
  brackets: Record<FilingStatus, TaxBracket[]> | null; // null = no income tax
  standardDeduction?: Record<FilingStatus, number>;
  personalExemption?: Record<FilingStatus, number>;
  flatRate?: number; // For flat-tax states
  specialRules?: {
    sdi?: { rate: number; wageBase?: number }; // State Disability Insurance
    pfl?: { rate: number; wageBase?: number }; // Paid Family Leave
    sui?: { rate: number; wageBase?: number }; // State Unemployment Insurance (employee)
    wfd?: { rate: number; wageBase?: number }; // Workforce Development
    fli?: { rate: number; wageBase?: number }; // Family Leave Insurance
    mentalHealthSurtax?: { rate: number; threshold: number }; // CA Mental Health Services Tax
  };
}

export interface StateTaxResult {
  tax: number;
  marginalRate: number;
  brackets: BracketDetail[];
  disability: number;
  pfl: number;
}

/** Calculate state income tax */
export function calculateStateIncomeTax(
  grossAnnual: number,
  stateCode: string,
  filingStatus: FilingStatus,
  stateConfig: StateIncomeTaxConfig | null,
  options?: {
    traditional401k?: number;
    hsa?: number;
    fsa?: number;
    healthPremiums?: number;
  }
): StateTaxResult {
  // No state income tax
  if (!stateConfig || !stateConfig.brackets) {
    const disability = calculateStateDisability(grossAnnual, stateConfig);
    const pfl = calculateStatePFL(grossAnnual, stateConfig);
    return { tax: 0, marginalRate: 0, brackets: [], disability, pfl };
  }

  const { traditional401k = 0, hsa = 0, fsa = 0, healthPremiums = 0 } = options || {};

  // State AGI (most states follow federal AGI with adjustments)
  const stateAGI = grossAnnual - traditional401k - hsa - fsa - healthPremiums;

  // State standard deduction (some states have their own, others use federal)
  const stateStdDeduction = stateConfig.standardDeduction?.[filingStatus] ?? 0;
  const personalExemption = stateConfig.personalExemption?.[filingStatus] ?? 0;

  const taxableIncome = Math.max(0, stateAGI - stateStdDeduction - personalExemption);

  let tax: number;
  let marginalRate: number;
  let brackets: BracketDetail[];

  if (stateConfig.flatRate !== undefined) {
    // Flat-rate state
    tax = taxableIncome * stateConfig.flatRate;
    marginalRate = stateConfig.flatRate;
    brackets = [
      {
        rate: stateConfig.flatRate,
        min: 0,
        max: Infinity,
        taxableInBracket: taxableIncome,
        taxInBracket: tax,
      },
    ];
  } else {
    // Progressive bracket state
    const stateBrackets = stateConfig.brackets[filingStatus];
    const result = calculateBracketTax(taxableIncome, stateBrackets);
    tax = result.total;
    marginalRate = result.marginalRate;
    brackets = result.details;
  }

  // Mental Health Services Tax (California)
  if (stateConfig.specialRules?.mentalHealthSurtax) {
    const { rate, threshold } = stateConfig.specialRules.mentalHealthSurtax;
    if (taxableIncome > threshold) {
      tax += (taxableIncome - threshold) * rate;
    }
  }

  // State disability and PFL
  const disability = calculateStateDisability(grossAnnual, stateConfig);
  const pfl = calculateStatePFL(grossAnnual, stateConfig);

  return { tax, marginalRate, brackets, disability, pfl };
}

function calculateStateDisability(
  grossAnnual: number,
  stateConfig: StateIncomeTaxConfig | null
): number {
  if (!stateConfig?.specialRules?.sdi) return 0;
  const { rate, wageBase } = stateConfig.specialRules.sdi;
  const taxableWages = wageBase ? Math.min(grossAnnual, wageBase) : grossAnnual;
  return taxableWages * rate;
}

function calculateStatePFL(
  grossAnnual: number,
  stateConfig: StateIncomeTaxConfig | null
): number {
  if (!stateConfig?.specialRules?.pfl) return 0;
  const { rate, wageBase } = stateConfig.specialRules.pfl;
  const taxableWages = wageBase ? Math.min(grossAnnual, wageBase) : grossAnnual;
  return taxableWages * rate;
}

// ─── Local Tax ─────────────────────────────────────────────────────────

export interface LocalTaxConfig {
  name: string;
  rate: number;
  type: 'flat' | 'percent-of-state'; // NYC is flat rate on income, Yonkers is % of state tax
}

export function calculateLocalTax(
  grossAnnual: number,
  stateTax: number,
  localConfig: LocalTaxConfig | null
): number {
  if (!localConfig) return 0;
  if (localConfig.type === 'flat') {
    return grossAnnual * localConfig.rate;
  }
  // percent-of-state (e.g., Yonkers)
  return stateTax * localConfig.rate;
}

// ─── Bonus Tax ─────────────────────────────────────────────────────────

export interface BonusTaxResult {
  federalWithholding: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  totalTax: number;
  netBonus: number;
}

/** Calculate bonus tax using the supplemental flat rate method */
export function calculateBonusTax(
  bonusAmount: number,
  ytdGross: number,
  stateCode: string,
  filingStatus: FilingStatus,
  stateConfig: StateIncomeTaxConfig | null
): BonusTaxResult {
  // Federal: flat supplemental rate
  const federalWithholding =
    bonusAmount <= 1000000
      ? bonusAmount * SUPPLEMENTAL_RATE
      : 1000000 * SUPPLEMENTAL_RATE + (bonusAmount - 1000000) * SUPPLEMENTAL_RATE_OVER_1M;

  // FICA on bonus
  const remainingSSWageRoom = Math.max(0, SOCIAL_SECURITY_WAGE_BASE - ytdGross);
  const socialSecurity = Math.min(bonusAmount, remainingSSWageRoom) * SOCIAL_SECURITY_RATE;
  const medicare = bonusAmount * MEDICARE_RATE;

  // State tax on bonus (simplified: use marginal rate)
  let stateTax = 0;
  if (stateConfig?.flatRate !== undefined) {
    stateTax = bonusAmount * stateConfig.flatRate;
  } else if (stateConfig?.brackets) {
    // Use supplemental rate if state has one, otherwise estimate marginal rate
    const annualWithBonus = ytdGross + bonusAmount;
    const withoutBonus = calculateStateIncomeTax(ytdGross, stateCode, filingStatus, stateConfig);
    const withBonus = calculateStateIncomeTax(annualWithBonus, stateCode, filingStatus, stateConfig);
    stateTax = withBonus.tax - withoutBonus.tax;
  }

  const totalTax = federalWithholding + socialSecurity + medicare + stateTax;

  return {
    federalWithholding,
    socialSecurity,
    medicare,
    stateTax,
    totalTax,
    netBonus: bonusAmount - totalTax,
  };
}

// ─── Capital Gains Tax ─────────────────────────────────────────────────

export interface CapitalGainsTaxResult {
  federalTax: number;
  niit: number;
  stateTax: number;
  totalTax: number;
  effectiveRate: number;
}

/** Calculate capital gains tax */
export function calculateCapitalGainsTax(
  gains: number,
  isLongTerm: boolean,
  ordinaryIncome: number,
  filingStatus: FilingStatus,
  stateCode: string,
  stateConfig: StateIncomeTaxConfig | null
): CapitalGainsTaxResult {
  let federalTax: number;

  if (isLongTerm) {
    // Long-term capital gains get preferential rates
    const totalIncome = ordinaryIncome + gains;
    const brackets = LONG_TERM_CG_BRACKETS[filingStatus];
    // The CG brackets apply to total taxable income, but only the gain portion pays CG rates
    let remaining = gains;
    federalTax = 0;

    for (const bracket of brackets) {
      if (totalIncome <= bracket.min || remaining <= 0) continue;
      const incomeInBracket = Math.min(totalIncome, bracket.max) - Math.max(ordinaryIncome, bracket.min);
      if (incomeInBracket <= 0) continue;
      const taxable = Math.min(remaining, incomeInBracket);
      federalTax += taxable * bracket.rate;
      remaining -= taxable;
    }
  } else {
    // Short-term: taxed as ordinary income
    const withoutGains = calculateFederalTax(ordinaryIncome, filingStatus);
    const withGains = calculateFederalTax(ordinaryIncome + gains, filingStatus);
    federalTax = withGains.tax - withoutGains.tax;
  }

  // NIIT
  const totalIncome = ordinaryIncome + gains;
  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  const niit = totalIncome > niitThreshold
    ? Math.min(gains, totalIncome - niitThreshold) * NIIT_RATE
    : 0;

  // State tax on gains (most states tax at ordinary income rates)
  let stateTax = 0;
  if (stateConfig?.brackets || stateConfig?.flatRate !== undefined) {
    const withoutGains = calculateStateIncomeTax(ordinaryIncome, stateCode, filingStatus, stateConfig);
    const withGains = calculateStateIncomeTax(ordinaryIncome + gains, stateCode, filingStatus, stateConfig);
    stateTax = withGains.tax - withoutGains.tax;
  }

  const totalTax = federalTax + niit + stateTax;

  return {
    federalTax,
    niit,
    stateTax,
    totalTax,
    effectiveRate: gains > 0 ? totalTax / gains : 0,
  };
}

// ─── Self-Employment Tax ───────────────────────────────────────────────

export interface SelfEmploymentTaxResult {
  seTax: number;
  socialSecurityPortion: number;
  medicarePortion: number;
  additionalMedicare: number;
  deductibleHalf: number;
  effectiveRate: number;
}

/** Calculate self-employment tax */
export function calculateSelfEmploymentTax(
  netSEIncome: number,
  filingStatus: FilingStatus
): SelfEmploymentTaxResult {
  const taxableBase = netSEIncome * SE_TAX_RATE;

  const socialSecurityPortion = Math.min(taxableBase, SOCIAL_SECURITY_WAGE_BASE) * SE_SOCIAL_SECURITY_RATE;
  const medicarePortion = taxableBase * SE_MEDICARE_RATE;

  const additionalMedicareThreshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
  const additionalMedicare =
    taxableBase > additionalMedicareThreshold
      ? (taxableBase - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE
      : 0;

  const seTax = socialSecurityPortion + medicarePortion + additionalMedicare;
  const deductibleHalf = (socialSecurityPortion + medicarePortion) * SE_DEDUCTION_FACTOR;

  return {
    seTax,
    socialSecurityPortion,
    medicarePortion,
    additionalMedicare,
    deductibleHalf,
    effectiveRate: netSEIncome > 0 ? seTax / netSEIncome : 0,
  };
}

// ─── Lottery Tax ───────────────────────────────────────────────────────

export interface LotteryTaxResult {
  federalWithholding: number;
  federalTaxOwed: number;
  additionalFederalDue: number;
  stateTax: number;
  totalTax: number;
  netWinnings: number;
  effectiveRate: number;
}

/** Calculate lottery/gambling tax */
export function calculateLotteryTax(
  winnings: number,
  filingStatus: FilingStatus,
  stateCode: string,
  stateConfig: StateIncomeTaxConfig | null,
  otherIncome = 0
): LotteryTaxResult {
  // Federal mandatory withholding (24%)
  const federalWithholding = winnings * LOTTERY_FEDERAL_WITHHOLDING;

  // Actual federal tax owed (based on total income including winnings)
  const totalIncome = otherIncome + winnings;
  const withWinnings = calculateFederalTax(totalIncome, filingStatus);
  const withoutWinnings = calculateFederalTax(otherIncome, filingStatus);
  const federalTaxOwed = withWinnings.tax - withoutWinnings.tax;

  // Additional federal tax due beyond withholding
  const additionalFederalDue = Math.max(0, federalTaxOwed - federalWithholding);

  // State tax
  let stateTax = 0;
  if (stateConfig?.brackets || stateConfig?.flatRate !== undefined) {
    const stateWithWinnings = calculateStateIncomeTax(totalIncome, stateCode, filingStatus, stateConfig);
    const stateWithoutWinnings = calculateStateIncomeTax(otherIncome, stateCode, filingStatus, stateConfig);
    stateTax = stateWithWinnings.tax - stateWithoutWinnings.tax;
  }

  const totalTax = federalTaxOwed + stateTax;

  return {
    federalWithholding,
    federalTaxOwed,
    additionalFederalDue,
    stateTax,
    totalTax,
    netWinnings: winnings - totalTax,
    effectiveRate: winnings > 0 ? totalTax / winnings : 0,
  };
}

// ─── Main Paycheck Calculator ──────────────────────────────────────────

/** Calculate complete paycheck breakdown */
export function calculatePaycheck(
  input: PaycheckInput,
  stateConfig: StateIncomeTaxConfig | null,
  localConfig: LocalTaxConfig | null = null
): PaycheckResult {
  const {
    grossAnnual,
    filingStatus,
    state,
    payFrequency,
    dependentsUnder17 = 0,
    otherDependents = 0,
    otherIncome = 0,
    otherDeductions = 0,
    additionalWithholding = 0,
    traditional401k = 0,
    roth401k = 0,
    hsa = 0,
    fsa = 0,
    healthPremiums = 0,
  } = input;

  const periods = PAY_FREQUENCIES[payFrequency].periods;

  // Pre-tax deductions (reduce taxable income)
  const preTaxDeductions = traditional401k + hsa + fsa + healthPremiums;
  // Post-tax deductions (do not reduce taxable income)
  const postTaxDeductions = roth401k;

  // Federal tax
  const federal = calculateFederalTax(grossAnnual, filingStatus, {
    traditional401k,
    hsa,
    fsa,
    healthPremiums,
    otherDeductions,
    dependentsUnder17,
    otherDependents,
    otherIncome,
  });

  // Add per-period additional withholding
  const additionalWithholdingAnnual = additionalWithholding * periods;
  const federalTax = federal.tax + additionalWithholdingAnnual;

  // FICA
  const fica = calculateFICA(grossAnnual, filingStatus, { hsa, fsa, healthPremiums });

  // State tax
  const stateTaxResult = calculateStateIncomeTax(grossAnnual, state, filingStatus, stateConfig, {
    traditional401k,
    hsa,
    fsa,
    healthPremiums,
  });

  // Local tax
  const localTax = calculateLocalTax(grossAnnual, stateTaxResult.tax, localConfig);

  // Net annual
  const totalDeductions =
    federalTax +
    stateTaxResult.tax +
    localTax +
    fica.socialSecurity +
    fica.medicare +
    fica.additionalMedicare +
    stateTaxResult.disability +
    stateTaxResult.pfl +
    preTaxDeductions +
    postTaxDeductions;

  const netAnnual = grossAnnual - totalDeductions;

  // Effective rates
  const effectiveFederalRate = grossAnnual > 0 ? federalTax / grossAnnual : 0;
  const effectiveStateRate = grossAnnual > 0 ? (stateTaxResult.tax + localTax) / grossAnnual : 0;
  const effectiveTotalRate = grossAnnual > 0 ? totalDeductions / grossAnnual : 0;

  return {
    // Annual
    grossAnnual,
    federalTax,
    stateTax: stateTaxResult.tax,
    localTax,
    socialSecurity: fica.socialSecurity,
    medicare: fica.medicare,
    additionalMedicare: fica.additionalMedicare,
    stateDisability: stateTaxResult.disability,
    statePFL: stateTaxResult.pfl,
    preTaxDeductions,
    postTaxDeductions,
    netAnnual,

    // Per-period
    grossPerPeriod: grossAnnual / periods,
    federalTaxPerPeriod: federalTax / periods,
    stateTaxPerPeriod: stateTaxResult.tax / periods,
    localTaxPerPeriod: localTax / periods,
    socialSecurityPerPeriod: fica.socialSecurity / periods,
    medicarePerPeriod: fica.medicare / periods,
    additionalMedicarePerPeriod: fica.additionalMedicare / periods,
    stateDisabilityPerPeriod: stateTaxResult.disability / periods,
    statePFLPerPeriod: stateTaxResult.pfl / periods,
    preTaxDeductionsPerPeriod: preTaxDeductions / periods,
    postTaxDeductionsPerPeriod: postTaxDeductions / periods,
    netPerPeriod: netAnnual / periods,

    // Details
    effectiveFederalRate,
    effectiveStateRate,
    effectiveTotalRate,
    marginalFederalRate: federal.marginalRate,
    marginalStateRate: stateTaxResult.marginalRate,
    federalBrackets: federal.brackets,
    stateBrackets: stateTaxResult.brackets,

    // Metadata
    payFrequency,
    periods,
    filingStatus,
    state,
    standardDeduction: federal.standardDeduction,
    taxableIncome: federal.taxableIncome,
  };
}
