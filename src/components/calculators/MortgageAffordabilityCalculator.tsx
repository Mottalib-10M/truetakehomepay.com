import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

const LOAN_TERM_OPTIONS = [
  { value: '30', label: '30 years' },
  { value: '20', label: '20 years' },
  { value: '15', label: '15 years' },
];

interface AffordabilityResult {
  rule28MaxHousing: number;
  rule36MaxHousing: number;
  bindingRule: '28%' | '36%';
  maxMonthlyHousing: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  maxPrincipalAndInterest: number;
  maxLoanAmount: number;
  maxHomePrice: number;
  frontEndDTI: number;
  backEndDTI: number;
  conservativePrice: number;
  standardPrice: number;
  aggressivePrice: number;
}

export default function MortgageAffordabilityCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [income, setIncome] = useState('100000');
  const [debts, setDebts] = useState('500');
  const [down, setDown] = useState('60000');
  const [rate, setRate] = useState('6.5');
  const [term, setTerm] = useState('30');
  const [ptax, setPtax] = useState('1.1');
  const [insurance, setInsurance] = useState('1500');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('income')) setIncome(params.get('income')!);
    if (params.get('debts')) setDebts(params.get('debts')!);
    if (params.get('down')) setDown(params.get('down')!);
    if (params.get('rate')) setRate(params.get('rate')!);
    if (params.get('term')) setTerm(params.get('term')!);
    if (params.get('ptax')) setPtax(params.get('ptax')!);
    if (params.get('insurance')) setInsurance(params.get('insurance')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (income && income !== '100000') params.set('income', income);
    if (debts && debts !== '500') params.set('debts', debts);
    if (down && down !== '60000') params.set('down', down);
    if (rate && rate !== '6.5') params.set('rate', rate);
    if (term !== '30') params.set('term', term);
    if (ptax && ptax !== '1.1') params.set('ptax', ptax);
    if (insurance && insurance !== '1500') params.set('insurance', insurance);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [income, debts, down, rate, term, ptax, insurance]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<AffordabilityResult | null>(() => {
    const annualIncome = Number(income.replace(/[^0-9.]/g, ''));
    const monthlyDebts = Number(debts.replace(/[^0-9.]/g, ''));
    const downPayment = Number(down.replace(/[^0-9.]/g, ''));
    const interestRate = Number(rate.replace(/[^0-9.]/g, ''));
    const loanYears = Number(term);
    const propertyTaxRate = Number(ptax.replace(/[^0-9.]/g, ''));
    const annualInsurance = Number(insurance.replace(/[^0-9.]/g, ''));

    if (isNaN(annualIncome) || annualIncome <= 0) return null;
    if (isNaN(interestRate)) return null;

    const grossMonthly = annualIncome / 12;

    // 28% rule: max housing payment = gross monthly income x 0.28
    const rule28MaxHousing = grossMonthly * 0.28;

    // 36% rule: max total debt = gross monthly income x 0.36; max housing = max total - existing debts
    const rule36MaxHousing = Math.max(0, grossMonthly * 0.36 - (monthlyDebts || 0));

    // Binding rule is the lower of the two
    const maxMonthlyHousing = Math.min(rule28MaxHousing, rule36MaxHousing);
    const bindingRule = rule28MaxHousing <= rule36MaxHousing ? '28%' : '36%';

    // Helper to compute max home price for a given monthly housing budget
    function computeMaxHomePrice(housingBudget: number): number {
      // We need to solve for home price P where:
      // housingBudget = PI + (P * taxRate/100 / 12) + (annualIns / 12)
      // PI = loanAmount * [r(1+r)^n] / [(1+r)^n - 1]
      // loanAmount = P - downPayment
      //
      // So: housingBudget = (P - downPayment) * mortgageFactor + P * monthlyTaxRate + monthlyIns
      // housingBudget - monthlyIns = P * mortgageFactor - downPayment * mortgageFactor + P * monthlyTaxRate
      // housingBudget - monthlyIns + downPayment * mortgageFactor = P * (mortgageFactor + monthlyTaxRate)
      // P = (housingBudget - monthlyIns + downPayment * mortgageFactor) / (mortgageFactor + monthlyTaxRate)

      const monthlyIns = (annualInsurance || 0) / 12;
      const monthlyTaxRate = (propertyTaxRate || 0) / 100 / 12;
      const r = (interestRate || 0) / 100 / 12;
      const n = loanYears * 12;

      let mortgageFactor: number;
      if (r <= 0) {
        // 0% interest: each payment is just principal / n
        mortgageFactor = n > 0 ? 1 / n : 0;
      } else {
        const rn = Math.pow(1 + r, n);
        mortgageFactor = (r * rn) / (rn - 1);
      }

      const availableForPIAndTax = housingBudget - monthlyIns;
      if (availableForPIAndTax <= 0) return downPayment || 0;

      const denominator = mortgageFactor + monthlyTaxRate;
      if (denominator <= 0) return downPayment || 0;

      const maxPrice = (availableForPIAndTax + (downPayment || 0) * mortgageFactor) / denominator;
      return Math.max(0, maxPrice);
    }

    const maxHomePrice = computeMaxHomePrice(maxMonthlyHousing);
    const maxLoanAmount = Math.max(0, maxHomePrice - (downPayment || 0));

    // Compute actual monthly breakdown at max home price
    const monthlyPropertyTax = (maxHomePrice * (propertyTaxRate || 0) / 100) / 12;
    const monthlyInsuranceAmt = (annualInsurance || 0) / 12;
    const maxPrincipalAndInterest = maxMonthlyHousing - monthlyPropertyTax - monthlyInsuranceAmt;

    // DTI ratios at max home price
    const frontEndDTI = grossMonthly > 0 ? (maxMonthlyHousing / grossMonthly) * 100 : 0;
    const backEndDTI = grossMonthly > 0 ? ((maxMonthlyHousing + (monthlyDebts || 0)) / grossMonthly) * 100 : 0;

    // Conservative / Standard / Aggressive price ranges
    const conservativeHousing = grossMonthly * 0.25;
    const standardHousing = grossMonthly * 0.28;
    const aggressiveHousing = grossMonthly * 0.33;

    // For each scenario, also apply the 36% back-end cap
    const conservativeMaxHousing = Math.min(conservativeHousing, rule36MaxHousing);
    const standardMaxHousing = Math.min(standardHousing, rule36MaxHousing);
    const aggressiveMaxHousing = Math.min(aggressiveHousing, rule36MaxHousing);

    const conservativePrice = computeMaxHomePrice(conservativeMaxHousing);
    const standardPrice = computeMaxHomePrice(standardMaxHousing);
    const aggressivePrice = computeMaxHomePrice(aggressiveMaxHousing);

    return {
      rule28MaxHousing,
      rule36MaxHousing,
      bindingRule,
      maxMonthlyHousing,
      monthlyPropertyTax,
      monthlyInsurance: monthlyInsuranceAmt,
      maxPrincipalAndInterest,
      maxLoanAmount,
      maxHomePrice,
      frontEndDTI,
      backEndDTI,
      conservativePrice,
      standardPrice,
      aggressivePrice,
    };
  }, [income, debts, down, rate, term, ptax, insurance]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Finances
          </h2>

          <div className="space-y-4">
            <InputField
              id="annual-income"
              label="Annual Gross Income"
              value={income}
              onChange={setIncome}
              prefix="$"
              placeholder="100,000"
              helpText="Your total pre-tax annual salary"
            />

            <InputField
              id="monthly-debts"
              label="Monthly Debt Payments"
              value={debts}
              onChange={setDebts}
              prefix="$"
              placeholder="500"
              helpText="Car loans, student loans, credit cards, etc."
            />

            <InputField
              id="down-payment"
              label="Down Payment"
              value={down}
              onChange={setDown}
              prefix="$"
              placeholder="60,000"
              helpText="Amount you plan to pay upfront"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Loan Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="interest-rate"
              label="Interest Rate"
              value={rate}
              onChange={setRate}
              suffix="%"
              placeholder="6.5"
              helpText="Expected mortgage interest rate"
            />

            <SelectField
              id="loan-term"
              label="Loan Term"
              value={term}
              onChange={setTerm}
              options={LOAN_TERM_OPTIONS}
            />

            <InputField
              id="property-tax-rate"
              label="Annual Property Tax Rate"
              value={ptax}
              onChange={setPtax}
              suffix="%"
              placeholder="1.1"
              helpText="As a percentage of home value"
            />

            <InputField
              id="annual-insurance"
              label="Annual Homeowner's Insurance"
              value={insurance}
              onChange={setInsurance}
              prefix="$"
              placeholder="1,500"
              helpText="Yearly insurance premium"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <AffordabilityResultPanel result={result} downPayment={Number(down.replace(/[^0-9.]/g, '')) || 0} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your income to see how much house you can afford
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────

function AffordabilityResultPanel({
  result,
  downPayment,
}: {
  result: AffordabilityResult;
  downPayment: number;
}) {
  const {
    rule28MaxHousing,
    rule36MaxHousing,
    bindingRule,
    maxMonthlyHousing,
    monthlyPropertyTax,
    monthlyInsurance,
    maxPrincipalAndInterest,
    maxLoanAmount,
    maxHomePrice,
    frontEndDTI,
    backEndDTI,
    conservativePrice,
    standardPrice,
    aggressivePrice,
  } = result;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">You Can Afford Up To</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(maxHomePrice)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrencyRound(maxLoanAmount)} loan + {formatCurrencyRound(downPayment)} down payment
        </p>
      </div>

      {/* Two-rule indicator */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RuleCard
          title="28% Rule (Front-End DTI)"
          maxHousing={rule28MaxHousing}
          isBinding={bindingRule === '28%'}
          description="Max housing as % of gross income"
        />
        <RuleCard
          title="36% Rule (Back-End DTI)"
          maxHousing={rule36MaxHousing}
          isBinding={bindingRule === '36%'}
          description="Max housing after existing debts"
        />
      </div>

      {/* Monthly budget breakdown */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Monthly Housing Budget
          </h3>
        </div>
        <table className="tabular-nums w-full text-sm">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <BudgetRow label="Max P&I Payment" value={maxPrincipalAndInterest} />
            <BudgetRow label="Property Tax" value={monthlyPropertyTax} />
            <BudgetRow label="Homeowner's Insurance" value={monthlyInsurance} />
            <BudgetRow label="Total Housing Payment" value={maxMonthlyHousing} bold highlight />
          </tbody>
        </table>
      </div>

      {/* Summary table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Affordability Summary
          </h3>
        </div>
        <table className="tabular-nums w-full text-sm">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <SummaryRow label="Max Home Price" value={formatCurrencyRound(maxHomePrice)} />
            <SummaryRow label="Down Payment" value={formatCurrencyRound(downPayment)} />
            <SummaryRow label="Max Loan Amount" value={formatCurrencyRound(maxLoanAmount)} />
            <SummaryRow label="Monthly Payment" value={formatCurrency(maxMonthlyHousing)} />
            <SummaryRow label="Front-End DTI Ratio" value={formatPercent(frontEndDTI, 1)} />
            <SummaryRow label="Back-End DTI Ratio" value={formatPercent(backEndDTI, 1)} />
          </tbody>
        </table>
      </div>

      {/* Conservative / Standard / Aggressive price ranges */}
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Price Range by Risk Tolerance
        </h3>
        <div className="space-y-3">
          <PriceRangeRow
            label="Conservative (25% rule)"
            price={conservativePrice}
            color="bg-success-500"
            tag="Lower risk"
            tagColor="text-success-600 dark:text-success-500"
          />
          <PriceRangeRow
            label="Standard (28% rule)"
            price={standardPrice}
            color="bg-navy-500"
            tag="Recommended"
            tagColor="text-navy-600 dark:text-navy-400"
          />
          <PriceRangeRow
            label="Aggressive (33% rule)"
            price={aggressivePrice}
            color="bg-patriot-500"
            tag="Higher risk"
            tagColor="text-patriot-600 dark:text-patriot-400"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Rule Card ──────────────────────────────────────────────────────────

function RuleCard({
  title,
  maxHousing,
  isBinding,
  description,
}: {
  title: string;
  maxHousing: number;
  isBinding: boolean;
  description: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isBinding
          ? 'border-navy-300 bg-navy-50 dark:border-navy-600 dark:bg-navy-900/20'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${
            isBinding
              ? 'text-navy-600 dark:text-navy-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            {title}
          </p>
          <p className="tabular-nums mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(maxHousing)}<span className="text-sm font-normal text-slate-500 dark:text-slate-400">/mo</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {isBinding && (
          <span className="shrink-0 rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-700 dark:bg-navy-800 dark:text-navy-300">
            Binding
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Budget Row ─────────────────────────────────────────────────────────

function BudgetRow({
  label,
  value,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
}) {
  const textColor = highlight
    ? 'text-success-600 dark:text-success-500'
    : 'text-slate-900 dark:text-slate-100';

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(value)}
      </td>
    </tr>
  );
}

// ─── Summary Row ────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{label}</td>
      <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">{value}</td>
    </tr>
  );
}

// ─── Price Range Row ────────────────────────────────────────────────────

function PriceRangeRow({
  label,
  price,
  color,
  tag,
  tagColor,
}: {
  label: string;
  price: number;
  color: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${tagColor}`}>{tag}</span>
        <span className="tabular-nums text-sm font-bold text-slate-900 dark:text-white">
          {formatCurrencyRound(price)}
        </span>
      </div>
    </div>
  );
}
