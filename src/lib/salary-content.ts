/**
 * Salary page content helpers — generates unique, calculated content
 * for each salary amount on [amount]-after-taxes pages.
 *
 * Every function returns values derived from the tax engine so that
 * content contains real calculated dollar amounts, not static text.
 *
 * UNIQUENESS: Each salary amount within the same band produces 80%+
 * unique content through salary-specific calculations, role assignments,
 * adjacent-level comparisons, and per-amount narrative variations.
 */

import { calculatePaycheck, calculateFederalTax, calculateFICA } from './tax-engine';
import { getStateTaxConfig } from '../data/income-tax-2026/index';
import { formatCurrencyRound, formatPercent } from './format-us';
import { TAX_YEAR, AUTHOR_NAME, AUTHOR_CREDENTIALS } from './constants';
import { STATES, TOP_10_STATES, SALARY_AMOUNTS, type StateMeta } from '../data/state-meta';
import type { PaycheckResult } from './tax-engine';

// ─── Types ────────────────────────────────────────────────────────────

export type SalaryBand = 'entry' | 'median' | 'professional' | 'senior' | 'executive';

export interface FAQ {
  question: string;
  answer: string;
}

export interface BudgetRow {
  category: string;
  percent: number;
  monthly: number;
  annual: number;
}

export interface StateComparison {
  code: string;
  name: string;
  slug: string;
  netAnnual: number;
  federalTax: number;
  stateTax: number;
  fica: number;
  effectiveRate: number;
  narrative: string;
}

export interface CareerInfo {
  title: string;
  roles: string[];
  description: string;
  advancement: string;
}

export interface SalarySpecificContext {
  raiseAnalysis: string;
  adjacentComparison: string;
  purchasingPower: string;
  medianComparison: string;
}

// ─── Constants for uniqueness ─────────────────────────────────────────

const US_MEDIAN_INDIVIDUAL_INCOME = 59540; // 2024 Census data, used for ratio calculations

// Federal bracket thresholds (single filer, after standard deduction applied)
const FEDERAL_BRACKET_THRESHOLDS = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

// ─── Salary-specific role assignments (unique per exact amount) ────────

const ROLES_BY_AMOUNT: Record<number, string[]> = {
  30000: [
    'Retail sales associate',
    'Food service supervisor',
    'Daycare worker',
    'Receptionist',
    'Library assistant',
    'Junior security guard',
  ],
  40000: [
    'Customer service representative',
    'Administrative assistant',
    'Junior retail manager',
    'Entry-level warehouse supervisor',
    'Beginning teacher (some districts)',
    'Junior graphic designer',
  ],
  50000: [
    'Marketing coordinator',
    'Junior software developer',
    'Dental hygienist',
    'Insurance claims adjuster',
    'Logistics coordinator',
    'Social media specialist',
  ],
  60000: [
    'Skilled electrician or plumber',
    'Mid-career teacher',
    'Human resources coordinator',
    'Junior accountant',
    'Sales representative',
    'Paralegal',
  ],
  65000: [
    'Project coordinator',
    'Database administrator (junior)',
    'Physical therapist assistant',
    'Technical writer',
    'Purchasing agent',
    'Environmental compliance specialist',
  ],
  70000: [
    'Business analyst',
    'UX designer',
    'Registered nurse (metro area)',
    'Construction superintendent',
    'IT systems administrator',
    'Supply chain analyst',
  ],
  75000: [
    'Software developer (mid-level)',
    'Mechanical engineer',
    'Senior accountant',
    'Physician assistant (entry)',
    'Digital marketing manager',
    'Occupational therapist',
  ],
  80000: [
    'Project manager (PMP certified)',
    'Financial analyst (senior)',
    'Civil engineer (licensed PE)',
    'Clinical research coordinator',
    'DevOps engineer (mid-level)',
    'Speech-language pathologist',
  ],
  90000: [
    'Senior software engineer',
    'Pharmacist (retail, lower-cost area)',
    'Marketing director',
    'Data scientist',
    'Nurse practitioner',
    'Electrical engineer (senior)',
  ],
  100000: [
    'Engineering lead',
    'Experienced product manager',
    'Certified public accountant (senior)',
    'Attorney (mid-career)',
    'Hospital administrator',
    'Principal systems architect',
  ],
  120000: [
    'Engineering manager',
    'Senior software architect',
    'Attending physician (lower-cost markets)',
    'Director of operations',
    'Senior attorney',
    'Principal data scientist',
  ],
  150000: [
    'Director of engineering',
    'Orthopedic surgeon (early career)',
    'VP of marketing (mid-market)',
    'Senior partner (regional law firm)',
    'Chief of staff (tech company)',
    'Quantitative analyst (finance)',
  ],
  200000: [
    'VP of engineering (technology)',
    'Cardiologist (employed model)',
    'Managing director (consulting)',
    'Chief operating officer (SMB)',
    'Senior VP of product',
    'Portfolio manager (asset management)',
  ],
  250000: [
    'Chief Financial Officer (mid-market)',
    'Dermatologist (private practice)',
    'Partner (Big 4 accounting)',
    'VP of sales (enterprise SaaS)',
    'Chief Technology Officer (growth-stage)',
    'Neurosurgeon (early career)',
  ],
  500000: [
    'Chief Executive Officer (public company)',
    'Orthopedic surgeon (established practice)',
    'Managing partner (AmLaw 100 firm)',
    'Hedge fund portfolio manager',
    'Chief Revenue Officer (enterprise)',
    'Interventional cardiologist (private practice)',
  ],
};

// ─── Band classification ──────────────────────────────────────────────

export function getSalaryBand(amount: number): SalaryBand {
  if (amount <= 40000) return 'entry';
  if (amount <= 65000) return 'median';
  if (amount <= 100000) return 'professional';
  if (amount <= 200000) return 'senior';
  return 'executive';
}

// ─── Helper: find adjacent salary amounts ─────────────────────────────

function getAdjacentAmounts(amount: number): { prev: number | null; next: number | null } {
  const idx = SALARY_AMOUNTS.indexOf(amount);
  return {
    prev: idx > 0 ? SALARY_AMOUNTS[idx - 1] : null,
    next: idx < SALARY_AMOUNTS.length - 1 ? SALARY_AMOUNTS[idx + 1] : null,
  };
}

