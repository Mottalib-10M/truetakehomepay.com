import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

/* ────────── Types ────────── */

interface MonthRecord {
  month: number;
  startBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endBalance: number;
}

interface YearSummary {
  year: number;
  startBalance: number;
  payments: number;
  principal: number;
  interest: number;
  endBalance: number;
  taxDeduction: number;
}

interface PayoffResult {
  months: number;
  totalPayment: number;
  totalInterest: number;
  schedule: MonthRecord[];
  yearSummaries: YearSummary[];
}

/* ────────── Simulation ────────── */

function simulatePayoff(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
  marginalRate: number,
): PayoffResult {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: MonthRecord[] = [];
  let remaining = balance;
  let totalInterest = 0;
  let totalPayment = 0;

  const MAX_MONTHS = 600;

  for (let m = 1; m <= MAX_MONTHS && remaining > 0.005; m++) {
    const interest = remaining * monthlyRate;
    const pmt = Math.min(monthlyPayment, remaining + interest);
    const principal = pmt - interest;

    totalInterest += interest;
    totalPayment += pmt;

    const endBalance = Math.max(remaining - principal, 0);

    schedule.push({
      month: m,
      startBalance: remaining,
      payment: pmt,
      principal,
      interest,
      endBalance,
    });

    remaining = endBalance;
  }

  // Build year summaries
  const yearSummaries: YearSummary[] = [];
  let currentYear = 1;
  let yearStart = balance;
  let yearPayments = 0;
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (const rec of schedule) {
    const recYear = Math.ceil(rec.month / 12);
    if (recYear !== currentYear) {
      const endBal = schedule[(currentYear - 1) * 12 - 1]?.endBalance ?? 0;
      const deduction = Math.min(yearInterest, 2500) * (marginalRate / 100);
      yearSummaries.push({
        year: currentYear,
        startBalance: yearStart,
        payments: yearPayments,
        principal: yearPrincipal,
        interest: yearInterest,
        endBalance: endBal,
        taxDeduction: deduction,
      });
      currentYear = recYear;
      yearStart = endBal;
      yearPayments = 0;
      yearPrincipal = 0;
      yearInterest = 0;
    }
    yearPayments += rec.payment;
    yearPrincipal += rec.principal;
    yearInterest += rec.interest;
  }

  // Push final partial year
  if (yearPayments > 0) {
    const lastRec = schedule[schedule.length - 1];
    const deduction = Math.min(yearInterest, 2500) * (marginalRate / 100);
    yearSummaries.push({
      year: currentYear,
      startBalance: yearStart,
      payments: yearPayments,
      principal: yearPrincipal,
      interest: yearInterest,
      endBalance: lastRec?.endBalance ?? 0,
      taxDeduction: deduction,
    });
  }

  return {
    months: schedule.length,
    totalPayment,
    totalInterest,
    schedule,
    yearSummaries,
  };
}

/* ────────── Component ────────── */

