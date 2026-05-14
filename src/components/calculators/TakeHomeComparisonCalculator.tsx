import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculatePaycheck, type PaycheckInput, type PaycheckResult } from '../../lib/tax-engine';
import { getStateTaxConfig } from '../../data/income-tax-2026/index';
import { getStatesArray } from '../../data/state-meta';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

const NO_INCOME_TAX_CODES = new Set([
  'AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY',
]);

interface StateResult {
  rank: number;
  code: string;
  name: string;
  netAnnual: number;
  stateTax: number;
  effectiveStateRate: number;
  effectiveTotalRate: number;
  noIncomeTax: boolean;
}

export default function TakeHomeComparisonCalculator() {
  // ─── State ──────────────────────────────────────────────────────────
  const [salaryInput, setSalaryInput] = useState('100000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

  // ─── URL State Sync ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('salary')) setSalaryInput(params.get('salary')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (salaryInput && salaryInput !== '100000') params.set('salary', salaryInput);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [salaryInput, filingStatus]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Options ────────────────────────────────────────────────────────
  const states = useMemo(() => getStatesArray(), []);

  const filingOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
    value,
    label,
  }));

  // ─── Calculation ────────────────────────────────────────────────────
  const results = useMemo<StateResult[]>(() => {
    const salary = Number(salaryInput.replace(/[^0-9.]/g, ''));
    if (isNaN(salary) || salary <= 0) return [];

    const computed: StateResult[] = states.map((state) => {
      const stateConfig = getStateTaxConfig(state.code);
      const input: PaycheckInput = {
        grossAnnual: salary,
        filingStatus,
        state: state.code,
        payFrequency: 'annual' as const,
      };
      const result: PaycheckResult = calculatePaycheck(input, stateConfig, null);

      return {
        rank: 0,
        code: state.code,
        name: state.name,
        netAnnual: result.netAnnual,
        stateTax: result.stateTax,
        effectiveStateRate: result.effectiveStateRate * 100,
        effectiveTotalRate: result.effectiveTotalRate * 100,
        noIncomeTax: NO_INCOME_TAX_CODES.has(state.code),
      };
    });

    computed.sort((a, b) => b.netAnnual - a.netAnnual);
    computed.forEach((item, i) => {
      item.rank = i + 1;
    });

    return computed;
  }, [salaryInput, filingStatus, states]);

  // ─── Derived ────────────────────────────────────────────────────────
  const salary = Number(salaryInput.replace(/[^0-9.]/g, '')) || 0;
  const best = results[0] ?? null;
  const worst = results[results.length - 1] ?? null;
  const difference = best && worst ? best.netAnnual - worst.netAnnual : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Salary
          </h2>

          <div className="space-y-4">
            <InputField
              id="annual-salary"
              label="Annual Salary"
              value={salaryInput}
              onChange={setSalaryInput}
              prefix="$"
              placeholder="100,000"
            />

            <SelectField
              id="filing-status"
              label="Filing Status"
              value={filingStatus}
              onChange={(v) => setFilingStatus(v as FilingStatus)}
              options={filingOptions}
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {results.length > 0 && best && worst ? (
          <ComparisonResults
            results={results}
            salary={salary}
            best={best}
            worst={worst}
            difference={difference}
          />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your annual salary to compare take-home pay across all states
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Panel ──────────────────────────────────────────────────────

function ComparisonResults({
  results,
  salary,
  best,
  worst,
  difference,
}: {
  results: StateResult[];
  salary: number;
  best: StateResult;
  worst: StateResult;
  difference: number;
}) {
  return (
    <div className="space-y-6">
      {/* Hero card: best vs worst */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white shadow-lg">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Best state */}
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-300">
              #1 Highest Take-Home
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              {best.name}
            </p>
            <p className="tabular-nums mt-1 text-lg font-semibold text-success-400">
              {formatCurrencyRound(best.netAnnual)}
            </p>
          </div>

          {/* Difference */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-300">
              Difference
            </p>
            <p className="tabular-nums mt-1 text-2xl font-bold tracking-tight text-amber-400 sm:text-3xl">
              {formatCurrencyRound(difference)}
            </p>
            <p className="tabular-nums mt-1 text-xs text-navy-300">
              {formatPercent((difference / salary) * 100, 1)} of gross
            </p>
          </div>

          {/* Worst state */}
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-navy-300">
              #{results.length} Lowest Take-Home
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              {worst.name}
            </p>
            <p className="tabular-nums mt-1 text-lg font-semibold text-patriot-400">
              {formatCurrencyRound(worst.netAnnual)}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="tabular-nums w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                <th className="px-3 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                  #
                </th>
                <th className="px-3 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                  State
                </th>
                <th className="px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                  Net Annual
                </th>
                <th className="hidden px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400 sm:table-cell">
                  State Tax
                </th>
                <th className="hidden px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400 md:table-cell">
                  Eff. State Rate
                </th>
                <th className="px-3 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                  Eff. Total Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((row) => (
                <tr
                  key={row.code}
                  className={
                    row.noIncomeTax
                      ? 'bg-success-50/40 dark:bg-success-900/10'
                      : ''
                  }
                >
                  <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                    {row.rank}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                    {row.name}
                    {row.noIncomeTax && (
                      <span className="ml-1.5 inline-block rounded bg-success-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-success-700 dark:bg-success-900/30 dark:text-success-400">
                        No tax
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrencyRound(row.netAnnual)}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right text-slate-700 dark:text-slate-300 sm:table-cell">
                    {formatCurrencyRound(row.stateTax)}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right text-slate-700 dark:text-slate-300 md:table-cell">
                    {formatPercent(row.effectiveStateRate, 2)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">
                    {formatPercent(row.effectiveTotalRate, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* No income tax note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Nine states have no income tax:{' '}
          </span>
          Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas,
          Washington, and Wyoming. These states are highlighted in green above.
          Note that New Hampshire previously taxed interest and dividend income,
          but that tax was fully repealed effective January 1, 2025. Some
          no-income-tax states may offset lost revenue with higher sales taxes,
          property taxes, or other fees.
        </p>
      </div>
    </div>
  );
}