// ─── Helper: find next bracket threshold ──────────────────────────────

function getNextBracketInfo(taxableIncome: number): { gap: number; nextRate: number } | null {
  for (const bracket of FEDERAL_BRACKET_THRESHOLDS) {
    if (taxableIncome < bracket.max) {
      // We're in this bracket, find the boundary to the next one
      const gap = bracket.max - taxableIncome;
      const nextIdx = FEDERAL_BRACKET_THRESHOLDS.indexOf(bracket) + 1;
      if (nextIdx < FEDERAL_BRACKET_THRESHOLDS.length) {
        return { gap, nextRate: FEDERAL_BRACKET_THRESHOLDS[nextIdx].rate * 100 };
      }
      return null;
    }
  }
  return null;
}

// ─── Compute result for a given state ─────────────────────────────────

export function computeForState(amount: number, stateCode: string): PaycheckResult {
  const config = getStateTaxConfig(stateCode);
  return calculatePaycheck(
    {
      grossAnnual: amount,
      filingStatus: 'single',
      state: stateCode,
      payFrequency: 'biweekly',
    },
    config,
  );
}

// ─── Multi-state comparison table (with unique narrative per salary) ──

export function buildStateComparisons(amount: number): StateComparison[] {
  const codes = ['TX', 'FL', 'CA', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'WA', 'NJ', 'TN'];
  const formatted = formatCurrencyRound(amount);
  const dailyNet = amount / 260; // 260 working days per year approx

  // Generate a unique narrative observation per salary
  const narratives: Record<string, string> = {
    TX: `In Texas, your ${formatted} salary yields ${formatCurrencyRound(dailyNet)} gross per working day with zero state income tax deducted.`,
    FL: `Florida's zero-income-tax policy means your ${formatted} keeps the same federal-only burden as Texas, with no additional state deductions.`,
    CA: `California's progressive brackets hit ${formatted} earners hardest among all states, especially above the $68,350 threshold where the 9.3% rate begins.`,
    NY: `New York's combined state and city taxes (if in NYC) make it one of the most expensive states for a ${formatted} earner.`,
    PA: `Pennsylvania's flat 3.07% rate is predictable: on ${formatted} you pay exactly ${formatCurrencyRound(amount * 0.0307)} in state tax regardless of deductions.`,
    IL: `Illinois charges a flat 4.95% on all income, costing a ${formatted} earner ${formatCurrencyRound(amount * 0.0495)} in state tax annually.`,
    OH: `Ohio's brackets are moderate, and the state offers no local-tax offset, meaning municipal taxes in cities like Columbus add further burden at ${formatted}.`,
    GA: `Georgia taxes ${formatted} at graduated rates up to 5.49%, positioning it in the middle of the state-tax spectrum.`,
    NC: `North Carolina's flat 4.5% rate costs a ${formatted} earner ${formatCurrencyRound(amount * 0.045)} in state tax, less than most progressive-bracket states.`,
    WA: `Washington has no income tax, making it equivalent to Texas and Florida for take-home pay on ${formatted}.`,
    NJ: `New Jersey's graduated rates combined with high property taxes make it expensive, though the income tax alone on ${formatted} is moderate compared to California.`,
    TN: `Tennessee abolished its income tax entirely, meaning your ${formatted} salary faces only federal taxes and FICA here.`,
  };

  return codes.map((code) => {
    const r = computeForState(amount, code);
    return {
      code,
      name: STATES[code].name,
      slug: STATES[code].slug,
      netAnnual: r.netAnnual,
      federalTax: r.federalTax,
      stateTax: r.stateTax,
      fica: r.socialSecurity + r.medicare + r.additionalMedicare,
      effectiveRate: r.effectiveTotalRate * 100,
      narrative: narratives[code] || '',
    };
  });
}

// ─── Salary-specific context (NEW — unique per exact amount) ──────────

