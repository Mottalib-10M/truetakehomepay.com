import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';

// ─── Types ──────────────────────────────────────────────────────────────

interface DebtInput {
  balance: string;
  apr: string;
  payment: string;
}

interface DebtResult {
  label: string;
  balance: number;
  apr: number;
  payment: number;
  months: number;
  totalInterest: number;
  totalPayment: number;
}

interface ConsolidationResult {
  totalBalance: number;
  newApr: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

// ─── Debt Payoff Simulation ─────────────────────────────────────────────

function simulateDebtPayoff(balance: number, aprPercent: number, monthlyPayment: number): {
  months: number;
  totalInterest: number;
  totalPayment: number;
} {
  if (balance <= 0 || monthlyPayment <= 0) {
    return { months: 0, totalInterest: 0, totalPayment: 0 };
  }

  const monthlyRate = aprPercent / 100 / 12;
  let remaining = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;
  const maxMonths = 600; // 50-year safety cap

  while (remaining > 0.005 && months < maxMonths) {
    months++;
    const interest = remaining * monthlyRate;
    totalInterest += interest;

    const payment = Math.min(monthlyPayment, remaining + interest);
    const principal = payment - interest;

    if (principal <= 0) {
      // Payment doesn't cover interest
      return { months: Infinity, totalInterest: Infinity, totalPayment: Infinity };
    }

    totalPaid += payment;
    remaining -= principal;
  }

  if (remaining > 0.005) {
    return { months: Infinity, totalInterest: Infinity, totalPayment: Infinity };
  }

  return { months, totalInterest, totalPayment: totalPaid };
}

// ─── Consolidation Loan Calculation ─────────────────────────────────────

function calculateConsolidationLoan(
  totalBalance: number,
  aprPercent: number,
  termMonths: number,
): ConsolidationResult {
  if (totalBalance <= 0 || termMonths <= 0) {
    return { totalBalance: 0, newApr: aprPercent, termMonths, monthlyPayment: 0, totalInterest: 0, totalPayment: 0 };
  }

  const monthlyRate = aprPercent / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = totalBalance / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = totalBalance * (monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - totalBalance;

  return {
    totalBalance,
    newApr: aprPercent,
    termMonths,
    monthlyPayment,
    totalInterest,
    totalPayment,
  };
}

// ─── Helper ─────────────────────────────────────────────────────────────

function formatMonths(months: number): string {
  if (!isFinite(months)) return 'Never';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr${years !== 1 ? 's' : ''}`;
  return `${years} yr${years !== 1 ? 's' : ''}, ${rem} mo`;
}

function parseNum(val: string): number {
  return Number(val.replace(/[^0-9.]/g, '')) || 0;
}

// ─── Defaults ───────────────────────────────────────────────────────────

const DEFAULTS: Record<string, string> = {
  b1: '5000', r1: '22.99', p1: '150',
  b2: '3000', r2: '19.99', p2: '100',
  b3: '0', r3: '0', p3: '0',
  cr: '8.5', ct: '48',
};

// ─── Main Component ─────────────────────────────────────────────────────

export default function DebtConsolidationCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [debt1, setDebt1] = useState<DebtInput>({ balance: DEFAULTS.b1, apr: DEFAULTS.r1, payment: DEFAULTS.p1 });
  const [debt2, setDebt2] = useState<DebtInput>({ balance: DEFAULTS.b2, apr: DEFAULTS.r2, payment: DEFAULTS.p2 });
  const [debt3, setDebt3] = useState<DebtInput>({ balance: DEFAULTS.b3, apr: DEFAULTS.r3, payment: DEFAULTS.p3 });
  const [consolRate, setConsolRate] = useState(DEFAULTS.cr);
  const [consolTerm, setConsolTerm] = useState(DEFAULTS.ct);

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('b1') || params.get('r1') || params.get('p1')) {
      setDebt1({
        balance: params.get('b1') || DEFAULTS.b1,
        apr: params.get('r1') || DEFAULTS.r1,
        payment: params.get('p1') || DEFAULTS.p1,
      });
    }
    if (params.get('b2') || params.get('r2') || params.get('p2')) {
      setDebt2({
        balance: params.get('b2') || DEFAULTS.b2,
        apr: params.get('r2') || DEFAULTS.r2,
        payment: params.get('p2') || DEFAULTS.p2,
      });
    }
    if (params.get('b3') || params.get('r3') || params.get('p3')) {
      setDebt3({
        balance: params.get('b3') || DEFAULTS.b3,
        apr: params.get('r3') || DEFAULTS.r3,
        payment: params.get('p3') || DEFAULTS.p3,
      });
    }
    if (params.get('cr')) setConsolRate(params.get('cr')!);
    if (params.get('ct')) setConsolTerm(params.get('ct')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debt1.balance !== DEFAULTS.b1) params.set('b1', debt1.balance);
    if (debt1.apr !== DEFAULTS.r1) params.set('r1', debt1.apr);
    if (debt1.payment !== DEFAULTS.p1) params.set('p1', debt1.payment);
    if (debt2.balance !== DEFAULTS.b2) params.set('b2', debt2.balance);
    if (debt2.apr !== DEFAULTS.r2) params.set('r2', debt2.apr);
    if (debt2.payment !== DEFAULTS.p2) params.set('p2', debt2.payment);
    if (debt3.balance !== DEFAULTS.b3) params.set('b3', debt3.balance);
    if (debt3.apr !== DEFAULTS.r3) params.set('r3', debt3.apr);
    if (debt3.payment !== DEFAULTS.p3) params.set('p3', debt3.payment);
    if (consolRate !== DEFAULTS.cr) params.set('cr', consolRate);
    if (consolTerm !== DEFAULTS.ct) params.set('ct', consolTerm);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [debt1, debt2, debt3, consolRate, consolTerm]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Updaters ─────────────────────────────────────────────────────
  const updateDebt1 = useCallback((field: keyof DebtInput, val: string) => {
    setDebt1((prev) => ({ ...prev, [field]: val }));
  }, []);
  const updateDebt2 = useCallback((field: keyof DebtInput, val: string) => {
    setDebt2((prev) => ({ ...prev, [field]: val }));
  }, []);
  const updateDebt3 = useCallback((field: keyof DebtInput, val: string) => {
    setDebt3((prev) => ({ ...prev, [field]: val }));
  }, []);

  // ─── Parsed Values ───────────────────────────────────────────────
  const debts = useMemo(() => {
    const raw = [
      { label: 'Debt 1', ...debt1 },
      { label: 'Debt 2', ...debt2 },
      { label: 'Debt 3', ...debt3 },
    ];

    return raw
      .map((d) => ({
        label: d.label,
        balance: parseNum(d.balance),
        apr: parseNum(d.apr),
        payment: parseNum(d.payment),
      }))
      .filter((d) => d.balance > 0);
  }, [debt1, debt2, debt3]);

  // ─── Current Debts Calculation ────────────────────────────────────
  const debtResults = useMemo<DebtResult[]>(() => {
    return debts.map((d) => {
      const result = simulateDebtPayoff(d.balance, d.apr, d.payment);
      return {
        label: d.label,
        balance: d.balance,
        apr: d.apr,
        payment: d.payment,
        months: result.months,
        totalInterest: result.totalInterest,
        totalPayment: result.totalPayment,
      };
    });
  }, [debts]);

  // ─── Totals for Current Debts ─────────────────────────────────────
  const currentTotals = useMemo(() => {
    const totalBalance = debtResults.reduce((s, d) => s + d.balance, 0);
    const totalMonthlyPayment = debtResults.reduce((s, d) => s + d.payment, 0);
    const totalInterest = debtResults.reduce((s, d) => s + d.totalInterest, 0);
    const totalPayment = debtResults.reduce((s, d) => s + d.totalPayment, 0);
    const maxMonths = debtResults.reduce((m, d) => Math.max(m, d.months), 0);

    return { totalBalance, totalMonthlyPayment, totalInterest, totalPayment, maxMonths };
  }, [debtResults]);

  // ─── Consolidation Calculation ────────────────────────────────────
  const consolidation = useMemo<ConsolidationResult | null>(() => {
    if (currentTotals.totalBalance <= 0) return null;
    const rate = parseNum(consolRate);
    const term = Math.round(parseNum(consolTerm));
    if (term <= 0) return null;
    return calculateConsolidationLoan(currentTotals.totalBalance, rate, term);
  }, [currentTotals.totalBalance, consolRate, consolTerm]);

  // ─── Savings ──────────────────────────────────────────────────────
  const savings = useMemo(() => {
    if (!consolidation || !isFinite(currentTotals.totalInterest)) return null;
    const interestSaved = currentTotals.totalInterest - consolidation.totalInterest;
    const paymentSaved = currentTotals.totalPayment - consolidation.totalPayment;
    return { interestSaved, paymentSaved };
  }, [consolidation, currentTotals]);

  const hasResults = debtResults.length > 0 && consolidation;
  const showDebt2 = parseNum(debt1.balance) > 0;
  const showDebt3 = parseNum(debt2.balance) > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        {/* Debt 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Debt 1
          </h2>
          <div className="space-y-4">
            <InputField
              id="b1"
              label="Balance"
              value={debt1.balance}
              onChange={(v) => updateDebt1('balance', v)}
              prefix="$"
              placeholder="5,000"
            />
            <InputField
              id="r1"
              label="APR"
              value={debt1.apr}
              onChange={(v) => updateDebt1('apr', v)}
              suffix="%"
              placeholder="22.99"
            />
            <InputField
              id="p1"
              label="Monthly Payment"
              value={debt1.payment}
              onChange={(v) => updateDebt1('payment', v)}
              prefix="$"
              placeholder="150"
            />
          </div>
        </div>

        {/* Debt 2 */}
        {showDebt2 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Debt 2
              <span className="ml-2 text-sm font-normal text-slate-400">(optional)</span>
            </h2>
            <div className="space-y-4">
              <InputField
                id="b2"
                label="Balance"
                value={debt2.balance}
                onChange={(v) => updateDebt2('balance', v)}
                prefix="$"
                placeholder="3,000"
              />
              <InputField
                id="r2"
                label="APR"
                value={debt2.apr}
                onChange={(v) => updateDebt2('apr', v)}
                suffix="%"
                placeholder="19.99"
              />
              <InputField
                id="p2"
                label="Monthly Payment"
                value={debt2.payment}
                onChange={(v) => updateDebt2('payment', v)}
                prefix="$"
                placeholder="100"
              />
            </div>
          </div>
        )}

        {/* Debt 3 */}
        {showDebt3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Debt 3
              <span className="ml-2 text-sm font-normal text-slate-400">(optional)</span>
            </h2>
            <div className="space-y-4">
              <InputField
                id="b3"
                label="Balance"
                value={debt3.balance}
                onChange={(v) => updateDebt3('balance', v)}
                prefix="$"
                placeholder="0"
              />
              <InputField
                id="r3"
                label="APR"
                value={debt3.apr}
                onChange={(v) => updateDebt3('apr', v)}
                suffix="%"
                placeholder="0"
              />
              <InputField
                id="p3"
                label="Monthly Payment"
                value={debt3.payment}
                onChange={(v) => updateDebt3('payment', v)}
                prefix="$"
                placeholder="0"
              />
            </div>
          </div>
        )}

        {/* Consolidation Loan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Consolidation Loan
          </h2>
          <div className="space-y-4">
            <InputField
              id="cr"
              label="Consolidation APR"
              value={consolRate}
              onChange={setConsolRate}
              suffix="%"
              placeholder="8.5"
              helpText="Interest rate offered on the consolidation loan"
            />
            <InputField
              id="ct"
              label="Loan Term"
              value={consolTerm}
              onChange={setConsolTerm}
              suffix="mo"
              placeholder="48"
              helpText="Repayment period in months"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {hasResults && savings ? (
          <div className="space-y-6">
            {/* Hero card */}
            {savings.interestSaved > 0 ? (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-center text-white shadow-lg">
                <p className="text-sm font-medium text-emerald-100">Potential Interest Savings</p>
                <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                  {formatCurrencyRound(savings.interestSaved)}
                </p>
                <p className="mt-2 text-sm text-emerald-200">
                  You could save {formatCurrencyRound(savings.interestSaved)} in interest by consolidating
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-center text-white shadow-lg">
                <p className="text-sm font-medium text-amber-100">Consolidation Costs More</p>
                <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                  {formatCurrencyRound(Math.abs(savings.interestSaved))}
                </p>
                <p className="mt-2 text-sm text-amber-200">
                  Consolidation would cost {formatCurrencyRound(Math.abs(savings.interestSaved))} more in interest
                </p>
              </div>
            )}

            {/* Current debts table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Current Debts
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="tabular-nums w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Debt</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Balance</th>
                      <th className="hidden px-4 py-2.5 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">APR</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Payment</th>
                      <th className="hidden px-4 py-2.5 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">Payoff</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Interest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {debtResults.map((d) => (
                      <tr key={d.label}>
                        <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{d.label}</td>
                        <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">{formatCurrencyRound(d.balance)}</td>
                        <td className="hidden px-4 py-2.5 text-right text-slate-900 sm:table-cell dark:text-slate-100">{d.apr}%</td>
                        <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">{formatCurrencyRound(d.payment)}</td>
                        <td className="hidden px-4 py-2.5 text-right text-slate-900 sm:table-cell dark:text-slate-100">{formatMonths(d.months)}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-patriot-600 dark:text-patriot-400">
                          {isFinite(d.totalInterest) ? formatCurrencyRound(d.totalInterest) : '--'}
                        </td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="border-t-2 border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Total</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-white">{formatCurrencyRound(currentTotals.totalBalance)}</td>
                      <td className="hidden px-4 py-2.5 sm:table-cell" />
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-white">{formatCurrencyRound(currentTotals.totalMonthlyPayment)}</td>
                      <td className="hidden px-4 py-2.5 text-right font-semibold text-slate-900 sm:table-cell dark:text-white">
                        {isFinite(currentTotals.maxMonths) ? formatMonths(currentTotals.maxMonths) : '--'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-patriot-600 dark:text-patriot-400">
                        {isFinite(currentTotals.totalInterest) ? formatCurrencyRound(currentTotals.totalInterest) : '--'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consolidated loan summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
              <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                Consolidated Loan Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Balance</p>
                  <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrencyRound(consolidation.totalBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">New APR</p>
                  <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {consolidation.newApr}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Payment</p>
                  <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(consolidation.monthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Payoff Time</p>
                  <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {formatMonths(consolidation.termMonths)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Interest</p>
                  <p className="tabular-nums mt-1 text-lg font-bold text-patriot-600 dark:text-patriot-400">
                    {formatCurrencyRound(consolidation.totalInterest)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Payment</p>
                  <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrencyRound(consolidation.totalPayment)}
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Side-by-Side Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="tabular-nums w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">Metric</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Current Debts</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Consolidated</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">Monthly Payment</td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                        {formatCurrencyRound(currentTotals.totalMonthlyPayment)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                        {formatCurrency(consolidation.monthlyPayment)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        <DiffValue value={currentTotals.totalMonthlyPayment - consolidation.monthlyPayment} />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">Total Interest</td>
                      <td className="px-4 py-2.5 text-right text-patriot-600 dark:text-patriot-400">
                        {isFinite(currentTotals.totalInterest) ? formatCurrencyRound(currentTotals.totalInterest) : '--'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-patriot-600 dark:text-patriot-400">
                        {formatCurrencyRound(consolidation.totalInterest)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {isFinite(savings.interestSaved) ? <DiffValue value={savings.interestSaved} /> : '--'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">Total Payment</td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                        {isFinite(currentTotals.totalPayment) ? formatCurrencyRound(currentTotals.totalPayment) : '--'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                        {formatCurrencyRound(consolidation.totalPayment)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {isFinite(savings.paymentSaved) ? <DiffValue value={savings.paymentSaved} /> : '--'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">Payoff Time</td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                        {isFinite(currentTotals.maxMonths) ? formatMonths(currentTotals.maxMonths) : '--'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                        {formatMonths(consolidation.termMonths)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {isFinite(currentTotals.maxMonths) ? (
                          <span className={currentTotals.maxMonths - consolidation.termMonths > 0 ? 'text-success-600 dark:text-success-500' : currentTotals.maxMonths - consolidation.termMonths < 0 ? 'text-patriot-600 dark:text-patriot-400' : 'text-slate-400'}>
                            {currentTotals.maxMonths - consolidation.termMonths > 0 ? '' : ''}
                            {formatMonths(Math.abs(currentTotals.maxMonths - consolidation.termMonths))}
                            {currentTotals.maxMonths - consolidation.termMonths > 0 ? ' faster' : currentTotals.maxMonths - consolidation.termMonths < 0 ? ' longer' : ''}
                          </span>
                        ) : '--'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Note:</span>{' '}
                Consolidation makes sense when the new rate is significantly lower than your current weighted average rate. Consider origination fees (typically 1-5% of the loan amount) which are not included in this estimate. Always compare the total cost of both options before deciding.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your debt details to see your consolidation comparison
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Diff Value Helper ──────────────────────────────────────────────────

function DiffValue({ value }: { value: number }) {
  if (Math.abs(value) < 1) {
    return <span className="text-slate-400">--</span>;
  }
  if (value > 0) {
    return (
      <span className="text-success-600 dark:text-success-500">
        Save {formatCurrencyRound(value)}
      </span>
    );
  }
  return (
    <span className="text-patriot-600 dark:text-patriot-400">
      +{formatCurrencyRound(Math.abs(value))} more
    </span>
  );
}
