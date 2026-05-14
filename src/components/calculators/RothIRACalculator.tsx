import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrencyRound } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants (2026) ──────────────────────────────────────────────────
const ROTH_IRA_LIMIT = 7000;
const ROTH_IRA_CATCHUP = 1000; // age 50+
const ESTIMATED_TAX_RATE = 0.22; // for tax savings estimate

// Income phase-out ranges (2026)
// Single: $150,000 - $165,000 MAGI
// MFJ:    $236,000 - $246,000 MAGI

const AGE50_OPTIONS = [
  { value: 'no', label: 'No (under 50)' },
  { value: 'yes', label: 'Yes (50 or older)' },
];

// ─── Types ─────────────────────────────────────────────────────────────
interface YearRow {
  year: number;
  contribution: number;
  balance: number;
  growth: number;
}

interface RothResult {
  projectedBalance: number;
  totalContributions: number;
  investmentGrowth: number;
  taxSavings: number;
  yearlyBreakdown: YearRow[];
}

export default function RothIRACalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [balanceInput, setBalanceInput] = useState('15000');
  const [contribInput, setContribInput] = useState('7000');
  const [returnInput, setReturnInput] = useState('7');
  const [yearsInput, setYearsInput] = useState('30');
  const [age50, setAge50] = useState('no');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('balance')) setBalanceInput(params.get('balance')!);
    if (params.get('contrib')) setContribInput(params.get('contrib')!);
    if (params.get('return')) setReturnInput(params.get('return')!);
    if (params.get('years')) setYearsInput(params.get('years')!);
    if (params.get('age50')) setAge50(params.get('age50')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (balanceInput && balanceInput !== '15000') params.set('balance', balanceInput);
    if (contribInput && contribInput !== '7000') params.set('contrib', contribInput);
    if (returnInput && returnInput !== '7') params.set('return', returnInput);
    if (yearsInput && yearsInput !== '30') params.set('years', yearsInput);
    if (age50 !== 'no') params.set('age50', age50);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [balanceInput, contribInput, returnInput, yearsInput, age50]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<RothResult | null>(() => {
    const balance = Number(balanceInput.replace(/[^0-9.]/g, ''));
    const contrib = Number(contribInput.replace(/[^0-9.]/g, ''));
    const annualReturn = Number(returnInput.replace(/[^0-9.]/g, ''));
    const numYears = Math.round(Number(yearsInput.replace(/[^0-9.]/g, '')));

    if (isNaN(balance) || balance < 0) return null;
    if (isNaN(contrib) || contrib < 0) return null;
    if (isNaN(annualReturn) || annualReturn < 0) return null;
    if (isNaN(numYears) || numYears <= 0 || numYears > 100) return null;
    if (balance === 0 && contrib === 0) return null;

    const maxContrib = age50 === 'yes' ? ROTH_IRA_LIMIT + ROTH_IRA_CATCHUP : ROTH_IRA_LIMIT;
    const effectiveContrib = Math.min(contrib, maxContrib);
    const rate = annualReturn / 100;

    const yearlyBreakdown: YearRow[] = [];
    let currentBalance = balance;
    let totalContributed = 0;

    for (let yr = 1; yr <= numYears; yr++) {
      const startBalance = currentBalance;
      currentBalance = (currentBalance + effectiveContrib) * (1 + rate);
      totalContributed += effectiveContrib;
      const growthThisYear = currentBalance - startBalance - effectiveContrib;

      yearlyBreakdown.push({
        year: yr,
        contribution: effectiveContrib,
        balance: currentBalance,
        growth: growthThisYear,
      });
    }

    const totalContributions = balance + totalContributed;
    const investmentGrowth = currentBalance - totalContributions;
    const taxSavings = investmentGrowth * ESTIMATED_TAX_RATE;

    return {
      projectedBalance: currentBalance,
      totalContributions,
      investmentGrowth,
      taxSavings,
      yearlyBreakdown,
    };
  }, [balanceInput, contribInput, returnInput, yearsInput, age50]);

  // ─── Contribution limit help text ─────────────────────────────────
  const contribHelpText =
    age50 === 'yes'
      ? `2026 limit: $${(ROTH_IRA_LIMIT + ROTH_IRA_CATCHUP).toLocaleString()} (includes $${ROTH_IRA_CATCHUP.toLocaleString()} catch-up)`
      : `2026 limit: $${ROTH_IRA_LIMIT.toLocaleString()} (under age 50)`;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Roth IRA Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="roth-balance"
              label="Current Roth IRA Balance"
              value={balanceInput}
              onChange={setBalanceInput}
              prefix="$"
              placeholder="15,000"
              helpText="Your current Roth IRA account balance"
            />

            <InputField
              id="annual-contribution"
              label="Annual Contribution"
              value={contribInput}
              onChange={setContribInput}
              prefix="$"
              placeholder="7,000"
              helpText={contribHelpText}
            />

            <InputField
              id="expected-return"
              label="Expected Annual Return"
              value={returnInput}
              onChange={setReturnInput}
              suffix="%"
              placeholder="7"
              helpText="Average yearly return before inflation (S&P 500 avg ~10%)"
            />

            <InputField
              id="years-to-retirement"
              label="Years Until Retirement"
              value={yearsInput}
              onChange={setYearsInput}
              suffix="years"
              placeholder="30"
              helpText="How many years until you plan to retire"
            />

            <SelectField
              id="age-50-plus"
              label="Age 50 or Older?"
              value={age50}
              onChange={setAge50}
              options={AGE50_OPTIONS}
              helpText="Catch-up contributions available at age 50+"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <ResultSection result={result} years={yearsInput} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your Roth IRA details to see projected growth
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────

function ResultSection({ result, years }: { result: RothResult; years: string }) {
  const { projectedBalance, totalContributions, investmentGrowth, taxSavings, yearlyBreakdown } = result;

  const contributionsPct = projectedBalance > 0 ? (totalContributions / projectedBalance) * 100 : 0;
  const growthPct = projectedBalance > 0 ? (investmentGrowth / projectedBalance) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Big hero number */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Projected Balance at Retirement</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(projectedBalance)}
        </p>
        <p className="mt-2 text-sm text-navy-300">
          All tax-free after age 59&#189; with 5-year holding period
        </p>
      </div>

      {/* Breakdown bar */}
      <BreakdownBar
        totalContributions={totalContributions}
        investmentGrowth={investmentGrowth}
        contributionsPct={contributionsPct}
        growthPct={growthPct}
      />

      {/* Three summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Contributions</p>
          <p className="tabular-nums mt-1 text-lg font-bold text-sky-600 dark:text-sky-400">
            {formatCurrencyRound(totalContributions)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Investment Growth</p>
          <p className="tabular-nums mt-1 text-lg font-bold text-success-600 dark:text-success-500">
            {formatCurrencyRound(investmentGrowth)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Est. Tax Savings</p>
          <p className="tabular-nums mt-1 text-lg font-bold text-purple-600 dark:text-purple-400">
            {formatCurrencyRound(taxSavings)}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">at 22% tax rate</p>
        </div>
      </div>

      {/* Year-by-year table */}
      <GrowthTable yearlyBreakdown={yearlyBreakdown} />

      {/* Note */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
        <p className="text-xs leading-relaxed text-sky-800 dark:text-sky-300">
          <strong>Roth IRA benefits:</strong> Qualified withdrawals are 100% tax-free after age 59&#189;
          and a 5-year holding period. Unlike Traditional IRAs, Roth IRAs have no Required Minimum
          Distributions (RMDs) during your lifetime. You can withdraw contributions (not earnings)
          at any time without penalty.
        </p>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ────────────────────────────────────────────────────

function BreakdownBar({
  totalContributions,
  investmentGrowth,
  contributionsPct,
  growthPct,
}: {
  totalContributions: number;
  investmentGrowth: number;
  contributionsPct: number;
  growthPct: number;
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
          style={{ width: `${growthPct}%` }}
          title={`Investment Growth: ${formatCurrencyRound(investmentGrowth)}`}
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
            Investment Growth: {formatCurrencyRound(investmentGrowth)} ({growthPct.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Growth Table ─────────────────────────────────────────────────────

function GrowthTable({ yearlyBreakdown }: { yearlyBreakdown: YearRow[] }) {
  const totalYears = yearlyBreakdown.length;

  // Show first 5 + every 5th year + last year if >15 years
  const visibleRows = useMemo(() => {
    if (totalYears <= 15) return yearlyBreakdown;

    const rows: (YearRow | null)[] = [];
    let lastAddedYear = 0;

    for (let i = 0; i < yearlyBreakdown.length; i++) {
      const row = yearlyBreakdown[i];
      const isFirst5 = i < 5;
      const isEvery5th = row.year % 5 === 0;
      const isLast = i === yearlyBreakdown.length - 1;

      if (isFirst5 || isEvery5th || isLast) {
        // Add ellipsis marker if there is a gap
        if (lastAddedYear > 0 && row.year > lastAddedYear + 1) {
          rows.push(null);
        }
        rows.push(row);
        lastAddedYear = row.year;
      }
    }

    return rows;
  }, [yearlyBreakdown, totalYears]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="tabular-nums w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
              Year
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
              Contribution
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
              Balance
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
              Growth
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {visibleRows.map((row, idx) => {
            if (row === null) {
              return (
                <tr key={`ellipsis-${idx}`}>
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-center text-slate-400 dark:text-slate-500"
                  >
                    &middot;&middot;&middot;
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
                <td className="px-4 py-2.5 text-right font-medium text-sky-600 dark:text-sky-400">
                  {formatCurrencyRound(row.contribution)}
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
                <td className="hidden px-4 py-2.5 text-right font-medium text-success-600 sm:table-cell dark:text-success-500">
                  {formatCurrencyRound(row.growth)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