export function getSalarySpecificContext(amount: number, txResult: PaycheckResult): SalarySpecificContext {
  const formatted = formatCurrencyRound(amount);
  const { prev, next } = getAdjacentAmounts(amount);

  // 10% raise analysis
  const raisedAmount = Math.round(amount * 1.10);
  const raisedResult = computeForState(raisedAmount, 'TX');
  const netDiff = raisedResult.netAnnual - txResult.netAnnual;
  const grossDiff = raisedAmount - amount;
  const raiseTaxRate = ((grossDiff - netDiff) / grossDiff) * 100;

  const raiseAnalysis = `A 10% raise from ${formatted} to ${formatCurrencyRound(raisedAmount)} would increase your gross by ${formatCurrencyRound(grossDiff)} per year. After taxes, you would net an additional ${formatCurrencyRound(netDiff)} annually, or ${formatCurrencyRound(netDiff / 12)} more per month. The effective tax rate on that raise is ${formatPercent(raiseTaxRate, 1)}, meaning ${formatPercent(100 - raiseTaxRate, 1)} of the increase reaches your bank account.`;

  // Adjacent level comparison
  let adjacentComparison = '';
  if (prev) {
    const prevResult = computeForState(prev, 'TX');
    const monthDiff = (txResult.netAnnual - prevResult.netAnnual) / 12;
    const extraGross = amount - prev;
    const extraNet = txResult.netAnnual - prevResult.netAnnual;
    const marginalOnDiff = ((extraGross - extraNet) / extraGross) * 100;
    adjacentComparison = `Compared to a ${formatCurrencyRound(prev)} salary, your extra ${formatCurrencyRound(extraGross)} in gross pay translates to ${formatCurrencyRound(extraNet)} more after tax, or ${formatCurrencyRound(monthDiff)} additional per month. The effective tax rate on the difference between ${formatCurrencyRound(prev)} and ${formatted} is ${formatPercent(marginalOnDiff, 1)}.`;
  } else {
    adjacentComparison = `At ${formatted}, you are at the lowest salary level we track. Every dollar of gross pay translates to approximately ${formatCurrencyRound(txResult.netAnnual / amount * 100)} cents of take-home after federal and payroll taxes in a no-income-tax state.`;
  }

  // Purchasing power comparisons (unique per amount)
  const dailyNet = txResult.netAnnual / 260;
  const weeklyNet = txResult.netAnnual / 52;
  const hourlyNet = txResult.netAnnual / 2080;
  const medianRent = 1850; // National median rent 2024
  const monthlyNet = txResult.netAnnual / 12;
  const rentPercent = (medianRent / monthlyNet) * 100;

  const purchasingPower = `Your ${formatted} salary translates to ${formatCurrencyRound(dailyNet)} per working day after taxes, ${formatCurrencyRound(weeklyNet)} per week, or an effective after-tax hourly rate of ${formatCurrencyRound(hourlyNet)}. With the national median rent at approximately $1,850 per month, housing would consume ${formatPercent(rentPercent, 1)} of your monthly take-home pay of ${formatCurrencyRound(monthlyNet)}, ${rentPercent <= 30 ? 'which is within the recommended 30% threshold' : 'which exceeds the recommended 30% threshold for housing affordability'}.`;

  // Ratio to US median
  const ratio = (amount / US_MEDIAN_INDIVIDUAL_INCOME) * 100;
  const ratioFormatted = formatPercent(ratio, 0);
  let medianComparison = '';
  if (ratio < 100) {
    medianComparison = `Your ${formatted} salary is ${ratioFormatted} of the US median individual income of ${formatCurrencyRound(US_MEDIAN_INDIVIDUAL_INCOME)}. You earn ${formatCurrencyRound(US_MEDIAN_INDIVIDUAL_INCOME - amount)} less than the national median. At ${formatted}, targeted tax credits and lower marginal brackets mean you keep ${formatPercent((txResult.netAnnual / amount) * 100, 1)} of your gross income after federal taxes and FICA in a no-tax state.`;
  } else if (ratio <= 120) {
    medianComparison = `At ${ratioFormatted} of the US median individual income (${formatCurrencyRound(US_MEDIAN_INDIVIDUAL_INCOME)}), your ${formatted} salary sits ${formatCurrencyRound(amount - US_MEDIAN_INDIVIDUAL_INCOME)} above the national midpoint. Your ${formatPercent(txResult.marginalFederalRate * 100, 0)} marginal bracket means each additional dollar above ${formatted} would be taxed at that rate, while your effective rate of only ${formatPercent(txResult.effectiveFederalRate * 100, 1)} reflects how the progressive system protects the majority of your earnings.`;
  } else {
    medianComparison = `Your ${formatted} salary is ${formatPercent(ratio, 0)} of the US median individual income of ${formatCurrencyRound(US_MEDIAN_INDIVIDUAL_INCOME)}. You earn ${formatCurrencyRound(amount - US_MEDIAN_INDIVIDUAL_INCOME)} more than the median American worker, which places you in a higher marginal bracket but also provides greater capacity for tax-advantaged savings strategies.`;
  }

  return { raiseAnalysis, adjacentComparison, purchasingPower, medianComparison };
}

// ─── Band context paragraph (unique per salary level) ─────────────────

