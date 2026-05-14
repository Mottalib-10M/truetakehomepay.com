import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';

// ─── Types ──────────────────────────────────────────────────────────────

interface AmortizationMonth {
  month: number;
  startingBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

interface YearSummary {
  year: number;
  startingBalance: number;
  totalPayments: number;
  totalPrincipal: number;
  totalInterest: number;
  endingBalance: number;
}

interface LoanResult {
  monthlyPayment: number;
  monthlyPaymentWithExtra: number;
  totalPayment: number;
  totalInterest: number;
  totalPaymentWithExtra: number;
  totalInterestWithExtra: number;
  payoffMonths: number;
  payoffMonthsWithExtra: number;
  monthsSaved: number;
  interestSaved: number;
  schedule: AmortizationMonth[];
  scheduleWithExtra: AmortizationMonth[];
  yearSummaries: YearSummary[];
}

// ─── Loan Calculation ───────────────────────────────────────────────────

function calculateLoan(
  principal: number,
  annualRate: number,
  termMonths: number,
  extraPayment: number,
): LoanResult {
  const monthlyRate = annualRate / 12;

  // Standard monthly payment (without extra)
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
  }

  // Build standard schedule (no extra payments)
  const schedule: AmortizationMonth[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPayment = 0;

  for (let m = 1; m <= termMonths && balance > 0.005; m++) {
    const interestPart = balance * monthlyRate;
    const principalPart = Math.min(monthlyPayment - interestPart, balance);
    const payment = interestPart + principalPart;

    totalInterest += interestPart;
    totalPayment += payment;

    schedule.push({
      month: m,
      startingBalance: balance,
      payment,
      principal: principalPart,
      interest: interestPart,
      endingBalance: balance - principalPart,
    });

    balance -= principalPart;
  }

  // Build schedule with extra payments
  const scheduleWithExtra: AmortizationMonth[] = [];
  let balanceExtra = principal;
  let totalInterestExtra = 0;
  let totalPaymentExtra = 0;

  for (let m = 1; balanceExtra > 0.005; m++) {
    const interestPart = balanceExtra * monthlyRate;
    const regularPrincipal = monthlyPayment - interestPart;
    const totalPrincipal = Math.min(regularPrincipal + extraPayment, balanceExtra);
    const payment = interestPart + totalPrincipal;

    totalInterestExtra += interestPart;
    totalPaymentExtra += payment;

    scheduleWithExtra.push({
      month: m,
      startingBalance: balanceExtra,
      payment,
      principal: totalPrincipal,
      interest: interestPart,
      endingBalance: balanceExtra - totalPrincipal,
    });

    balanceExtra -= totalPrincipal;
  }

  // Build year summaries from the extra-payment schedule (or standard if no extra)
  const activeSchedule = extraPayment > 0 ? scheduleWithExtra : schedule;
  const yearSummaries: YearSummary[] = [];
  let yearStart = 0;

  for (let i = 0; i < activeSchedule.length; i++) {
    const yearIndex = Math.floor(i / 12);
    if (yearIndex >= yearSummaries.length) {
      yearSummaries.push({
        year: yearIndex + 1,
        startingBalance: activeSchedule[i].startingBalance,
        totalPayments: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        endingBalance: 0,
      });
    }
    const ys = yearSummaries[yearIndex];
    ys.totalPayments += activeSchedule[i].payment;
    ys.totalPrincipal += activeSchedule[i].principal;
    ys.totalInterest += activeSchedule[i].interest;
    ys.endingBalance = activeSchedule[i].endingBalance;
  }

  return {
    monthlyPayment,
    monthlyPaymentWithExtra: monthlyPayment + extraPayment,
    totalPayment,
    totalInterest,
    totalPaymentWithExtra: totalPaymentExtra,
    totalInterestWithExtra: totalInterestExtra,
    payoffMonths: schedule.length,
    payoffMonthsWithExtra: scheduleWithExtra.length,
    monthsSaved: schedule.length - scheduleWithExtra.length,
    interestSaved: totalInterest - totalInterestExtra,
    schedule,
    scheduleWithExtra,
    yearSummaries,
  };
}

// ─── Helper ─────────────────────────────────────────────────────────────

function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

function payoffDate(months: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return `${target.toLocaleString('en-US', { month: 'short' })} ${target.getFullYear()}`;
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function LoanCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [amountInput, setAmountInput] = useState('25000');
  const [rateInput, setRateInput] = useState('7.5');
  const [termInput, setTermInput] = useState('60');
  const [extraInput, setExtraInput] = useState('0');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('amount')) setAmountInput(params.get('amount')!);
    if (params.get('rate')) setRateInput(params.get('rate')!);
    if (params.get('term')) setTermInput(params.get('term')!);
    if (params.get('extra')) setExtraInput(params.get('extra')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (amountInput && amountInput !== '25000') params.set('amount', amountInput);
    if (rateInput && rateInput !== '7.5') params.set('rate', rateInput);
    if (termInput && termInput !== '60') params.set('term', termInput);
    if (extraInput && extraInput !== '0') params.set('extra', extraInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [amountInput, rateInput, termInput, extraInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<LoanResult | null>(() => {
    const principal = Number(amountInput.replace(/[^0-9.]/g, ''));
    const annualRate = Number(rateInput.replace(/[^0-9.]/g, '')) / 100;
    const term = Number(termInput.replace(/[^0-9.]/g, ''));
    const extra = Number(extraInput.replace(/[^0-9.]/g, '')) || 0;

    if (isNaN(principal) || principal <= 0) return null;
    if (isNaN(annualRate) || annualRate < 0) return null;
    if (isNaN(term) || term <= 0 || !Number.isFinite(term)) return null;

    return calculateLoan(principal, annualRate, Math.round(term), extra);
  }, [amountInput, rateInput, termInput, extraInput]);

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Loan Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="loan-amount"
              label="Loan Amount"
              value={amountInput}
              onChange={setAmountInput}
              prefix="$"
              placeholder="25,000"
              helpText="Total amount you plan to borrow"
            />

            <InputField
              id="interest-rate"
              label="Annual Interest Rate"
              value={rateInput}
              onChange={setRateInput}
              suffix="%"
              placeholder="7.5"
              helpText="Yearly interest rate (APR)"
            />

            <InputField
              id="loan-term"
              label="Loan Term (months)"
              value={termInput}
              onChange={setTermInput}
              suffix="mo"
              placeholder="60"
              helpText="Number of months to repay the loan"
            />

            <InputField
              id="extra-payment"
              label="Extra Monthly Payment"
              value={extraInput}
              onChange={setExtraInput}
              prefix="$"
              placeholder="0"
              helpText="Additional amount applied to principal each month"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <LoanResults result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your loan details to see your estimated payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Panel ──────────────────────────────────────────────────────

function LoanResults({ result }: { result: LoanResult }) {
  const {
    monthlyPayment,
    monthlyPaymentWithExtra,
    totalPayment,
    totalInterest,
    totalPaymentWithExtra,
    totalInterestWithExtra,
    payoffMonths,
    payoffMonthsWithExtra,
    monthsSaved,
    interestSaved,
    yearSummaries,
  } = result;

  const principal = totalPayment - totalInterest;
  const hasExtra = monthsSaved > 0 || interestSaved > 0.01;

  return (
    <div className="space-y-6">
      {/* Hero card: monthly payment */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Monthly Payment</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(monthlyPayment)}
        </p>
        {hasExtra && (
          <p className="tabular-nums mt-2 text-sm text-navy-300">
            {formatCurrency(monthlyPaymentWithExtra)}/mo with extra payment
          </p>
        )}
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrencyRound(principal)} principal &middot; {formatMonths(payoffMonths)} term
        </p>
      </div>

      {/* Breakdown bar: principal vs interest */}
      <CostBreakdownBar principal={principal} interest={totalInterest} />

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Payment" value={formatCurrencyRound(hasExtra ? totalPaymentWithExtra : totalPayment)} />
        <StatCard label="Total Interest" value={formatCurrencyRound(hasExtra ? totalInterestWithExtra : totalInterest)} />
        <StatCard label="Payoff Date" value={payoffDate(hasExtra ? payoffMonthsWithExtra : payoffMonths)} />
      </div>

      {/* Extra payment impact */}
      {hasExtra && (
        <div className="rounded-xl border border-success-200 bg-success-50/50 p-5 dark:border-success-800 dark:bg-success-900/10">
          <h3 className="text-sm font-semibold text-success-800 dark:text-success-400">
            Extra Payment Impact
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-success-600 dark:text-success-500">Months Saved</p>
              <p className="tabular-nums mt-0.5 text-lg font-bold text-success-800 dark:text-success-300">
                {monthsSaved}
              </p>
            </div>
            <div>
              <p className="text-xs text-success-600 dark:text-success-500">Interest Saved</p>
              <p className="tabular-nums mt-0.5 text-lg font-bold text-success-800 dark:text-success-300">
                {formatCurrencyRound(interestSaved)}
              </p>
            </div>
            <div>
              <p className="text-xs text-success-600 dark:text-success-500">New Payoff</p>
              <p className="tabular-nums mt-0.5 text-lg font-bold text-success-800 dark:text-success-300">
                {formatMonths(payoffMonthsWithExtra)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Amortization summary table */}
      <AmortizationTable yearSummaries={yearSummaries} />
    </div>
  );
}

// ─── Breakdown Bar ──────────────────────────────────────────────────────

function CostBreakdownBar({
  principal,
  interest,
}: {
  principal: number;
  interest: number;
}) {
  const total = principal + interest;
  if (total <= 0) return null;

  const segments = [
    { label: 'Principal', value: principal, color: 'bg-navy-500' },
    { label: 'Interest', value: interest, color: 'bg-patriot-500' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / total) * 100}%` }}
            title={`${seg.label}: ${formatCurrencyRound(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrencyRound(seg.value)} ({formatPercent((seg.value / total) * 100, 1)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Amortization Table ─────────────────────────────────────────────────

function AmortizationTable({ yearSummaries }: { yearSummaries: YearSummary[] }) {
  if (yearSummaries.length === 0) return null;

  // Show all years if <= 10 years; otherwise first 5 + last year
  let displayRows: YearSummary[];
  let showEllipsis = false;

  if (yearSummaries.length <= 10) {
    displayRows = yearSummaries;
  } else {
    const firstFive = yearSummaries.slice(0, 5);
    const lastYear = yearSummaries[yearSummaries.length - 1];
    displayRows = [...firstFive, lastYear];
    showEllipsis = true;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Amortization Summary
      </h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-3 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Year</th>
              <th className="px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400">Starting Bal.</th>
              <th className="px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400">Payments</th>
              <th className="hidden px-3 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">Principal</th>
              <th className="hidden px-3 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">Interest</th>
              <th className="px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400">Ending Bal.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayRows.map((ys, idx) => (
              <>
                {showEllipsis && idx === displayRows.length - 1 && (
                  <tr key="ellipsis">
                    <td colSpan={6} className="px-3 py-2 text-center text-xs text-slate-400 dark:text-slate-500">
                      ...
                    </td>
                  </tr>
                )}
                <tr
                  key={ys.year}
                  className={
                    ys.endingBalance < 0.01
                      ? 'bg-success-50/50 dark:bg-success-900/10'
                      : ''
                  }
                >
                  <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                    {ys.year}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-900 dark:text-slate-100">
                    {formatCurrencyRound(ys.startingBalance)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-900 dark:text-slate-100">
                    {formatCurrencyRound(ys.totalPayments)}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right text-navy-600 sm:table-cell dark:text-navy-400">
                    {formatCurrencyRound(ys.totalPrincipal)}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right text-patriot-600 sm:table-cell dark:text-patriot-400">
                    {formatCurrencyRound(ys.totalInterest)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrencyRound(Math.max(0, ys.endingBalance))}
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
