import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants ────────────────────────────────────────────────────────

type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';

const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 15700,
  mfj: 31400,
  mfs: 15700,
  hoh: 23350,
};

const CHILD_TAX_CREDIT = 2000;

/** Federal income tax brackets for 2026 */
const FEDERAL_BRACKETS: Record<FilingStatus, { min: number; max: number; rate: number }[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  mfs: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

function calculateFederalTax(taxableIncome: number, filing: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = FEDERAL_BRACKETS[filing];
  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

// ─── Component ────────────────────────────────────────────────────────

export default function TaxRefundCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [income, setIncome] = useState('75000');
  const [filing, setFiling] = useState<FilingStatus>('single');
  const [withheld, setWithheld] = useState('9000');
  const [children, setChildren] = useState('0');
  const [credits, setCredits] = useState('0');
  const [otherIncome, setOtherIncome] = useState('0');
  const [deductions, setDeductions] = useState('0');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('income')) setIncome(params.get('income')!);
    if (params.get('filing')) setFiling(params.get('filing') as FilingStatus);
    if (params.get('withheld')) setWithheld(params.get('withheld')!);
    if (params.get('children')) setChildren(params.get('children')!);
    if (params.get('credits')) setCredits(params.get('credits')!);
    if (params.get('other')) setOtherIncome(params.get('other')!);
    if (params.get('deductions')) setDeductions(params.get('deductions')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (income && income !== '75000') params.set('income', income);
    if (filing !== 'single') params.set('filing', filing);
    if (withheld && withheld !== '9000') params.set('withheld', withheld);
    if (children && children !== '0') params.set('children', children);
    if (credits && credits !== '0') params.set('credits', credits);
    if (otherIncome && otherIncome !== '0') params.set('other', otherIncome);
    if (deductions && deductions !== '0') params.set('deductions', deductions);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [income, filing, withheld, children, credits, otherIncome, deductions]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Parsing helpers ───────────────────────────────────────────────
  const num = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0;

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo(() => {
    const grossIncome = num(income);
    const additionalIncome = num(otherIncome);
    const aboveLineDeductions = num(deductions);
    const federalWithheld = num(withheld);
    const numChildren = Math.max(0, Math.floor(num(children)));
    const otherCredits = num(credits);

    const agi = grossIncome + additionalIncome - aboveLineDeductions;
    const standardDeduction = STANDARD_DEDUCTIONS[filing];
    const taxableIncome = Math.max(0, agi - standardDeduction);
    const federalTax = calculateFederalTax(taxableIncome, filing);
    const childTaxCredit = numChildren * CHILD_TAX_CREDIT;
    const totalCredits = childTaxCredit + otherCredits;
    const netTaxOwed = Math.max(0, federalTax - totalCredits);
    const refundOrOwed = federalWithheld - netTaxOwed; // positive = refund
    const effectiveRate = agi > 0 ? (netTaxOwed / agi) * 100 : 0;

    return {
      grossIncome,
      additionalIncome,
      aboveLineDeductions,
      agi,
      standardDeduction,
      taxableIncome,
      federalTax,
      childTaxCredit,
      otherCredits,
      totalCredits,
      netTaxOwed,
      federalWithheld,
      refundOrOwed,
      effectiveRate,
      isRefund: refundOrOwed >= 0,
    };
  }, [income, filing, withheld, children, credits, otherIncome, deductions]);

  // ─── Options ───────────────────────────────────────────────────────
  const filingOptions = [
    { value: 'single', label: 'Single' },
    { value: 'mfj', label: 'Married Filing Jointly' },
    { value: 'mfs', label: 'Married Filing Separately' },
    { value: 'hoh', label: 'Head of Household' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Tax Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="annual-income"
              label="Annual Income (W-2)"
              value={income}
              onChange={setIncome}
              prefix="$"
              placeholder="75,000"
              helpText="Your total W-2 wages or salary"
            />

            <SelectField
              id="filing-status"
              label="Filing Status"
              value={filing}
              onChange={(v) => setFiling(v as FilingStatus)}
              options={filingOptions}
            />

            <InputField
              id="federal-withheld"
              label="Federal Tax Withheld YTD"
              value={withheld}
              onChange={setWithheld}
              prefix="$"
              placeholder="9,000"
              helpText="Total federal income tax withheld from paychecks"
            />

            <InputField
              id="num-children"
              label="Number of Children Under 17"
              value={children}
              onChange={setChildren}
              placeholder="0"
              helpText={`$${CHILD_TAX_CREDIT.toLocaleString("en-US")} credit per qualifying child`}
            />

            <InputField
              id="other-credits"
              label="Other Credits"
              value={credits}
              onChange={setCredits}
              prefix="$"
              placeholder="0"
              helpText="Education credits, earned income credit, etc."
            />

            <InputField
              id="additional-income"
              label="Additional Income (1099, etc.)"
              value={otherIncome}
              onChange={setOtherIncome}
              prefix="$"
              placeholder="0"
              helpText="Freelance, investment, or other non-W-2 income"
            />

            <InputField
              id="above-line-deductions"
              label="Above-the-Line Deductions"
              value={deductions}
              onChange={setDeductions}
              prefix="$"
              placeholder="0"
              helpText="IRA contributions, student loan interest, HSA, etc."
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        <div className="space-y-6">
          {/* Hero card: Refund or Amount Owed */}
          <div
            className={`rounded-2xl p-6 text-center text-white shadow-lg ${
              result.isRefund
                ? 'bg-gradient-to-br from-success-700 to-success-800'
                : 'bg-gradient-to-br from-amber-600 to-amber-700'
            }`}
          >
            <p className="text-sm font-medium text-white/80">
              {result.isRefund ? 'Estimated Federal Tax Refund' : 'Estimated Additional Tax Owed'}
            </p>
            <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatCurrency(Math.abs(result.refundOrOwed))}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {result.isRefund
                ? 'You overpaid your federal taxes this year'
                : 'You underpaid your federal taxes this year'}
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Total Tax" value={formatCurrencyRound(result.netTaxOwed)} />
            <SummaryCard label="Total Withheld" value={formatCurrencyRound(result.federalWithheld)} />
            <SummaryCard label="Effective Rate" value={formatPercent(result.effectiveRate, 1)} />
          </div>

          {/* Detailed breakdown table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="tabular-nums w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <Row label="Gross Income (W-2)" value={result.grossIncome} bold />
                <Row
                  label="Additional Income"
                  value={result.additionalIncome}
                  show={result.additionalIncome > 0}
                />
                <Row
                  label="Above-the-Line Deductions"
                  value={-result.aboveLineDeductions}
                  show={result.aboveLineDeductions > 0}
                  color="blue"
                />
                <Row label="Adjusted Gross Income (AGI)" value={result.agi} bold />
                <Row
                  label="Standard Deduction"
                  value={-result.standardDeduction}
                  color="blue"
                />
                <Row label="Taxable Income" value={result.taxableIncome} bold />
                <Row
                  label="Federal Tax (before credits)"
                  value={result.federalTax}
                  color="red"
                />
                <Row
                  label="Child Tax Credit"
                  value={-result.childTaxCredit}
                  show={result.childTaxCredit > 0}
                  color="blue"
                />
                <Row
                  label="Other Credits"
                  value={-result.otherCredits}
                  show={result.otherCredits > 0}
                  color="blue"
                />
                <Row
                  label="Net Tax Owed"
                  value={result.netTaxOwed}
                  bold
                  color="red"
                />
                <Row label="Federal Tax Withheld" value={result.federalWithheld} color="blue" />
                <tr
                  className={
                    result.isRefund
                      ? 'bg-success-50/50 dark:bg-success-900/10'
                      : 'bg-amber-50/50 dark:bg-amber-900/10'
                  }
                >
                  <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                    {result.isRefund ? 'Refund' : 'Amount Owed'}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-semibold ${
                      result.isRefund
                        ? 'text-success-600 dark:text-success-500'
                        : 'text-amber-600 dark:text-amber-500'
                    }`}
                  >
                    {result.isRefund ? '+' : '-'}
                    {formatCurrency(Math.abs(result.refundOrOwed))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Note */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Estimate Only
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              This is an estimate. Actual refund depends on all income sources, itemized
              deductions, state taxes, and other factors. File Form 1040 for exact amounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="tabular-nums mt-1 text-lg font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────

function Row({
  label,
  value,
  bold = false,
  color,
  show = true,
}: {
  label: string;
  value: number;
  bold?: boolean;
  color?: 'red' | 'blue';
  show?: boolean;
}) {
  if (!show) return null;

  const textColor =
    color === 'red'
      ? 'text-patriot-600 dark:text-patriot-400'
      : color === 'blue'
        ? 'text-navy-600 dark:text-navy-400'
        : 'text-slate-900 dark:text-slate-100';

  return (
    <tr>
      <td
        className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}
      >
        {label}
      </td>
      <td
        className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}
      >
        {formatCurrency(value)}
      </td>
    </tr>
  );
}