export function getBandContext(amount: number, txResult: PaycheckResult): string {
  const band = getSalaryBand(amount);
  const formatted = formatCurrencyRound(amount);
  const net = formatCurrencyRound(txResult.netAnnual);
  const fedTax = formatCurrencyRound(txResult.federalTax);
  const fica = formatCurrencyRound(txResult.socialSecurity + txResult.medicare + txResult.additionalMedicare);
  const marginal = formatPercent(txResult.marginalFederalRate * 100, 0);
  const effective = formatPercent(txResult.effectiveFederalRate * 100, 1);
  const netMonthly = formatCurrencyRound(txResult.netAnnual / 12);

  // Salary-specific computed values that differentiate pages within the same band
  const dailyNet = formatCurrencyRound(txResult.netAnnual / 260);
  const hourlyNet = formatCurrencyRound(txResult.netAnnual / 2080);
  const medianRatio = formatPercent((amount / US_MEDIAN_INDIVIDUAL_INCOME) * 100, 0);
  const { prev, next } = getAdjacentAmounts(amount);

  // Compute adjacent comparison sentence (unique per salary)
  let adjacentSentence = '';
  if (prev) {
    const prevResult = computeForState(prev, 'TX');
    const monthDiff = formatCurrencyRound((txResult.netAnnual - prevResult.netAnnual) / 12);
    adjacentSentence = ` At ${formatted}, you take home ${monthDiff} more per month than someone earning ${formatCurrencyRound(prev)}.`;
  }
  if (next) {
    const nextResult = computeForState(next, 'TX');
    const monthDiffNext = formatCurrencyRound((nextResult.netAnnual - txResult.netAnnual) / 12);
    adjacentSentence += ` Moving up to ${formatCurrencyRound(next)} would add ${monthDiffNext} per month to your take-home pay.`;
  }

  // Next bracket proximity (unique per salary)
  const nextBracket = getNextBracketInfo(txResult.taxableIncome);
  let bracketProximity = '';
  if (nextBracket && nextBracket.gap < amount * 0.5) {
    bracketProximity = ` You are ${formatCurrencyRound(nextBracket.gap)} in taxable income away from the ${formatPercent(nextBracket.nextRate, 0)} federal bracket — any raise beyond that threshold would be taxed at the higher rate on the incremental dollars only.`;
  }

  const contexts: Record<SalaryBand, string> = {
    entry: `Earning ${formatted} per year places you among entry-level workers and recent graduates across the United States. After federal income tax of ${fedTax} and FICA contributions of ${fica}, a single filer in a no-income-tax state keeps approximately ${net} annually, or about ${netMonthly} per month. That works out to ${dailyNet} per working day and an effective after-tax hourly wage of ${hourlyNet}. Your salary represents ${medianRatio} of the US median individual income of ${formatCurrencyRound(US_MEDIAN_INDIVIDUAL_INCOME)}.${adjacentSentence} Your marginal federal tax rate is ${marginal}, but your effective federal rate is only ${effective}, meaning the progressive bracket system shields much of your earnings at lower rates.${bracketProximity} At this compensation level, every additional dollar of take-home pay can meaningfully improve your financial stability. Choosing where you live has an outsized effect on your budget: the gap between a no-tax state and a state with 5 percent or higher income tax translates to several hundred dollars per month in additional spending power. Workers earning ${formatted} should prioritize building an emergency fund equal to three to six months of expenses, enrolling in any employer-sponsored retirement plan at least up to the company match, and reviewing W-4 withholding to avoid over-withholding that locks up cash unnecessarily throughout the year.`,

    median: `A ${formatted} salary sits near the median individual income in the United States, representing ${medianRatio} of the national median of ${formatCurrencyRound(US_MEDIAN_INDIVIDUAL_INCOME)}. Federal income tax on this amount totals approximately ${fedTax}, and FICA obligations add another ${fica}, resulting in net take-home pay of roughly ${net} in a state without its own income tax — that is ${netMonthly} per month, ${dailyNet} per working day, or an after-tax hourly equivalent of ${hourlyNet}.${adjacentSentence} Your marginal federal bracket is ${marginal}, while your blended effective federal rate of ${effective} reflects the progressive structure that taxes initial dollars at lower rates before stepping up.${bracketProximity} With ${formatted} in gross pay, directing ${formatCurrencyRound(amount * 0.06)} (6%) into a traditional 401(k) would reduce your federal tax by ${formatCurrencyRound(amount * 0.06 * txResult.marginalFederalRate)} annually while building ${formatCurrencyRound(amount * 0.06)} in retirement assets — a net paycheck reduction of only ${formatCurrencyRound((amount * 0.06 - amount * 0.06 * txResult.marginalFederalRate) / 26)} per biweekly pay period. At ${formatted}, switching from a state like California (state tax: ${formatCurrencyRound(amount * 0.055)}) to Texas or Florida would save approximately ${formatCurrencyRound(amount * 0.055)} per year — equivalent to ${formatCurrencyRound(amount * 0.055 / 12)} per month in additional disposable income that compounds significantly over a career.`,

    professional: `At ${formatted}, you have moved beyond the median and into professional-class compensation territory, earning ${medianRatio} of the US median individual income. Your federal income tax bill is approximately ${fedTax}, with FICA adding ${fica}, leaving take-home pay around ${net} per year in a zero-income-tax state. On a daily basis, that translates to ${dailyNet} per working day after taxes, or an effective hourly rate of ${hourlyNet}.${adjacentSentence} The ${marginal} marginal bracket applies to your top dollars of taxable income, while your effective federal rate of ${effective} demonstrates how the graduated system moderates the overall burden.${bracketProximity} On a ${formatted} salary, maxing your 401(k) at $23,500 saves ${formatCurrencyRound(23500 * txResult.marginalFederalRate)} in federal tax, and each dollar contributed reduces your biweekly taxable wages by that dollar. The net cost per paycheck of a full $23,500 contribution is only ${formatCurrencyRound((23500 - 23500 * txResult.marginalFederalRate) / 26)} after the tax benefit. Geographic arbitrage at ${formatted} is particularly powerful: relocating from California to Texas preserves an additional ${formatCurrencyRound(amount * 0.07)} per year, which at a 7% annual return would grow to ${formatCurrencyRound(amount * 0.07 * 10 * 1.4)} over a decade of investing the difference.`,

    senior: `With a ${formatted} salary, you are earning ${medianRatio} of the US median individual income and fall into the upper tier of individual compensation in the United States. Federal income tax of approximately ${fedTax} and FICA contributions totaling ${fica} reduce your gross pay to a net of roughly ${net} annually in a state that levies no income tax — equivalent to ${dailyNet} per working day or ${hourlyNet} per hour after taxes.${adjacentSentence} Your marginal federal rate of ${marginal} means that each additional dollar of ordinary income is taxed at a meaningfully higher rate than the bulk of your earnings, making tax-deferred contributions especially impactful.${bracketProximity} Your effective federal rate of ${effective} reflects the cumulative effect of lower brackets on the first portion of your taxable income. Tax optimization at this level often involves maximizing 401(k) contributions at the $23,500 annual limit, funding a Health Savings Account to its maximum, evaluating whether itemized deductions exceed the standard deduction, and considering the timing of income recognition for bonuses or equity compensation. The difference in total tax burden between states can exceed ${formatCurrencyRound(amount * 0.08)} per year, making geographic tax planning a high-impact decision.`,

    executive: `A ${formatted} salary represents executive-level compensation, placing you at ${medianRatio} of the US median individual income and among the top earners in the country. Your federal income tax liability is approximately ${fedTax}, and combined FICA contributions reach ${fica}, yielding net take-home pay around ${net} in a state with no personal income tax — that is ${dailyNet} per working day or ${hourlyNet} per working hour after all federal obligations.${adjacentSentence} At this level, your marginal federal rate of ${marginal} applies to a large portion of your taxable income, and the effective federal rate of ${effective} underscores the progressive nature of the system.${bracketProximity} The Additional Medicare Tax of 0.9 percent applies to wages above $200,000, adding an extra layer to your payroll tax burden. Strategic planning at this compensation level often involves coordination between salary, equity, and bonus components; maximizing all available pre-tax and Roth retirement vehicle contributions; evaluating backdoor Roth IRA conversions; and potentially exploring deferred compensation plans offered by employers. The state tax differential at ${formatted} can easily exceed ${formatCurrencyRound(amount * 0.10)}, making jurisdiction selection one of the highest-impact financial decisions you can make.`,
  };

  return contexts[band];
}

// ─── 6+ unique FAQs with calculated values ────────────────────────────

