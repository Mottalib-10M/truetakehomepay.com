import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateCreditCardPayoff, type CreditCardPayoffResult } from '../../lib/finance-engine';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';

export default function CreditCardPayoffCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [balanceInput, setBalanceInput] = useState('5000');
  const [aprInput, setAprInput] = useState('22.99');
  const [paymentInput, setPaymentInput] = useState('200');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('balance')) setBalanceInput(params.get('balance')!);
    if (params.get('apr')) setAprInput(params.get('apr')!);
    if (params.get('payment')) setPaymentInput(params.get('payment')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (balanceInput && balanceInput !== '5000') params.set('balance', balanceInput);
    if (aprInput && aprInput !== '22.99') params.set('apr', aprInput);
    if (paymentInput && paymentInput !== '200') params.set('payment', paymentInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [balanceInput, aprInput, paymentInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Parsed Values ─────────────────────────────────────────────────
  const balance = Number(balanceInput.replace(/[^0-9.]/g, '')) || 0;
  const apr = Number(aprInput.replace(/[^0-9.]/g, '')) || 0;
  const payment = Number(paymentInput.replace(/[^0-9.]/g, '')) || 0;

  // ─── Minimum Payment Calculation ───────────────────────────────────
  const minimumPayment = useMemo(() => {
    if (balance <= 0) return 0;
    const monthlyInterest = balance * (apr / 100) / 12;
    const calcMin = balance * 0.01 + monthlyInterest;
    return Math.max(25, Math.ceil(calcMin * 100) / 100);
  }, [balance, apr]);

  // ─── Monthly interest threshold ────────────────────────────────────
  const monthlyInterest = useMemo(() => {
    return balance * (apr / 100) / 12;
  }, [balance, apr]);

  const paymentTooLow = payment > 0 && payment <= monthlyInterest;

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<CreditCardPayoffResult | null>(() => {
    if (balance <= 0 || apr < 0 || payment <= 0) return null;
    return calculateCreditCardPayoff(balance, apr / 100, payment);
  }, [balance, apr, payment]);

  // ─── Comparison Scenarios ──────────────────────────────────────────
  const comparisons = useMemo(() => {
    if (balance <= 0 || apr < 0 || payment <= 0) return null;

    const rate = apr / 100;
    const current = calculateCreditCardPayoff(balance, rate, payment);
    const plus50 = calculateCreditCardPayoff(balance, rate, payment + 50);
    const plus100 = calculateCreditCardPayoff(balance, rate, payment + 100);
    const doubled = calculateCreditCardPayoff(balance, rate, payment * 2);

    return [
      {
        label: `Current (${formatCurrencyRound(payment)}/mo)`,
        result: current,
        saved: 0,
      },
      {
        label: `+$50 (${formatCurrencyRound(payment + 50)}/mo)`,
        result: plus50,
        saved: current.totalInterest - plus50.totalInterest,
      },
      {
        label: `+$100 (${formatCurrencyRound(payment + 100)}/mo)`,
        result: plus100,
        saved: current.totalInterest - plus100.totalInterest,
      },
      {
        label: `Double (${formatCurrencyRound(payment * 2)}/mo)`,
        result: doubled,
        saved: current.totalInterest - doubled.totalInterest,
      },
    ];
  }, [balance, apr, payment]);

  // ─── Helper: months to years+months string ─────────────────────────
  function formatMonths(months: number): string {
    if (!isFinite(months)) return 'Never';
    const years = Math.floor(months / 12);
    const remaining = months % 12;
    if (years === 0) return `${remaining} month${remaining !== 1 ? 's' : ''}`;
    if (remaining === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} yr${years !== 1 ? 's' : ''}, ${remaining} mo`;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Credit Card Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="balance"
              label="Credit Card Balance"
              value={balanceInput}
              onChange={setBalanceInput}
              prefix="$"
              placeholder="5,000"
              helpText="Your current outstanding balance"
            />

            <InputField
              id="apr"
              label="Annual Interest Rate (APR)"
              value={aprInput}
              onChange={setAprInput}
              suffix="%"
              placeholder="22.99"
              helpText="Check your card statement for your APR"
            />

            <InputField
              id="payment"
              label="Monthly Payment"
              value={paymentInput}
              onChange={setPaymentInput}
              prefix="$"
              placeholder="200"
              helpText="Fixed amount you plan to pay each month"
            />
          </div>

          {/* Minimum Payment Info */}
          {balance > 0 && apr > 0 && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Minimum Payment Estimate
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {formatCurrency(minimumPayment)}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/month</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Typically 1% of balance + monthly interest (min $25). Paying only the minimum keeps you in debt for years.
              </p>
            </div>
          )}
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

            {/* Big hero number */}
            <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
              <p className="text-sm font-medium text-navy-200">Time to Pay Off</p>
              <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {isFinite(result.monthsToPayoff)
                  ? formatMonths(result.monthsToPayoff)
                  : 'Never'}
              </p>
              {isFinite(result.monthsToPayoff) && (
                <p className="tabular-nums mt-2 text-sm text-navy-300">
                  {formatNumber(result.monthsToPayoff)} total months at {formatCurrencyRound(payment)}/month
                </p>
              )}
            </div>

            {/* Summary stats */}
            {isFinite(result.totalInterest) && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Total Interest Paid
                  </p>
                  <p className="tabular-nums mt-1 text-2xl font-bold text-patriot-600 dark:text-patriot-400">
                    {formatCurrencyRound(result.totalInterest)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {balance > 0 ? `${((result.totalInterest / balance) * 100).toFixed(0)}% of your original balance` : ''}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Total Amount Paid
                  </p>
                  <p className="tabular-nums mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrencyRound(result.totalPayment)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatCurrencyRound(balance)} principal + {formatCurrencyRound(result.totalInterest)} interest
                  </p>
                </div>
              </div>
            )}

            {/* Comparison table */}
            {comparisons && !paymentTooLow && (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    What if you paid more?
                  </h3>
                </div>
                <table className="tabular-nums w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
                        Payment
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                        Time
                      </th>
                      <th className="hidden px-4 py-2.5 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
                        Total Interest
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                        Interest Saved
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
                          {formatMonths(row.result.monthsToPayoff)}
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
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your credit card details to see your payoff plan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