export default function StudentLoanCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [balanceInput, setBalanceInput] = useState('35000');
  const [rateInput, setRateInput] = useState('5.5');
  const [paymentInput, setPaymentInput] = useState('400');
  const [loanType, setLoanType] = useState('federal');
  const [taxRateInput, setTaxRateInput] = useState('22');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('balance')) setBalanceInput(params.get('balance')!);
    if (params.get('rate')) setRateInput(params.get('rate')!);
    if (params.get('payment')) setPaymentInput(params.get('payment')!);
    if (params.get('type')) setLoanType(params.get('type')!);
    if (params.get('taxrate')) setTaxRateInput(params.get('taxrate')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (balanceInput && balanceInput !== '35000') params.set('balance', balanceInput);
    if (rateInput && rateInput !== '5.5') params.set('rate', rateInput);
    if (paymentInput && paymentInput !== '400') params.set('payment', paymentInput);
    if (loanType && loanType !== 'federal') params.set('type', loanType);
    if (taxRateInput && taxRateInput !== '22') params.set('taxrate', taxRateInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [balanceInput, rateInput, paymentInput, loanType, taxRateInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Parsed Values ─────────────────────────────────────────────────
  const balance = Number(balanceInput.replace(/[^0-9.]/g, '')) || 0;
  const rate = Number(rateInput.replace(/[^0-9.]/g, '')) || 0;
  const payment = Number(paymentInput.replace(/[^0-9.]/g, '')) || 0;
  const taxRate = Number(taxRateInput.replace(/[^0-9.]/g, '')) || 0;

  // ─── Monthly interest threshold ────────────────────────────────────
  const monthlyInterest = useMemo(() => {
    return balance * (rate / 100) / 12;
  }, [balance, rate]);

  const paymentTooLow = payment > 0 && payment <= monthlyInterest;

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<PayoffResult | null>(() => {
    if (balance <= 0 || rate < 0 || payment <= 0) return null;
    return simulatePayoff(balance, rate, payment, taxRate);
  }, [balance, rate, payment, taxRate]);

  // ─── Year 1 tax deduction ─────────────────────────────────────────
  const year1Deduction = useMemo(() => {
    if (!result || result.yearSummaries.length === 0) return 0;
    return result.yearSummaries[0].taxDeduction;
  }, [result]);

  // ─── "What If You Paid More" comparisons ──────────────────────────
  const comparisons = useMemo(() => {
    if (balance <= 0 || rate < 0 || payment <= 0) return null;

    const current = simulatePayoff(balance, rate, payment, taxRate);
    const plus50 = simulatePayoff(balance, rate, payment + 50, taxRate);
    const plus100 = simulatePayoff(balance, rate, payment + 100, taxRate);
    const plus200 = simulatePayoff(balance, rate, payment + 200, taxRate);

    return [
      { label: `Current (${formatCurrencyRound(payment)}/mo)`, result: current, saved: 0 },
      { label: `+$50 (${formatCurrencyRound(payment + 50)}/mo)`, result: plus50, saved: current.totalInterest - plus50.totalInterest },
      { label: `+$100 (${formatCurrencyRound(payment + 100)}/mo)`, result: plus100, saved: current.totalInterest - plus100.totalInterest },
      { label: `+$200 (${formatCurrencyRound(payment + 200)}/mo)`, result: plus200, saved: current.totalInterest - plus200.totalInterest },
    ];
  }, [balance, rate, payment, taxRate]);

  // ─── Display year rows: first 5 + last ─────────────────────────────
  const displayYears = useMemo(() => {
    if (!result) return [];
    const summaries = result.yearSummaries;
    if (summaries.length <= 6) return summaries;
    const first5 = summaries.slice(0, 5);
    const last = summaries[summaries.length - 1];
    return [...first5, last];
  }, [result]);

  const showYearGap = result ? result.yearSummaries.length > 6 : false;

  // ─── Breakdown bar percentages ─────────────────────────────────────
  const breakdownPct = useMemo(() => {
    if (!result || result.totalPayment <= 0) return { principal: 50, interest: 50 };
    const pPct = (balance / result.totalPayment) * 100;
    return { principal: pPct, interest: 100 - pPct };
  }, [result, balance]);

  // ─── Helper: months to years+months string ─────────────────────────
  function formatMonths(months: number): string {
    if (!isFinite(months)) return 'Never';
    const years = Math.floor(months / 12);
    const remaining = months % 12;
    if (years === 0) return `${remaining} month${remaining !== 1 ? 's' : ''}`;
    if (remaining === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} yr${years !== 1 ? 's' : ''}, ${remaining} mo`;
  }

  const loanTypeOptions = [
    { value: 'federal', label: 'Federal' },
    { value: 'private', label: 'Private' },
  ];

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
              id="balance"
              label="Loan Balance"
              value={balanceInput}
              onChange={setBalanceInput}
              prefix="$"
              placeholder="35,000"
              helpText="Your current outstanding loan balance"
            />

            <InputField
              id="rate"
              label="Interest Rate"
              value={rateInput}
              onChange={setRateInput}
              suffix="%"
              placeholder="5.5"
              helpText="Annual interest rate on your loan"
            />

            <InputField
              id="payment"
              label="Monthly Payment"
              value={paymentInput}
              onChange={setPaymentInput}
              prefix="$"
              placeholder="400"
              helpText="Fixed amount you plan to pay each month"
            />

            <SelectField
              id="type"
              label="Loan Type"
              value={loanType}
              onChange={setLoanType}
              options={loanTypeOptions}
              helpText="Federal loans may qualify for forgiveness programs"
            />

            <InputField
              id="taxrate"
              label="Estimated Marginal Tax Rate"
              value={taxRateInput}
              onChange={setTaxRateInput}
              suffix="%"
              placeholder="22"
              helpText="Used to estimate your student loan interest deduction savings"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <div className="space-y-6">
            {/* Warning if payment too low */}
            {paymentTooLow && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      Payment too low
                    </p>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      Your payment doesn't cover the monthly interest. Increase your payment above{' '}
                      <span className="font-semibold">{formatCurrency(Math.ceil(monthlyInterest * 100) / 100)}</span>{' '}
                      to start reducing your balance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hero card */}
            <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
              <p className="text-sm font-medium text-navy-200">Payoff Timeline</p>
              <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {isFinite(result.months) && result.months < 600
                  ? formatMonths(result.months)
                  : 'Never'}
              </p>
              {isFinite(result.months) && result.months < 600 && (
                <p className="tabular-nums mt-2 text-sm text-navy-300">
                  {formatCurrencyRound(result.totalInterest)} total interest at {formatCurrencyRound(payment)}/month
                </p>
              )}
            </div>

            {/* Breakdown bar */}
            {isFinite(result.totalPayment) && result.totalPayment > 0 && !paymentTooLow && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Payment Breakdown
                </p>
                <div className="flex h-4 overflow-hidden rounded-full">
                  <div
                    className="bg-navy-600 transition-all"
                    style={{ width: `${breakdownPct.principal}%` }}
                  />
                  <div
                    className="bg-patriot-500 transition-all"
                    style={{ width: `${breakdownPct.interest}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-navy-600" />
                    Principal: {formatCurrencyRound(balance)} ({breakdownPct.principal.toFixed(1)}%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-patriot-500" />
                    Interest: {formatCurrencyRound(result.totalInterest)} ({breakdownPct.interest.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Summary cards */}
            {isFinite(result.totalInterest) && !paymentTooLow && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Total Payment
                  </p>
                  <p className="tabular-nums mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrencyRound(result.totalPayment)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Total Interest
                  </p>
                  <p className="tabular-nums mt-1 text-2xl font-bold text-patriot-600 dark:text-patriot-400">
                    {formatCurrencyRound(result.totalInterest)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Interest Deduction Savings (Year 1)
                  </p>
                  <p className="tabular-nums mt-1 text-2xl font-bold text-success-600 dark:text-success-500">
                    {formatCurrencyRound(year1Deduction)}
                  </p>
                </div>
              </div>
            )}

            {/* What if you paid more table */}
            {comparisons && !paymentTooLow && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    What If You Paid More?
                  </h3>
                </div>
                <table className="tabular-nums w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
                        Payment
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                        Payoff Time
                      </th>
                      <th className="hidden px-4 py-2.5 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
                        Total Interest
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                        Savings vs Current
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {comparisons.map((row, i) => (
                      <tr
                        key={i}
                        className={i === 0 ? 'bg-navy-50/30 dark:bg-navy-900/10' : ''}
                      >
                        <td className={`px-4 py-2.5 text-slate-700 dark:text-slate-300 ${i === 0 ? 'font-semibold' : ''}`}>
                          {row.label}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                          {formatMonths(row.result.months)}
                        </td>
                        <td className="hidden px-4 py-2.5 text-right font-medium text-patriot-600 sm:table-cell dark:text-patriot-400">
                          {isFinite(row.result.totalInterest) ? formatCurrencyRound(row.result.totalInterest) : '--'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium">
                          {i === 0 ? (
                            <span className="text-slate-400">--</span>
                          ) : isFinite(row.saved) && row.saved > 0 ? (
                            <span className="text-success-600 dark:text-success-500">
                              {formatCurrencyRound(row.saved)}
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Year-by-year summary table */}
            {displayYears.length > 0 && !paymentTooLow && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Year-by-Year Summary
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="tabular-nums w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                        <th className="px-3 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Year</th>
                        <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Starting Balance</th>
                        <th className="hidden px-3 py-2.5 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">Payments</th>
                        <th className="hidden px-3 py-2.5 text-right font-medium text-slate-600 md:table-cell dark:text-slate-400">Principal</th>
                        <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Interest</th>
                        <th className="px-3 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Ending Balance</th>
                        <th className="hidden px-3 py-2.5 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">Tax Deduction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {displayYears.map((yr, i) => {
                        const isGapRow = showYearGap && i === 5;
                        return (
                          <>
                            {isGapRow && (
                              <tr key="gap">
                                <td colSpan={7} className="px-3 py-2 text-center text-xs text-slate-400 dark:text-slate-500">
                                  ...
                                </td>
                              </tr>
                            )}
                            <tr key={yr.year} className={i === 0 ? 'bg-navy-50/30 dark:bg-navy-900/10' : ''}>
                              <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-300">{yr.year}</td>
                              <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">{formatCurrencyRound(yr.startBalance)}</td>
                              <td className="hidden px-3 py-2.5 text-right text-slate-700 sm:table-cell dark:text-slate-300">{formatCurrencyRound(yr.payments)}</td>
                              <td className="hidden px-3 py-2.5 text-right text-slate-700 md:table-cell dark:text-slate-300">{formatCurrencyRound(yr.principal)}</td>
                              <td className="px-3 py-2.5 text-right text-patriot-600 dark:text-patriot-400">{formatCurrencyRound(yr.interest)}</td>
                              <td className="px-3 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrencyRound(yr.endBalance)}</td>
                              <td className="hidden px-3 py-2.5 text-right text-success-600 sm:table-cell dark:text-success-500">{formatCurrencyRound(yr.taxDeduction)}</td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Note about phase-out */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Note:</span>{' '}
                The student loan interest deduction (up to $2,500/year) phases out at MAGI $80,000 - $95,000 (single)
                or $165,000 - $195,000 (married filing jointly). This calculator does not apply the phase-out --
                actual savings may be lower if your income is within or above these ranges.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your student loan details to see your payoff plan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