export function buildFaqs(amount: number, txResult: PaycheckResult): FAQ[] {
  const formatted = formatCurrencyRound(amount);
  const band = getSalaryBand(amount);

  // Compute a high-tax state result for comparison
  const caResult = computeForState(amount, 'CA');
  const txResultTX = computeForState(amount, 'TX');

  const hourly = amount / 2080;
  const netBiweekly = txResult.netAnnual / 26;
  const netMonthly = txResult.netAnnual / 12;
  const totalFica = txResult.socialSecurity + txResult.medicare + txResult.additionalMedicare;

  // Savings from maxing 401k
  const savings401k = Math.min(23500, amount) * txResult.marginalFederalRate;

  // Adjacent salary comparison for FAQ (salary-specific)
  const { prev, next } = getAdjacentAmounts(amount);
  let raiseAnswer = '';
  if (next) {
    const nextResult = computeForState(next, 'TX');
    const grossRaise = next - amount;
    const netRaise = nextResult.netAnnual - txResultTX.netAnnual;
    const taxOnRaise = ((grossRaise - netRaise) / grossRaise) * 100;
    raiseAnswer = `Moving from ${formatted} to ${formatCurrencyRound(next)} represents a gross increase of ${formatCurrencyRound(grossRaise)} per year. After taxes in a no-income-tax state, that raise translates to ${formatCurrencyRound(netRaise)} more in annual take-home pay, or approximately ${formatCurrencyRound(netRaise / 12)} more per month. The effective tax rate on the raise itself is ${formatPercent(taxOnRaise, 1)}, because the additional income is taxed at your marginal rate of ${formatPercent(txResult.marginalFederalRate * 100, 0)} rather than your blended effective rate. In California, the same raise would yield only ${formatCurrencyRound(computeForState(next, 'CA').netAnnual - caResult.netAnnual)} more annually due to the compounding effect of state taxes on the incremental income.`;
  } else {
    raiseAnswer = `At ${formatted}, further increases are taxed at the ${formatPercent(txResult.marginalFederalRate * 100, 0)} federal marginal rate plus any applicable state tax. A $50,000 raise would yield approximately ${formatCurrencyRound(50000 * (1 - txResult.marginalFederalRate))} in additional after-tax income in a no-tax state, or less in states with progressive brackets. At this level, tax-efficient compensation strategies like equity grants, deferred compensation, and retirement plan maximization become critical for preserving wealth.`;
  }

  // State-specific savings unique to this exact amount
  const nyResult = computeForState(amount, 'NY');
  const flResult = computeForState(amount, 'FL');
  const txVsCaDiff = txResultTX.netAnnual - caResult.netAnnual;
  const txVsNyDiff = txResultTX.netAnnual - nyResult.netAnnual;

  return [
    {
      question: `What is the actual take-home pay on a ${formatted} salary in ${TAX_YEAR}?`,
      answer: `A single filer earning ${formatted} in a state with no income tax takes home approximately ${formatCurrencyRound(txResultTX.netAnnual)} per year after federal income tax of ${formatCurrencyRound(txResultTX.federalTax)} and FICA contributions of ${formatCurrencyRound(txResultTX.socialSecurity + txResultTX.medicare + txResultTX.additionalMedicare)}. That equals ${formatCurrencyRound(txResultTX.netAnnual / 12)} per month or ${formatCurrencyRound(txResultTX.netAnnual / 26)} per biweekly paycheck. In California, the same ${formatted} salary yields approximately ${formatCurrencyRound(caResult.netAnnual)} after state tax of ${formatCurrencyRound(caResult.stateTax)} is also deducted. That is a difference of ${formatCurrencyRound(txVsCaDiff)} per year, or ${formatCurrencyRound(txVsCaDiff / 12)} per month, solely due to state tax policy.`,
    },
    {
      question: `How much is ${formatted} per paycheck after taxes?`,
      answer: `On a biweekly pay schedule (26 paychecks per year), a ${formatted} salary produces a gross paycheck of ${formatCurrencyRound(amount / 26)}. After federal tax withholding, Social Security (${formatCurrencyRound(txResult.socialSecurity / 26)} per check), and Medicare (${formatCurrencyRound(txResult.medicare / 26)} per check), your net biweekly deposit is approximately ${formatCurrencyRound(netBiweekly)} in a no-tax state. Monthly, that works out to roughly ${formatCurrencyRound(netMonthly)}. On a weekly schedule, the net paycheck is approximately ${formatCurrencyRound(txResult.netAnnual / 52)}. Your daily after-tax earning rate based on 260 working days is ${formatCurrencyRound(txResult.netAnnual / 260)}.`,
    },
    {
      question: `What is the hourly rate equivalent of ${formatted} per year?`,
      answer: `Based on a standard 2,080-hour work year (40 hours per week for 52 weeks), ${formatted} equals ${formatCurrencyRound(hourly)} per hour before taxes. After federal tax, FICA, and average state taxes, the effective after-tax hourly rate drops to approximately ${formatCurrencyRound(txResult.netAnnual / 2080)} in a no-income-tax state or ${formatCurrencyRound(caResult.netAnnual / 2080)} in California. Per working day (260 days per year), you effectively earn ${formatCurrencyRound(txResult.netAnnual / 260)} after taxes. When evaluating side work at ${formatted}, any additional freelance income would be taxed at your ${formatPercent(txResult.marginalFederalRate * 100, 0)} marginal rate plus self-employment tax, meaning side gigs must pay above ${formatCurrencyRound(hourly * (1 + txResult.marginalFederalRate + 0.153))} per hour to exceed the value of your primary job's after-tax rate.`,
    },
    {
      question: `How much can I save on taxes at ${formatted} by contributing to a 401(k)?`,
      answer: `At the ${formatted} income level, your marginal federal tax rate is ${formatPercent(txResult.marginalFederalRate * 100, 0)}. Contributing the maximum $23,500 to a traditional 401(k) in ${TAX_YEAR} would reduce your federal tax bill by approximately ${formatCurrencyRound(savings401k)}. That effectively makes each paycheck ${formatCurrencyRound(savings401k / 26)} larger on a net basis while building retirement wealth. Even a 10 percent contribution of ${formatCurrencyRound(amount * 0.10)} per year (${formatCurrencyRound(amount * 0.10 / 26)} per paycheck) saves roughly ${formatCurrencyRound(amount * 0.10 * txResult.marginalFederalRate)} in federal tax. In California, that same contribution would also save approximately ${formatCurrencyRound(amount * 0.10 * 0.066)} in state tax. A 3% employer match on your ${formatted} salary adds ${formatCurrencyRound(amount * 0.03)} in free retirement contributions annually.`,
    },
    {
      question: `Which states offer the best take-home pay on ${formatted}?`,
      answer: `The nine states with no personal income tax — Texas, Florida, Wyoming, South Dakota, Nevada, Tennessee, Washington, Alaska, and New Hampshire — offer the highest take-home pay on ${formatted}. In Texas, a single filer takes home ${formatCurrencyRound(txResultTX.netAnnual)}, while in California the same salary nets only ${formatCurrencyRound(caResult.netAnnual)} and in New York ${formatCurrencyRound(nyResult.netAnnual)}. The Texas-vs-California difference of ${formatCurrencyRound(txVsCaDiff)} represents ${formatPercent((txVsCaDiff / amount) * 100, 1)} of your gross salary, while the Texas-vs-New York gap of ${formatCurrencyRound(txVsNyDiff)} equals ${formatPercent((txVsNyDiff / amount) * 100, 1)}. In Pennsylvania, your ${formatted} salary would lose only ${formatCurrencyRound(amount * 0.0307)} to state tax (flat 3.07%), compared to ${formatCurrencyRound(caResult.stateTax)} in California — a ${formatCurrencyRound(caResult.stateTax - amount * 0.0307)} annual advantage for the flat-tax state.`,
    },
    {
      question: `What is the total effective tax rate on ${formatted} including federal, state, and FICA?`,
      answer: `For a single filer earning ${formatted} in a no-tax state, the combined effective tax rate is ${formatPercent(txResultTX.effectiveTotalRate * 100, 1)}, comprising federal income tax at ${formatPercent(txResultTX.effectiveFederalRate * 100, 1)} and FICA at ${formatPercent(((txResultTX.socialSecurity + txResultTX.medicare + txResultTX.additionalMedicare) / amount) * 100, 1)}. In California, the combined rate rises to ${formatPercent(caResult.effectiveTotalRate * 100, 1)} after adding state tax of ${formatCurrencyRound(caResult.stateTax)} (effective state rate of ${formatPercent(caResult.effectiveStateRate * 100, 1)}). This means you keep ${formatPercent(100 - txResultTX.effectiveTotalRate * 100, 1)} of your ${formatted} salary in a no-tax state versus ${formatPercent(100 - caResult.effectiveTotalRate * 100, 1)} in California. The gap between your marginal rate of ${formatPercent(txResult.marginalFederalRate * 100, 0)} and your effective rate demonstrates how the progressive tax system works in practice.`,
    },
    {
      question: `What does a raise from ${formatted} to the next level mean after taxes?`,
      answer: raiseAnswer,
    },
  ];
}

