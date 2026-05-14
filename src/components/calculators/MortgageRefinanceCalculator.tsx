import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

const NEW_TERM_OPTIONS = [
  { value: '15', label: '15 years' },
  { value: '20', label: '20 years' },
  { value: '25', label: '25 years' },
  { value: '30', label: '30 years' },
];

/** Standard monthly mortgage payment (P&I only). */
function calcMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate <= 0) return principal / (years * 12);
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Total interest paid over the full life of the loan. */
function calcTotalInterest(principal: number, annualRate: number, years: number): number {
  const monthly = calcMonthlyPayment(principal, annualRate, years);
  return monthly * years * 12 - principal;
}

export default function MortgageRefinanceCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [balance, setBalance] = useState('300000');
  const [currentRate, setCurrentRate] = useState('7.0');
  const [currentTerm, setCurrentTerm] = useState('25');
  const [newRate, setNewRate] = useState('5.75');
  const [newTerm, setNewTerm] = useState('30');
  const [closingCosts, setClosingCosts] = useState('6000');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('balance')) setBalance(params.get('balance')!);
    if (params.get('crate')) setCurrentRate(params.get('crate')!);
    if (params.get('cterm')) setCurrentTerm(params.get('cterm')!);
    if (params.get('nrate')) setNewRate(params.get('nrate')!);
    if (params.get('nterm')) setNewTerm(params.get('nterm')!);
    if (params.get('costs')) setClosingCosts(params.get('costs')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (balance && balance !== '300000') params.set('balance', balance);
    if (currentRate && currentRate !== '7.0') params.set('crate', currentRate);
    if (currentTerm && currentTerm !== '25') params.set('cterm', currentTerm);
    if (newRate && newRate !== '5.75') params.set('nrate', newRate);
    if (newTerm !== '30') params.set('nterm', newTerm);
    if (closingCosts && closingCosts !== '6000') params.set('costs', closingCosts);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [balance, currentRate, currentTerm, newRate, newTerm, closingCosts]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo(() => {
    const bal = Number(balance.replace(/[^0-9.]/g, ''));
    const cRate = Number(currentRate.replace(/[^0-9.]/g, ''));
    const cTerm = Number(currentTerm.replace(/[^0-9.]/g, ''));
    const nRate = Number(newRate.replace(/[^0-9.]/g, ''));
    const nTermYears = Number(newTerm);
    const costs = Number(closingCosts.replace(/[^0-9.]/g, ''));

    if (isNaN(bal) || bal <= 0) return null;
    if (isNaN(cRate) || isNaN(cTerm) || cTerm <= 0) return null;
    if (isNaN(nRate) || isNaN(nTermYears) || nTermYears <= 0) return null;

    const cRateDecimal = cRate / 100;
    const nRateDecimal = nRate / 100;
    const validCosts = isNaN(costs) ? 0 : costs;

    const currentMonthly = calcMonthlyPayment(bal, cRateDecimal, cTerm);
    const newMonthly = calcMonthlyPayment(bal, nRateDecimal, nTermYears);

    const monthlySavings = currentMonthly - newMonthly;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(validCosts / monthlySavings) : Infinity;

    const currentTotalInterest = calcTotalInterest(bal, cRateDecimal, cTerm);
    const newTotalInterest = calcTotalInterest(bal, nRateDecimal, nTermYears);

    const currentTotalCost = bal + currentTotalInterest;
    const newTotalCost = bal + newTotalInterest + validCosts;

    const lifetimeInterestSavings = currentTotalInterest - newTotalInterest;
    const netSavings = lifetimeInterestSavings - validCosts;

    return {
      currentMonthly,
      newMonthly,
      monthlySavings,
      breakEvenMonths,
      currentTotalInterest,
      newTotalInterest,
      currentTotalCost,
      newTotalCost,
      lifetimeInterestSavings,
      netSavings,
      closingCosts: validCosts,
      currentRateDisplay: cRate,
      newRateDisplay: nRate,
      currentTermDisplay: cTerm,
      newTermDisplay: nTermYears,
      isWorthIt: monthlySavings > 0,
    };
  }, [balance, currentRate, currentTerm, newRate, newTerm, closingCosts]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        {/* Current Mortgage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Current Mortgage
          </h2>
          <div className="space-y-4">
            <InputField
              id="balance"
              label="Remaining Balance"
              value={balance}
              onChange={setBalance}
              prefix="$"
              placeholder="300,000"
              helpText="Outstanding principal on your current loan"
            />
            <InputField
              id="current-rate"
              label="Current Interest Rate"
              value={currentRate}
              onChange={setCurrentRate}
              suffix="%"
              placeholder="7.0"
              helpText="Annual rate on your existing mortgage"
            />
            <InputField
              id="current-term"
              label="Remaining Term"
              value={currentTerm}
              onChange={setCurrentTerm}
              suffix="years"
              placeholder="25"
              helpText="Years left on your current mortgage"
            />
          </div>
        </div>

        {/* New Mortgage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            New Mortgage
          </h2>
          <div className="space-y-4">
            <InputField
              id="new-rate"
              label="New Interest Rate"
              value={newRate}
              onChange={setNewRate}
              suffix="%"
              placeholder="5.75"
              helpText="Rate offered on the refinanced loan"
            />
            <SelectField
              id="new-term"
              label="New Loan Term"
              value={newTerm}
              onChange={setNewTerm}
              options={NEW_TERM_OPTIONS}
              helpText="Length of the refinanced mortgage"
            />
            <InputField
              id="closing-costs"
              label="Closing Costs"
              value={closingCosts}
              onChange={setClosingCosts}
              prefix="$"
              placeholder="6,000"
              helpText="Fees to close the new loan (2-5% typical)"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <ResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your mortgage details to see refinance analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Types ───────────────────────────────────────────────────────

interface RefinanceResult {
  currentMonthly: number;
  newMonthly: number;
  monthlySavings: number;
  breakEvenMonths: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  currentTotalCost: number;
  newTotalCost: number;
  lifetimeInterestSavings: number;
  netSavings: number;
  closingCosts: number;
  currentRateDisplay: number;
  newRateDisplay: number;
  currentTermDisplay: number;
  newTermDisplay: number;
  isWorthIt: boolean;
}

// ─── Result Panel ───────────────────────────────────────────────────────

function ResultPanel({ result }: { result: RefinanceResult }) {
  const {
    currentMonthly,
    newMonthly,
    monthlySavings,
    breakEvenMonths,
    currentTotalInterest,
    newTotalInterest,
    currentTotalCost,
    newTotalCost,
    lifetimeInterestSavings,
    netSavings,
    closingCosts,
    currentRateDisplay,
    newRateDisplay,
    currentTermDisplay,
    newTermDisplay,
    isWorthIt,
  } = result;

  const positive = isWorthIt;
  const heroGradient = positive
    ? 'from-navy-800 to-navy-900'
    : 'from-amber-700 to-amber-800';
  const heroSubtext = positive ? 'text-navy-200' : 'text-amber-200';
  const heroAccent = positive ? 'text-navy-300' : 'text-amber-300';

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className={`rounded-2xl bg-gradient-to-br ${heroGradient} p-6 text-center text-white shadow-lg`}>
        <p className={`text-sm font-medium ${heroSubtext}`}>Monthly Savings</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(Math.abs(monthlySavings))}
          {!positive && <span className="text-2xl sm:text-3xl"> more</span>}
        </p>
        <p className={`tabular-nums mt-2 text-sm ${heroAccent}`}>
          {positive
            ? breakEvenMonths === Infinity
              ? 'No break-even (no monthly savings)'
              : `Break-even in ${formatNumber(breakEvenMonths)} month${breakEvenMonths !== 1 ? 's' : ''} (${(breakEvenMonths / 12).toFixed(1)} years)`
            : 'Refinancing would increase your monthly payment'}
        </p>
      </div>

      {/* Side-by-side comparison table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400" />
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Current
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Refinance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <ComparisonRow
              label="Monthly Payment"
              current={formatCurrency(currentMonthly)}
              refi={formatCurrency(newMonthly)}
            />
            <ComparisonRow
              label="Interest Rate"
              current={`${currentRateDisplay}%`}
              refi={`${newRateDisplay}%`}
            />
            <ComparisonRow
              label="Remaining Term"
              current={`${currentTermDisplay} yr${currentTermDisplay !== 1 ? 's' : ''}`}
              refi={`${newTermDisplay} yr${newTermDisplay !== 1 ? 's' : ''}`}
            />
            <ComparisonRow
              label="Total Interest"
              current={formatCurrencyRound(currentTotalInterest)}
              refi={formatCurrencyRound(newTotalInterest)}
            />
            <ComparisonRow
              label="Total Cost"
              current={formatCurrencyRound(currentTotalCost)}
              refi={formatCurrencyRound(newTotalCost)}
              bold
              highlight
            />
          </tbody>
        </table>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Monthly Savings"
          value={monthlySavings >= 0 ? formatCurrency(monthlySavings) : `-${formatCurrency(Math.abs(monthlySavings))}`}
          positive={monthlySavings > 0}
        />
        <StatCard
          label="Break-even Point"
          value={
            breakEvenMonths === Infinity
              ? 'N/A'
              : `${formatNumber(breakEvenMonths)} mo`
          }
        />
        <StatCard
          label="Interest Savings"
          value={formatCurrencyRound(lifetimeInterestSavings)}
          positive={lifetimeInterestSavings > 0}
        />
        <StatCard label="Closing Costs" value={formatCurrencyRound(closingCosts)} />
        <StatCard
          label="Net Savings"
          value={formatCurrencyRound(netSavings)}
          positive={netSavings > 0}
        />
      </div>

      {/* Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Note:</span>{' '}
          Refinancing resets your amortization clock. A lower rate with a longer term may reduce
          monthly payments but increase total interest. Consider your plans: if you will move before
          the break-even point, refinancing may not be worth it.
        </p>
      </div>
    </div>
  );
}

// ─── Comparison Row ─────────────────────────────────────────────────────

function ComparisonRow({
  label,
  current,
  refi,
  bold = false,
  highlight = false,
}: {
  label: string;
  current: string;
  refi: string;
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
        {current}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {refi}
      </td>
    </tr>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  const valueColor =
    positive === undefined
      ? 'text-slate-900 dark:text-white'
      : positive
        ? 'text-success-600 dark:text-success-500'
        : 'text-patriot-600 dark:text-patriot-400';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`tabular-nums mt-1 text-lg font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
