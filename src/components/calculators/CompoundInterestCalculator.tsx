import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateCompoundInterest, type CompoundInterestResult } from '../../lib/finance-engine';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Compounding Frequency Options ────────────────────────────────────
const COMPOUNDING_OPTIONS = [
  { value: '365', label: 'Daily (365x/year)' },
  { value: '12', label: 'Monthly (12x/year)' },
  { value: '4', label: 'Quarterly (4x/year)' },
  { value: '1', label: 'Annually (1x/year)' },
];

export default function CompoundInterestCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [principalInput, setPrincipalInput] = useState('10000');
  const [monthlyInput, setMonthlyInput] = useState('500');
  const [rateInput, setRateInput] = useState('7');
  const [yearsInput, setYearsInput] = useState('20');
  const [compoundingFreq, setCompoundingFreq] = useState('12');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('principal')) setPrincipalInput(params.get('principal')!);
    if (params.get('monthly')) setMonthlyInput(params.get('monthly')!);
    if (params.get('rate')) setRateInput(params.get('rate')!);
    if (params.get('years')) setYearsInput(params.get('years')!);
    if (params.get('freq')) setCompoundingFreq(params.get('freq')!);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (principalInput && principalInput !== '10000') params.set('principal', principalInput);
    if (monthlyInput && monthlyInput !== '500') params.set('monthly', monthlyInput);
    if (rateInput && rateInput !== '7') params.set('rate', rateInput);
    if (yearsInput && yearsInput !== '20') params.set('years', yearsInput);
    if (compoundingFreq !== '12') params.set('freq', compoundingFreq);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [principalInput, monthlyInput, rateInput, yearsInput, compoundingFreq]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<CompoundInterestResult | null>(() => {
    const principal = Number(principalInput.replace(/[^0-9.]/g, ''));
    const monthly = Number(monthlyInput.replace(/[^0-9.]/g, ''));
    const rate = Number(rateInput.replace(/[^0-9.]/g, ''));
    const years = Number(yearsInput.replace(/[^0-9.]/g, ''));

    if (isNaN(principal) || isNaN(monthly) || isNaN(rate) || isNaN(years)) return null;
    if (principal < 0 || monthly < 0 || rate < 0 || years <= 0) return null;
    if (principal === 0 && monthly === 0) return null;
    if (years > 100) return null;

    return calculateCompoundInterest(
      principal,
      monthly,
      rate / 100,
      Math.floor(years),
      Number(compoundingFreq)
    );
  }, [principalInput, monthlyInput, rateInput, yearsInput, compoundingFreq]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Investment Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="principal"
              label="Initial Investment"
              value={principalInput}
              onChange={setPrincipalInput}
              prefix="$"
              placeholder="10,000"
              helpText="Your starting amount (lump sum)"
            />

            <InputField
              id="monthly-contribution"
              label="Monthly Contribution"
              value={monthlyInput}
              onChange={setMonthlyInput}
              prefix="$"
              placeholder="500"
              helpText="Amount you add every month"
            />

            <InputField
              id="annual-rate"
              label="Annual Interest Rate"
              value={rateInput}
              onChange={setRateInput}
              suffix="%"
              placeholder="7"
              helpText="Expected annual return (S&P 500 avg ~10%)"
            />

            <InputField
              id="time-period"
              label="Time Period"
              value={yearsInput}
              onChange={setYearsInput}
              suffix="years"
              placeholder="20"
              helpText="How long you plan to invest"
            />

            <SelectField
              id="compounding-frequency"
              label="Compounding Frequency"
              value={compoundingFreq}
              onChange={setCompoundingFreq}
              options={COMPOUNDING_OPTIONS}
              helpText="How often interest is calculated and added"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <ResultSection result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your investment details to see projected growth
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────

function ResultSection({ result }: { result: CompoundInterestResult }) {
  const { finalValue, totalContributions, totalInterest, yearlyBreakdown } = result;

  const contributionsPct = finalValue > 0 ? (totalContributions / finalValue) * 100 : 0;
  const interestPct = finalValue > 0 ? (totalInterest / finalValue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Big hero number */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Final Balance</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(finalValue)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          after {yearlyBreakdown.length} {yearlyBreakdown.length === 1 ? 'year' : 'years'} of growth
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Contributions
          </p>
          <p className="tabular-nums mt-1 text-xl font-bold text-sky-600 dark:text-sky-400">
            {formatCurrencyRound(totalContributions)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Interest Earned
          </p>
          <p className="tabular-nums mt-1 text-xl font-bold text-success-600 dark:text-success-500">
            {formatCurrencyRound(totalInterest)}
          </p>
        </div>
      </div>

      {/* Breakdown bar */}
      <BreakdownBar
        totalContributions={totalContributions}
        totalInterest={totalInterest}
        contributionsPct={contributionsPct}
        interestPct={interestPct}
      />

      {/* Year-by-year table */}
      <GrowthTable yearlyBreakdown={yearlyBreakdown} />
    </div>
  );
}

// ─── Breakdown Bar ────────────────────────────────────────────────────

function BreakdownBar({
  totalContributions,
  totalInterest,
  contributionsPct,
  interestPct,
}: {
  totalContributions: number;
  totalInterest: number;
  contributionsPct: number;
  interestPct: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        <div
          className="bg-sky-400 transition-all duration-300"
          style={{ width: `${contributionsPct}%` }}
          title={`Contributions: ${formatCurrencyRound(totalContributions)}`}
        />
        <div
          className="bg-success-500 transition-all duration-300"
          style={{ width: `${interestPct}%` }}
          title={`Interest: ${formatCurrencyRound(totalInterest)}`}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Contributions: {formatCurrencyRound(totalContributions)} ({contributionsPct.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Interest: {formatCurrencyRound(totalInterest)} ({interestPct.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Growth Table ─────────────────────────────────────────────────────

function GrowthTable({
  yearlyBreakdown,
}: {
  yearlyBreakdown: CompoundInterestResult['yearlyBreakdown'];
}) {
  const totalYears = yearlyBreakdown.length;
  const showEllipsis = totalYears > 15;

  // If more than 15 years, show first 5 and last 5
  const visibleRows = showEllipsis
    ? [...yearlyBreakdown.slice(0, 5), null, ...yearlyBreakdown.slice(-5)]
    : yearlyBreakdown;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="tabular-nums w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
              Year
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
              Balance
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
              Contributions
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
              Interest
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {visibleRows.map((row, idx) => {
            if (row === null) {
              return (
                <tr key="ellipsis">
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-center text-slate-400 dark:text-slate-500"
                  >
                    ...
                  </td>
                </tr>
              );
            }

            const isLast = idx === visibleRows.length - 1;

            return (
              <tr
                key={row.year}
                className={isLast ? 'bg-success-50/50 dark:bg-success-900/10' : ''}
              >
                <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                  {row.year}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-semibold ${
                    isLast
                      ? 'text-success-600 dark:text-success-500'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {formatCurrencyRound(row.balance)}
                </td>
                <td className="hidden px-4 py-2.5 text-right font-medium text-sky-600 sm:table-cell dark:text-sky-400">
                  {formatCurrencyRound(row.contributions)}
                </td>
                <td className="hidden px-4 py-2.5 text-right font-medium text-success-600 sm:table-cell dark:text-success-500">
                  {formatCurrencyRound(row.interest)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