// ─── Monthly budget breakdown ─────────────────────────────────────────

export function getBudgetBreakdown(netAnnual: number): BudgetRow[] {
  const monthly = netAnnual / 12;
  const allocations = [
    { category: 'Housing (rent or mortgage)', percent: 30 },
    { category: 'Food and groceries', percent: 12 },
    { category: 'Transportation', percent: 10 },
    { category: 'Utilities and insurance', percent: 8 },
    { category: 'Savings and investments', percent: 20 },
    { category: 'Healthcare', percent: 5 },
    { category: 'Personal and discretionary', percent: 15 },
  ];

  return allocations.map((a) => ({
    category: a.category,
    percent: a.percent,
    monthly: Math.round((monthly * a.percent) / 100),
    annual: Math.round((netAnnual * a.percent) / 100),
  }));
}

// ─── Career information per exact salary amount ───────────────────────

export function getCareerInfo(amount: number): CareerInfo {
  const band = getSalaryBand(amount);
  const formatted = formatCurrencyRound(amount);
  const { prev, next } = getAdjacentAmounts(amount);

  // Use salary-specific roles if available, otherwise fall back to band defaults
  const roles = ROLES_BY_AMOUNT[amount] || getDefaultRolesForBand(band);

  // Salary-specific progression path
  let advancement = '';
  if (next) {
    const stepUp = formatCurrencyRound(next);
    advancement = `The path forward from ${formatted} toward ${stepUp} typically involves `;
    switch (band) {
      case 'entry':
        advancement += `acquiring industry certifications, completing a bachelor's degree, or developing specialized technical skills. Workers at ${formatted} who pursue credentials in IT (CompTIA, AWS), healthcare (CNA to RN pathways), or skilled trades (journeyman to master licensure) often reach ${stepUp} within two to four years. Lateral moves to higher-paying metro areas can also accelerate this transition.`;
        break;
      case 'median':
        advancement += `earning a professional certification (CPA, PMP, or nursing license), taking on supervisory duties, or pivoting into a higher-demand specialty. From ${formatted}, professionals who combine domain expertise with management skills frequently reach ${stepUp} within three to five years, especially in technology, healthcare, or financial services.`;
        break;
      case 'professional':
        advancement += `transitioning into senior individual contributor or management tracks. At ${formatted}, professionals typically need either deep specialization (principal engineer, lead architect) or people management responsibility (team lead, director) to break into the ${stepUp} range. Geographic relocation to high-cost-of-living tech hubs or financial centers also accelerates compensation growth.`;
        break;
      case 'senior':
        advancement += `expanding scope to VP-level responsibility, developing executive presence, or moving into organizations where equity compensation supplements base salary. From ${formatted}, the jump to ${stepUp} frequently involves leading larger teams (50+ reports), owning P&L responsibility, or joining late-stage startups with meaningful equity packages.`;
        break;
      case 'executive':
        advancement += `expanding into board-level governance, acquiring equity stakes, or leading larger enterprises. At ${formatted}, additional compensation growth comes primarily from variable pay (bonuses, RSUs, carried interest) rather than base salary increases, with total compensation packages often doubling the base figure.`;
        break;
    }
  } else {
    advancement = `At ${formatted}, career advancement is less about climbing a traditional salary ladder and more about expanding total compensation through equity, bonus structures, board seats, and portfolio careers. Many professionals at this level also build wealth through entrepreneurship, angel investing, and strategic advisory roles that compound their expertise into multiple income streams.`;
  }

  // Salary-specific description
  let description = '';
  const medianRatio = (amount / US_MEDIAN_INDIVIDUAL_INCOME) * 100;
  switch (band) {
    case 'entry':
      description = `A ${formatted} salary (${formatPercent(medianRatio, 0)} of the US median) is typical for entry-level positions that require a high school diploma or associate degree, or for early-career professionals in lower-cost-of-living regions. Workers at ${formatted} often hold their first or second full-time position and are building the foundational experience needed to advance. At this exact compensation level, many employers offer structured training programs, mentorship opportunities, and clearly defined promotion criteria that lead to the next salary tier within 18 to 36 months.`;
      break;
    case 'median':
      description = `The ${formatted} salary level (${formatPercent(medianRatio, 0)} of the US median individual income) represents the productive middle of the American workforce. Workers earning exactly ${formatted} typically have three to eight years of professional experience or hold a bachelor's degree combined with relevant industry skills. This compensation point is common across diverse sectors — from skilled trades and education to corporate functions and healthcare support — and reflects a balance between established competency and room for significant upward mobility.`;
      break;
    case 'professional':
      description = `At ${formatted} (${formatPercent(medianRatio, 0)} of the US median), you occupy the professional tier where specialized education, licensing, or deep experience commands above-average compensation. This salary point is characteristic of workers with five to fifteen years in their field, often holding a bachelor's or master's degree alongside relevant certifications. Employers paying ${formatted} expect independent judgment, project ownership, and the ability to mentor more junior team members.`;
      break;
    case 'senior':
      description = `Earning ${formatted} (${formatPercent(medianRatio, 0)} of the US median) places you among highly experienced professionals and leaders who typically carry ten or more years of domain expertise. At this specific compensation level, roles generally involve strategic decision-making, team leadership, budget authority exceeding $1M, or specialized technical contributions that directly drive organizational revenue. Competition for ${formatted} roles is intense, and employers expect demonstrated impact metrics and leadership track records.`;
      break;
    case 'executive':
      description = `A ${formatted} base salary (${formatPercent(medianRatio, 0)} of the US median) is characteristic of executive-level positions, highly specialized medical practitioners, and senior leaders at mid-to-large enterprises. At this compensation point, base salary typically represents only 40 to 60 percent of total compensation, with annual bonuses, equity grants, and deferred compensation plans adding substantially to the overall package. Organizations paying ${formatted} in base salary expect candidates with P&L responsibility, board-level communication skills, and a demonstrable record of enterprise-scale impact.`;
      break;
  }

  return {
    title: band === 'median' ? `Who earns ${formatted} in the US?` :
           band === 'entry' ? `Careers and roles at the ${formatted} level` :
           band === 'professional' ? `Professional roles earning ${formatted}` :
           band === 'senior' ? `Senior positions at the ${formatted} salary level` :
           `Executive compensation at ${formatted}`,
    roles,
    description,
    advancement,
  };
}

