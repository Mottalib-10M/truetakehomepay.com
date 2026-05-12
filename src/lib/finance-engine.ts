/**
 * Financial Calculator Engine
 *
 * Pure functions for mortgage, loan, savings, retirement,
 * and personal finance calculations.
 */

// ─── Mortgage ──────────────────────────────────────────────────────────

export interface MortgageResult {
  monthlyPayment: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  totalPayment: number;
  totalInterest: number;
  amortizationSchedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateMortgage(
  principal: number,
  annualRate: number,
  years: number,
  options?: {
    downPayment?: number;
    annualPropertyTax?: number;
    annualInsurance?: number;
    pmiRate?: number; // PMI rate if LTV > 80%
  }
): MortgageResult {
  const { downPayment = 0, annualPropertyTax = 0, annualInsurance = 0, pmiRate = 0 } = options ?? {};

  const loanAmount = principal - downPayment;
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  // Monthly P&I payment
  const monthlyPI = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;

  const monthlyPropertyTax = annualPropertyTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const ltv = principal > 0 ? loanAmount / principal : 0;
  const monthlyPMI = ltv > 0.8 ? (loanAmount * pmiRate) / 12 : 0;

  const monthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI;

  // Amortization schedule
  const schedule: AmortizationEntry[] = [];
  let balance = loanAmount;
  let totalInterest = 0;

  for (let month = 1; month <= numPayments && balance > 0; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(monthlyPI - interest, balance);
    balance -= principalPaid;
    totalInterest += interest;

    schedule.push({
      month,
      payment: monthlyPI,
      principal: principalPaid,
      interest,
      balance: Math.max(0, balance),
    });
  }

  return {
    monthlyPayment,
    monthlyPrincipalAndInterest: monthlyPI,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    totalPayment: monthlyPI * numPayments + annualPropertyTax * years + annualInsurance * years,
    totalInterest,
    amortizationSchedule: schedule,
  };
}

// ─── Auto Loan ─────────────────────────────────────────────────────────

export interface AutoLoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalCost: number; // including sales tax and fees
}

export function calculateAutoLoan(
  price: number,
  downPayment: number,
  tradeInValue: number,
  salesTaxRate: number,
  annualRate: number,
  termMonths: number
): AutoLoanResult {
  const taxableAmount = price - tradeInValue;
  const salesTax = Math.max(0, taxableAmount) * salesTaxRate;
  const loanAmount = price - downPayment - tradeInValue + salesTax;

  const monthlyRate = annualRate / 12;
  const monthlyPayment = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    : loanAmount / termMonths;

  const totalPayment = monthlyPayment * termMonths;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest: totalPayment - loanAmount,
    totalCost: totalPayment + downPayment + tradeInValue,
  };
}

// ─── Compound Interest ─────────────────────────────────────────────────

export interface CompoundInterestResult {
  finalValue: number;
  totalContributions: number;
  totalInterest: number;
  yearlyBreakdown: { year: number; balance: number; contributions: number; interest: number }[];
}

export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
  compoundingFrequency = 12
): CompoundInterestResult {
  const r = annualRate / compoundingFrequency;
  const n = compoundingFrequency;
  const yearlyBreakdown: CompoundInterestResult['yearlyBreakdown'] = [];

  let balance = principal;
  let totalContributions = principal;
  let totalInterest = 0;

  for (let year = 1; year <= years; year++) {
    let yearInterest = 0;
    for (let period = 0; period < n; period++) {
      const interest = balance * r;
      balance += interest + monthlyContribution * (12 / n);
      yearInterest += interest;
      totalContributions += monthlyContribution * (12 / n);
    }
    totalInterest += yearInterest;
    yearlyBreakdown.push({
      year,
      balance,
      contributions: totalContributions,
      interest: totalInterest,
    });
  }

  return {
    finalValue: balance,
    totalContributions,
    totalInterest,
    yearlyBreakdown,
  };
}

// ─── 401(k) Retirement ─────────────────────────────────────────────────

export interface Retirement401kResult {
  projectedBalance: number;
  totalContributions: number;
  employerContributions: number;
  investmentGrowth: number;
  yearlyBreakdown: { year: number; balance: number; yourContrib: number; employerContrib: number; growth: number }[];
}

export function calculate401k(
  currentBalance: number,
  annualSalary: number,
  contributionRate: number,
  employerMatchRate: number,
  employerMatchLimit: number,
  years: number,
  annualReturnRate: number,
  annualSalaryGrowth = 0.03
): Retirement401kResult {
  const yearlyBreakdown: Retirement401kResult['yearlyBreakdown'] = [];
  let balance = currentBalance;
  let totalContribs = 0;
  let totalEmployer = 0;
  let salary = annualSalary;

  for (let year = 1; year <= years; year++) {
    const yourContrib = salary * contributionRate;
    const matchableContrib = Math.min(yourContrib, salary * employerMatchLimit);
    const employerContrib = matchableContrib * employerMatchRate;

    const totalAnnualContrib = yourContrib + employerContrib;
    const growth = balance * annualReturnRate;
    balance += totalAnnualContrib + growth;
    totalContribs += yourContrib;
    totalEmployer += employerContrib;

    yearlyBreakdown.push({
      year,
      balance,
      yourContrib: totalContribs,
      employerContrib: totalEmployer,
      growth: balance - currentBalance - totalContribs - totalEmployer,
    });

    salary *= 1 + annualSalaryGrowth;
  }

  return {
    projectedBalance: balance,
    totalContributions: totalContribs,
    employerContributions: totalEmployer,
    investmentGrowth: balance - currentBalance - totalContribs - totalEmployer,
    yearlyBreakdown,
  };
}

// ─── Credit Card Payoff ────────────────────────────────────────────────

export interface CreditCardPayoffResult {
  monthsToPayoff: number;
  totalPayment: number;
  totalInterest: number;
  monthlyPayment: number;
}

export function calculateCreditCardPayoff(
  balance: number,
  annualRate: number,
  fixedPayment: number
): CreditCardPayoffResult {
  const monthlyRate = annualRate / 12;
  let remaining = balance;
  let months = 0;
  let totalInterest = 0;

  while (remaining > 0 && months < 600) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - fixedPayment;
    months++;

    if (remaining > balance * 2) {
      // Payment too low, will never pay off
      return { monthsToPayoff: Infinity, totalPayment: Infinity, totalInterest: Infinity, monthlyPayment: fixedPayment };
    }
  }

  return {
    monthsToPayoff: months,
    totalPayment: balance + totalInterest,
    totalInterest,
    monthlyPayment: fixedPayment,
  };
}
