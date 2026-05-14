import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateMortgage, type MortgageResult } from '../../lib/finance-engine';
import { formatCurrency, formatCurrencyRound, formatPercent, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

const LOAN_TERM_OPTIONS = [
  { value: '30', label: '30 years' },
  { value: '20', label: '20 years' },
  { value: '15', label: '15 years' },
  { value: '10', label: '10 years' },
];

export default function MortgageCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [homePrice, setHomePrice] = useState('350000');
  const [downPayment, setDownPayment] = useState('70000');
  const [downPaymentPct, setDownPaymentPct] = useState('20');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('6.75');
  const [annualPropertyTax, setAnnualPropertyTax] = useState('4200');
  const [annualInsurance, setAnnualInsurance] = useState('1800');
  const [pmiRate, setPmiRate] = useState('0.5');

  // Track which field was last edited to avoid sync loops
  const [lastDownPaymentEdit, setLastDownPaymentEdit] = useState<'dollar' | 'percent'>('dollar');

  // ─── Down Payment Sync ──────────────────────────────────────────────
  useEffect(() => {
    const price = Number(homePrice.replace(/[^0-9.]/g, ''));
    if (isNaN(price) || price <= 0) return;

    if (lastDownPaymentEdit === 'dollar') {
      const dp = Number(downPayment.replace(/[^0-9.]/g, ''));
      if (!isNaN(dp)) {
        const pct = ((dp / price) * 100).toFixed(2).replace(/\.?0+$/, '');
        setDownPaymentPct(pct);
      }
    } else {
      const pct = Number(downPaymentPct.replace(/[^0-9.]/g, ''));
      if (!isNaN(pct)) {
        const dp = Math.round(price * (pct / 100));
        setDownPayment(dp.toString());
      }
    }
  }, [homePrice, downPayment, downPaymentPct, lastDownPaymentEdit]);

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('price')) setHomePrice(params.get('price')!);
    if (params.get('down')) setDownPayment(params.get('down')!);
    if (params.get('term')) setLoanTerm(params.get('term')!);
    if (params.get('rate')) setInterestRate(params.get('rate')!);
    if (params.get('tax')) setAnnualPropertyTax(params.get('tax')!);
    if (params.get('insurance')) setAnnualInsurance(params.get('insurance')!);
    if (params.get('pmi')) setPmiRate(params.get('pmi')!);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (homePrice && homePrice !== '350000') params.set('price', homePrice);
    if (downPayment && downPayment !== '70000') params.set('down', downPayment);
    if (loanTerm !== '30') params.set('term', loanTerm);
    if (interestRate && interestRate !== '6.75') params.set('rate', interestRate);
    if (annualPropertyTax && annualPropertyTax !== '4200') params.set('tax', annualPropertyTax);
    if (annualInsurance && annualInsurance !== '1800') params.set('insurance', annualInsurance);
    if (pmiRate && pmiRate !== '0.5') params.set('pmi', pmiRate);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [homePrice, downPayment, loanTerm, interestRate, annualPropertyTax, annualInsurance, pmiRate]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<MortgageResult | null>(() => {
    const price = Number(homePrice.replace(/[^0-9.]/g, ''));
    const dp = Number(downPayment.replace(/[^0-9.]/g, ''));
    const rate = Number(interestRate.replace(/[^0-9.]/g, ''));
    const years = Number(loanTerm);
    const propTax = Number(annualPropertyTax.replace(/[^0-9.]/g, ''));
    const ins = Number(annualInsurance.replace(/[^0-9.]/g, ''));
    const pmi = Number(pmiRate.replace(/[^0-9.]/g, ''));

    if (isNaN(price) || price <= 0) return null;
    if (isNaN(rate)) return null;

    return calculateMortgage(price, rate / 100, years, {
      downPayment: dp || 0,
      annualPropertyTax: propTax || 0,
      annualInsurance: ins || 0,
      pmiRate: pmi ? pmi / 100 : 0,
    });
  }, [homePrice, downPayment, loanTerm, interestRate, annualPropertyTax, annualInsurance, pmiRate]);

  // ─── Derived Values ────────────────────────────────────────────────
  const loanAmount = useMemo(() => {
    const price = Number(homePrice.replace(/[^0-9.]/g, ''));
    const dp = Number(downPayment.replace(/[^0-9.]/g, ''));
    if (isNaN(price) || isNaN(dp)) return 0;
    return Math.max(0, price - dp);
  }, [homePrice, downPayment]);

  const ltvRatio = useMemo(() => {
    const price = Number(homePrice.replace(/[^0-9.]/g, ''));
    if (isNaN(price) || price <= 0 || loanAmount <= 0) return 0;
    return (loanAmount / price) * 100;
  }, [homePrice, loanAmount]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Mortgage Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="home-price"
              label="Home Price"
              value={homePrice}
              onChange={setHomePrice}
              prefix="$"
              placeholder="350,000"
              helpText="Purchase price of the home"
            />

            <InputField
              id="down-payment"
              label="Down Payment"
              value={downPayment}
              onChange={(v) => { setDownPayment(v); setLastDownPaymentEdit('dollar'); }}
              prefix="$"
              placeholder="70,000"
              helpText="Amount paid upfront"
            />

            <InputField
              id="down-payment-pct"
              label="Down Payment Percentage"
              value={downPaymentPct}
              onChange={(v) => { setDownPaymentPct(v); setLastDownPaymentEdit('percent'); }}
              suffix="%"
              placeholder="20"
              helpText="Auto-synced with dollar amount above"
            />

            <SelectField
              id="loan-term"
              label="Loan Term"
              value={loanTerm}
              onChange={setLoanTerm}
              options={LOAN_TERM_OPTIONS}
            />

            <InputField
              id="interest-rate"
              label="Interest Rate"
              value={interestRate}
              onChange={setInterestRate}
              suffix="%"
              placeholder="6.75"
              helpText="Annual interest rate on the mortgage"
            />

            <InputField
              id="annual-property-tax"
              label="Annual Property Tax"
              value={annualPropertyTax}
              onChange={setAnnualPropertyTax}
              prefix="$"
              placeholder="4,200"
              helpText="Yearly property tax amount"
            />

            <InputField
              id="annual-insurance"
              label="Annual Home Insurance"
              value={annualInsurance}
              onChange={setAnnualInsurance}
              prefix="$"
              placeholder="1,800"
              helpText="Yearly homeowners insurance premium"
            />

            <InputField
              id="pmi-rate"
              label="PMI Rate"
              value={pmiRate}
              onChange={setPmiRate}
              suffix="%"
              placeholder="0.5"
              helpText="Applies if down payment is less than 20%"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <MortgageResultPanel result={result} loanAmount={loanAmount} ltvRatio={ltvRatio} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your home price to see your monthly payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────

function MortgageResultPanel({
  result,
  loanAmount,
  ltvRatio,
}: {
  result: MortgageResult;
  loanAmount: number;
  ltvRatio: number;
}) {
  const {
    monthlyPayment,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    totalPayment,
    totalInterest,
  } = result;

  return (
    <div className="space-y-6">
      {/* Big hero number */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Monthly Payment (PITI)</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(monthlyPayment)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrencyRound(loanAmount)} loan &middot; {formatPercent(ltvRatio, 1)} LTV
        </p>
      </div>

      {/* Breakdown bar */}
      <BreakdownBar result={result} />

      {/* Detailed breakdown table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Component
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Monthly
              </th>
              <th className="hidden px-4 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
                Annual
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <MortgageRow label="Principal & Interest" monthly={monthlyPrincipalAndInterest} annual={monthlyPrincipalAndInterest * 12} />
            <MortgageRow label="Property Tax" monthly={monthlyPropertyTax} annual={monthlyPropertyTax * 12} show={monthlyPropertyTax > 0} />
            <MortgageRow label="Home Insurance" monthly={monthlyInsurance} annual={monthlyInsurance * 12} show={monthlyInsurance > 0} />
            <MortgageRow label="PMI" monthly={monthlyPMI} annual={monthlyPMI * 12} show={monthlyPMI > 0} />
            <MortgageRow label="Total Monthly Payment" monthly={monthlyPayment} annual={monthlyPayment * 12} bold highlight />
          </tbody>
        </table>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Loan Amount" value={formatCurrencyRound(loanAmount)} />
        <StatCard label="Total of All Payments" value={formatCurrencyRound(totalPayment)} />
        <StatCard label="Total Interest Paid" value={formatCurrencyRound(totalInterest)} />
      </div>

      {/* LTV ratio display */}
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Loan-to-Value (LTV) Ratio
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ltvRatio > 80
                ? 'PMI required — LTV exceeds 80%'
                : 'No PMI required — LTV is 80% or below'}
            </p>
          </div>
          <span
            className={`tabular-nums text-lg font-bold ${
              ltvRatio > 80
                ? 'text-patriot-600 dark:text-patriot-400'
                : 'text-success-600 dark:text-success-500'
            }`}
          >
            {formatPercent(ltvRatio, 1)}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              ltvRatio > 80 ? 'bg-patriot-500' : 'bg-success-500'
            }`}
            style={{ width: `${Math.min(ltvRatio, 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>0%</span>
          <span className="text-slate-500 dark:text-slate-400">80%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ─────────────────────────────────────────────────────

function BreakdownBar({ result }: { result: MortgageResult }) {
  const { monthlyPayment, monthlyPrincipalAndInterest, monthlyPropertyTax, monthlyInsurance, monthlyPMI } = result;

  if (monthlyPayment <= 0) return null;

  const segments = [
    { label: 'P&I', value: monthlyPrincipalAndInterest, color: 'bg-navy-600' },
    { label: 'Property Tax', value: monthlyPropertyTax, color: 'bg-amber-500' },
    { label: 'Insurance', value: monthlyInsurance, color: 'bg-sky-400' },
    { label: 'PMI', value: monthlyPMI, color: 'bg-purple-400' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / monthlyPayment) * 100}%` }}
            title={`${seg.label}: ${formatCurrency(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrency(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ─────────────────────────────────────────────────────────

function MortgageRow({
  label,
  monthly,
  annual,
  bold = false,
  highlight = false,
  show = true,
}: {
  label: string;
  monthly: number;
  annual: number;
  bold?: boolean;
  highlight?: boolean;
  show?: boolean;
}) {
  if (!show) return null;

  const textColor = highlight
    ? 'text-success-600 dark:text-success-500'
    : 'text-slate-900 dark:text-slate-100';

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(monthly)}
      </td>
      <td className={`hidden px-4 py-2.5 text-right sm:table-cell ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(annual)}
      </td>
    </tr>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