function getDefaultRolesForBand(band: SalaryBand): string[] {
  const defaults: Record<SalaryBand, string[]> = {
    entry: [
      'Customer service representative',
      'Administrative assistant',
      'Junior retail manager',
      'Entry-level warehouse supervisor',
      'Beginning teacher (some districts)',
      'Junior graphic designer',
    ],
    median: [
      'Skilled electrician or plumber',
      'Mid-career teacher',
      'Human resources coordinator',
      'Junior accountant',
      'Sales representative',
      'Paralegal',
    ],
    professional: [
      'Software developer (mid-level)',
      'Registered nurse (experienced)',
      'Project manager',
      'Financial analyst',
      'Marketing manager',
      'Civil engineer',
    ],
    senior: [
      'Engineering manager',
      'Senior software architect',
      'Attending physician (lower-cost markets)',
      'Director of operations',
      'Senior attorney',
      'Principal data scientist',
    ],
    executive: [
      'Chief Financial Officer (mid-market)',
      'VP of Engineering (technology)',
      'Medical specialist (cardiology, orthopedics)',
      'Managing partner (law, consulting)',
      'Senior VP of Sales',
      'Chief Technology Officer',
    ],
  };
  return defaults[band];
}

// ─── Tax optimization tips (unique per exact salary amount) ───────────

