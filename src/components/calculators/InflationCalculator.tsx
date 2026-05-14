import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Direction Options ───────────────────────────────────────────────
const DIRECTION_OPTIONS = [
  { value: 'future', label: "Future value of today's dollars" },
  { value: 'past', label: "Today's value of future dollars" },
];

// ─── Types ───────────────────────────────────────────────────────────
interface YearRow {
  year: number;
  purchasingPower: number;
  cumulativeLossPct: number;
}

interface InflationResult {
  adjustedAmount: number;
  purchasingPowerLostPct: number;
  equivalentNeeded: number;
  yearByYear: YearRow[];
}

// ─── Common Items ────────────────────────────────────────────────────
const COMMON_ITEMS = [
  { label: '$5 coffee', amount: 5 },
  { label: '$50,000 car', amount: 50000 },
  { label: '$400,000 home', amount: 400000 },
];

export default function InflationCalculator() {
  // ─── State ──────────────────────────────────────────────────────────
  const [amountInput, setAmountInput] = useState('100000');
  const [rateInput, setRateInput] = useState('3.0');
  const [yearsInput, setYearsInput] = useState('20');
  const [direction, setDirection] = useState('future');

  // ─── URL State Sync ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('amount')) setAmountInput(params.get('amount')!);
    if (params.get('rate')) setRateInput(params.get('rate')!);
    if (params.get('years')) setYearsInput(params.get('years')!);
    if (params.get('dir')) setDirection(params.get('dir')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (amountInput && amountInput !== '100000') params.set('amount', amountInput);
    if (rateInput && rateInput !== '3.0') params.set('rate', rateInput);
    if (yearsInput && yearsInput !== '20') params.set('years', yearsInput);
    if (direction !== 'future') params.set('dir', direction);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [amountInput, rateInput, yearsInput, direction]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ────────────────────────────────────────────────────
  const result = useMemo<InflationResult | null>(() => {
    const amount = Number(amountInput.replace(/[^0-9.]/g, ''));
    const rate = Number(rateInput.replace(/[^0-9.]/g, ''));
    const years = Math.floor(Number(yearsInput.replace(/[^0-9.]/g, '')));

    if (isNaN(amount) || isNaN(rate) || isNaN(years)) return null;
    if (amount <= 0 || rate < 0 || years <= 0) return null;
    if (years > 100) return null;

    const r = rate / 100;

    // Future: purchasing power decreases — $100k today buys only $X worth in Y years
    // Past→Present: what you'd need today to match future dollars
    const factor = Math.pow(1 + r, years);
    const adjustedAmount = direction === 'future' ? amount / factor : amount * factor;

    const purchasingPowerLostPct =
      direction === 'future'
        ? ((amount - adjustedAmount) / amount) * 100
        : ((adjustedAmount - amount) / adjustedAmount) * 100;

    // The salary equivalent needed to maintain lifestyle
    const equivalentNeeded = direction === 'future' ? amount * factor : amount;

    // Year-by-year tracking
    const yearByYear: YearRow[] = [];
    for (let y = 1; y <= years; y++) {
      const yFactor = Math.pow(1 + r, y);
      const pp = direction === 'future' ? amount / yFactor : amount * yFactor;
      const lossPct =
        direction === 'future'
          ? ((amount - pp) / amount) * 100
          : ((pp - amount) / pp) * 100;
      yearByYear.push({
        year: y,
        purchasingPower: pp,
        cumulativeLossPct: lossPct,
      });
    }

    return {
      adjustedAmount,
      purchasingPowerLostPct,
      equivalentNeeded,
      yearByYear,
    };
  }, [amountInput, rateInput, yearsInput, direction]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Inflation Parameters
          </h2>

          <div className="space-y-4">
            <InputField
              id="inflation-amount"
              label="Amount"
              value={amountInput}
              onChange={setAmountInput}
              prefix="$"
              placeholder="100,000"
              helpText="Dollar amount to evaluate"
            />

            <InputField
              id="inflation-rate"
              label="Annual Inflation Rate"
              value={rateInput}
              onChange={setRateInput}
              suffix="%"
              placeholder="3.0"
              helpText="Historical US average is about 3.2%"
            />

            <InputField
              id="inflation-years"
              label="Number of Years"
              value={yearsInput}
              onChange={setYearsInput}
              suffix="years"
              placeholder="20"
              helpText="Time horizon to project"
            />

            <SelectField
              id="inflation-direction"
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={DIRECTION_OPTIONS}
              helpText="How to interpret the dollar amount"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <ResultSection
            result={result}
            amount={Number(amountInput.replace(/[^0-9.]/g, ''))}
            rate={Number(rateInput.replace(/[^0-9.]/g, ''))}
            years={Math.floor(Number(yearsInput.replace(/[^0-9.]/g, '')))}
            direction={direction}
          />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter an amount and inflation rate to see results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────

function ResultSection({
  result,
  amount,
  rate,
  years,
  direction,
}: {
  result: InflationResult;
  amount: number;
  rate: number;
  years: number;
  direction: string;
}) {
  const { adjustedAmount, purchasingPowerLostPct, equivalentNeeded, yearByYear } = result;

  const heroText =
    direction === 'future'
      ? `${formatCurrencyRound(amount)} today will have the purchasing power of`
      : `${formatCurrencyRound(amount)} in ${years} years would require`;

  const heroSubtext =
    direction === 'future'
      ? `in ${years} ${years === 1 ? 'year' : 'years'} at ${formatPercent(rate, 1)} annual inflation`
      : `in today's dollars at ${formatPercent(rate, 1)} annual inflation`;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">{heroText}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(adjustedAmount)}
        </p>
        <p className="mt-2 text-sm text-navy-300">{heroSubtext}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Purchasing Power Lost
          </p>
          <p className="tabular-nums mt-1 text-xl font-bold text-red-600 dark:text-red-400">
            {formatPercent(purchasingPowerLostPct, 1)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {direction === 'future' ? 'Salary Needed Then' : 'Equivalent Today'}
          </p>
          <p className="tabular-nums mt-1 text-xl font-bold text-navy-600 dark:text-navy-400">
            {formatCurrencyRound(equivalentNeeded)}
          </p>
        </div>
      </div>

      {/* Salary context */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {direction === 'future' ? (
            <>
              To maintain a <span className="font-semibold">{formatCurrencyRound(amount)}</span> lifestyle
              in {years} {years === 1 ? 'year' : 'years'}, you'd need{' '}
              <span className="font-semibold text-navy-600 dark:text-navy-400">
                {formatCurrencyRound(equivalentNeeded)}
              </span>.
            </>
          ) : (
            <>
              <span className="font-semibold">{formatCurrencyRound(amount)}</span> in {years}{' '}
              {years === 1 ? 'year' : 'years'} has the same buying power as{' '}
              <span className="font-semibold text-navy-600 dark:text-navy-400">
                {formatCurrencyRound(adjustedAmount)}
              </span>{' '}
              today.
            </>
          )}
        </p>
      </div>

      {/* Common items comparison */}
      <CommonItemsComparison rate={rate} years={years} direction={direction} />

      {/* Year-by-year table */}
      <YearByYearTable yearByYear={yearByYear} direction={direction} />

      {/* Note */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Historical US inflation has averaged about 3.2% per year. The Federal Reserve targets 2%
        annual inflation. Actual inflation varies year to year and by spending category.
      </p>
    </div>
  );
}

// ─── Common Items Comparison ──────────────────────────────────────────

function CommonItemsComparison({
  rate,
  years,
  direction,
}: {
  rate: number;
  years: number;
  direction: string;
}) {
  const r = rate / 100;
  const factor = Math.pow(1 + r, years);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        {direction === 'future'
          ? `What things will cost in ${years} years`
          : `What things cost today vs. ${years} years from now`}
      </p>
      <div className="space-y-3">
        {COMMON_ITEMS.map((item) => {
          const futurePrice = item.amount * factor;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
              <span className="tabular-nums text-sm font-semibold text-slate-900 dark:text-slate-100">
                {direction === 'future'
                  ? `will cost ${formatCurrencyRound(futurePrice)}`
                  : `costs ${formatCurrencyRound(futurePrice)} in future dollars`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Year-by-Year Table ───────────────────────────────────────────────

function YearByYearTable({
  yearByYear,
  direction,
}: {
  yearByYear: YearRow[];
  direction: string;
}) {
  const totalYears = yearByYear.length;

  // Show every year if <=20, otherwise show every 5 years + endpoints
  const visibleRows: (YearRow | null)[] = useMemo(() => {
    if (totalYears <= 20) return yearByYear;

    const selected = new Set<number>();
    // Always include year 1
    selected.add(0);
    // Every 5 years
    for (let i = 4; i < totalYears; i += 5) {
      selected.add(i);
    }
    // Always include last year
    selected.add(totalYears - 1);

    const sortedIndices = Array.from(selected).sort((a, b) => a - b);
    const rows: (YearRow | null)[] = [];
    let lastIdx = -1;
    for (const idx of sortedIndices) {
      if (lastIdx >= 0 && idx - lastIdx > 1) {
        rows.push(null); // ellipsis marker
      }
      rows.push(yearByYear[idx]);
      lastIdx = idx;
    }
    return rows;
  }, [yearByYear, totalYears]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="tabular-nums w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
              Year
            </th>
            <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
              {direction === 'future' ? 'Purchasing Power' : 'Equivalent Needed'}
            </th>
            <th className="hidden px-4 py-3 text-right font-medium text-slate-600 sm:table-cell dark:text-slate-400">
              Cumulative Loss
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {visibleRows.map((row, idx) => {
            if (row === null) {
              return (
                <tr key={`ellipsis-${idx}`}>
                  <td
                    colSpan={3}
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
                className={isLast ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
              >
                <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                  {row.year}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-semibold ${
                    isLast
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {formatCurrencyRound(row.purchasingPower)}
                </td>
                <td
                  className={`hidden px-4 py-2.5 text-right font-medium sm:table-cell ${
                    isLast
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {formatPercent(row.cumulativeLossPct, 1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