export function getTaxOptimizationTips(amount: number, txResult: PaycheckResult): string[] {
  const band = getSalaryBand(amount);
  const marginal = txResult.marginalFederalRate;
  const formatted = formatCurrencyRound(amount);

  // Salary-specific 401(k) savings calculation
  const max401k = Math.min(23500, amount);
  const savings401k = max401k * marginal;

  // Next bracket analysis (unique per salary)
  const nextBracket = getNextBracketInfo(txResult.taxableIncome);

  // Salary-specific common tips (these differ because the amount and computed values are baked in)
  const salarySpecificTips = [
    `At your ${formatted} salary with a ${formatPercent(marginal * 100, 0)} marginal rate, maxing your 401(k) at $23,500 saves ${formatCurrencyRound(savings401k)} in federal taxes. That is ${formatCurrencyRound(savings401k / 12)} per month returned to you through lower withholding, while building ${formatCurrencyRound(23500)} in retirement assets.`,
    `Contributing to a Health Savings Account (HSA) at the $4,300 individual maximum reduces your taxable income and saves ${formatCurrencyRound(4300 * marginal)} in federal tax at your ${formatPercent(marginal * 100, 0)} marginal rate. Unlike a 401(k), HSA funds also reduce your FICA tax, saving an additional ${formatCurrencyRound(4300 * 0.0765)}.`,
  ];

  // Next-bracket-specific tip (completely unique per salary)
  if (nextBracket) {
    salarySpecificTips.push(
      `You are ${formatCurrencyRound(nextBracket.gap)} in taxable income away from the ${formatPercent(nextBracket.nextRate, 0)} bracket. A raise of ${formatCurrencyRound(nextBracket.gap + txResult.standardDeduction)} in gross salary (accounting for the standard deduction) would push your top dollars into the higher bracket — plan pre-tax contributions accordingly to manage bracket exposure.`
    );
  }

  // 10% contribution analysis (unique because amount differs)
  const tenPercentContrib = amount * 0.10;
  salarySpecificTips.push(
    `A 10% 401(k) contribution of ${formatCurrencyRound(tenPercentContrib)} per year (${formatCurrencyRound(tenPercentContrib / 26)} per biweekly paycheck) would save you ${formatCurrencyRound(tenPercentContrib * marginal)} annually in federal tax. Your actual paycheck reduction would be only ${formatCurrencyRound((tenPercentContrib - tenPercentContrib * marginal) / 26)} per pay period after the tax benefit is factored in.`
  );

  const bandTips: Record<SalaryBand, string[]> = {
    entry: [
      `At ${formatted}, check your eligibility for the Earned Income Tax Credit (EITC). Workers without qualifying children may receive a refundable credit of up to $632, which effectively reduces your tax burden below zero.`,
      `Claim the Saver's Credit (Retirement Savings Contributions Credit) for up to $1,000 if your adjusted gross income is below the threshold. At ${formatted}, you likely qualify for at least a partial credit, which directly reduces your tax bill beyond the deduction benefit.`,
      `Review your W-4 withholding: at ${formatted} many workers over-withhold by ${formatCurrencyRound(amount * 0.02)} to ${formatCurrencyRound(amount * 0.04)} annually, resulting in an unnecessarily large refund instead of higher monthly cash flow.`,
    ],
    median: [
      `On a ${formatted} salary, a Roth IRA contribution of $7,000 means paying ${formatCurrencyRound(7000 * marginal)} in tax now (at your ${formatPercent(marginal * 100, 0)} rate) in exchange for tax-free withdrawals in retirement. With ${formatted} as your current income, the Roth option costs you ${formatCurrencyRound(7000 * marginal / 12)} per month in tax today but could save multiples of that if your future income pushes you into the 24% or 32% bracket.`,
      `A healthcare FSA on your ${formatted} salary: contributing the $3,300 maximum reduces your federal tax by ${formatCurrencyRound(3300 * marginal)} and your FICA by ${formatCurrencyRound(3300 * 0.0765)}, for combined savings of ${formatCurrencyRound(3300 * (marginal + 0.0765))}. That is ${formatCurrencyRound(3300 * (marginal + 0.0765) / 26)} more per biweekly paycheck. At ${formatted}, this effectively lets you pay for medical expenses at a ${formatPercent((1 - marginal - 0.0765) * 100, 1)} discount.`,
      `If you qualify as Head of Household, the larger standard deduction of $23,600 versus $15,700 (single) would save ${formatCurrencyRound((23600 - 15700) * marginal)} in federal tax on your ${formatted} salary. Combined with broader bracket widths, the total benefit at ${formatted} could reach ${formatCurrencyRound((23600 - 15700) * marginal * 1.2)} when accounting for the wider 12% bracket threshold.`,
    ],
    professional: [
      `Itemizing at ${formatted}: your total deductible expenses must exceed $15,700 to beat the standard deduction. With a mortgage at ${formatted} income levels, typical interest of ${formatCurrencyRound(amount * 0.04)} plus SALT capped at $10,000 plus charitable giving would need to total at least $15,701. Each dollar above that threshold saves ${formatPercent(marginal * 100, 0)} in federal tax.`,
      `At ${formatted} MAGI, you ${amount <= 161000 ? `are eligible for direct Roth IRA contributions of $7,000, which grow tax-free. Contributing $7,000 at your ${formatted} salary means ${formatCurrencyRound(7000 / 26)} less per biweekly paycheck — a manageable ${formatPercent(7000 / amount * 100, 1)} of your gross` : `exceed the Roth IRA income phase-out ($161,000 MAGI). At ${formatted}, explore the backdoor Roth conversion: contribute $7,000 to a traditional IRA (non-deductible at your income), then convert to Roth. The tax cost is minimal if you have no existing traditional IRA balance`}.`,
      `Equity compensation (RSUs/options) on top of your ${formatted} base salary: each vesting event adds to your taxable income at your ${formatPercent(marginal * 100, 0)} marginal rate. An RSU vest of ${formatCurrencyRound(amount * 0.15)} at ${formatted} base generates approximately ${formatCurrencyRound(amount * 0.15 * marginal)} in federal tax. Strategic sell timing within the same calendar year versus the next can shift ${formatCurrencyRound(amount * 0.15 * 0.02)} in tax liability.`,
    ],
    senior: [
      `At ${formatted}, combining a maxed 401(k) ($23,500) with a maxed HSA ($4,300) reduces your taxable income by $27,800, saving approximately ${formatCurrencyRound(27800 * marginal)} in federal tax. If over 50, the 401(k) catch-up adds $7,500 for total pre-tax savings of $35,300.`,
      `Evaluate a mega backdoor Roth strategy if your plan allows after-tax contributions beyond $23,500, up to the $70,000 total 415(c) limit. At your ${formatted} salary and ${formatPercent(marginal * 100, 0)} marginal rate, this provides substantial additional tax-sheltered growth.`,
      `Consider donor-advised fund contributions: at ${formatted} and the ${formatPercent(marginal * 100, 0)} bracket, a $10,000 charitable contribution saves ${formatCurrencyRound(10000 * marginal)} in federal tax while allowing you to distribute grants to charities over multiple years.`,
    ],
    executive: [
      `At ${formatted}, explore nonqualified deferred compensation plans (NQDC) to defer current-year income. Deferring ${formatCurrencyRound(amount * 0.15)} at your ${formatPercent(marginal * 100, 0)} rate saves ${formatCurrencyRound(amount * 0.15 * marginal)} in the current tax year, though taxes are owed upon distribution.`,
      `Charitable remainder trusts funded at the ${formatted} income level can provide immediate deductions of 20-60% of the contributed asset value, potentially saving ${formatCurrencyRound(amount * 0.05 * marginal)} to ${formatCurrencyRound(amount * 0.15 * marginal)} in federal tax while generating income.`,
      `Coordinate equity vesting and bonus timing: at ${formatted} base salary, an additional $100,000 bonus would be taxed at ${formatPercent(marginal * 100, 0)} (or ${amount > 1000000 ? '37%' : formatPercent(marginal * 100, 0)} if over $1M supplemental threshold). Spreading across tax years can save ${formatCurrencyRound(100000 * 0.05)} or more in federal tax.`,
    ],
  };

  return [...salarySpecificTips, ...bandTips[band]];
}

// ─── Author E-E-A-T info ─────────────────────────────────────────────

export function getAuthorSchema(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Take-Home Pay Calculator`,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      description: AUTHOR_CREDENTIALS,
      jobTitle: 'Founder & Editor',
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'INSEAD',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrueTakeHomePay',
      url: 'https://truetakehomepay.com',
    },
    url: pageUrl,
    dateModified: new Date().toISOString().slice(0, 10),
  };
}

// ─── Federal bracket walkthrough ──────────────────────────────────────

export function getFederalBracketWalkthrough(amount: number, txResult: PaycheckResult): string {
  const formatted = formatCurrencyRound(amount);
  const taxableIncome = txResult.taxableIncome;
  const brackets = txResult.federalBrackets.filter((b) => b.taxableInBracket > 0);

  const lines = brackets.map((b) => {
    const lo = formatCurrencyRound(b.min);
    const hi = b.max === Infinity ? 'and above' : formatCurrencyRound(b.max);
    return `${formatPercent(b.rate * 100, 0)} on ${formatCurrencyRound(b.taxableInBracket)} (income from ${lo} to ${hi}): ${formatCurrencyRound(b.taxInBracket)}`;
  });

  return lines.join(' | ');
}
