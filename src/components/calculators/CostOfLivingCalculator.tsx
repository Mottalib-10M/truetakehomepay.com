import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── City Cost-of-Living Index Data (national average = 100) ────────────────

const CITY_DATA: Record<string, { name: string; overall: number; housing: number; food: number; transport: number; healthcare: number; utilities: number }> = {
  'nyc': { name: 'New York, NY', overall: 187, housing: 302, food: 116, transport: 130, healthcare: 110, utilities: 115 },
  'sf': { name: 'San Francisco, CA', overall: 179, housing: 295, food: 115, transport: 125, healthcare: 112, utilities: 92 },
  'la': { name: 'Los Angeles, CA', overall: 166, housing: 265, food: 108, transport: 130, healthcare: 105, utilities: 103 },
  'chicago': { name: 'Chicago, IL', overall: 107, housing: 105, food: 104, transport: 112, healthcare: 102, utilities: 97 },
  'houston': { name: 'Houston, TX', overall: 96, housing: 82, food: 96, transport: 105, healthcare: 95, utilities: 99 },
  'phoenix': { name: 'Phoenix, AZ', overall: 103, housing: 103, food: 99, transport: 102, healthcare: 95, utilities: 98 },
  'dallas': { name: 'Dallas, TX', overall: 102, housing: 95, food: 98, transport: 105, healthcare: 98, utilities: 101 },
  'denver': { name: 'Denver, CO', overall: 128, housing: 157, food: 103, transport: 105, healthcare: 105, utilities: 90 },
  'seattle': { name: 'Seattle, WA', overall: 169, housing: 272, food: 113, transport: 125, healthcare: 108, utilities: 98 },
  'boston': { name: 'Boston, MA', overall: 152, housing: 208, food: 110, transport: 115, healthcare: 115, utilities: 115 },
  'miami': { name: 'Miami, FL', overall: 128, housing: 155, food: 107, transport: 108, healthcare: 105, utilities: 97 },
  'atlanta': { name: 'Atlanta, GA', overall: 109, housing: 112, food: 102, transport: 108, healthcare: 102, utilities: 97 },
  'dc': { name: 'Washington, DC', overall: 152, housing: 217, food: 110, transport: 115, healthcare: 105, utilities: 105 },
  'minneapolis': { name: 'Minneapolis, MN', overall: 106, housing: 102, food: 103, transport: 108, healthcare: 105, utilities: 95 },
  'nashville': { name: 'Nashville, TN', overall: 104, housing: 105, food: 98, transport: 102, healthcare: 94, utilities: 95 },
  'austin': { name: 'Austin, TX', overall: 113, housing: 120, food: 98, transport: 102, healthcare: 95, utilities: 98 },
  'portland': { name: 'Portland, OR', overall: 130, housing: 159, food: 105, transport: 115, healthcare: 108, utilities: 85 },
  'san-diego': { name: 'San Diego, CA', overall: 160, housing: 252, food: 108, transport: 120, healthcare: 108, utilities: 105 },
  'average': { name: 'National Average', overall: 100, housing: 100, food: 100, transport: 100, healthcare: 100, utilities: 100 },
};

// Base monthly spend amounts at index 100 (national average)
const BASE_MONTHLY: Record<string, { label: string; amount: number }> = {
  housing: { label: 'Housing', amount: 1500 },
  food: { label: 'Food', amount: 600 },
  transport: { label: 'Transportation', amount: 400 },
  healthcare: { label: 'Healthcare', amount: 300 },
  utilities: { label: 'Utilities', amount: 200 },
};

const CATEGORIES: { key: keyof typeof BASE_MONTHLY; label: string }[] = [
  { key: 'housing', label: 'Housing' },
  { key: 'food', label: 'Food' },
  { key: 'transport', label: 'Transportation' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'utilities', label: 'Utilities' },
];

export default function CostOfLivingCalculator() {
  // ─── State ──────────────────────────────────────────────────────────
  const [fromCity, setFromCity] = useState('chicago');
  const [toCity, setToCity] = useState('nyc');
  const [salaryInput, setSalaryInput] = useState('85000');

  // ─── URL State Sync ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from')) setFromCity(params.get('from')!);
    if (params.get('to')) setToCity(params.get('to')!);
    if (params.get('salary')) setSalaryInput(params.get('salary')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (fromCity !== 'chicago') params.set('from', fromCity);
    if (toCity !== 'nyc') params.set('to', toCity);
    if (salaryInput && salaryInput !== '85000') params.set('salary', salaryInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [fromCity, toCity, salaryInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Options ────────────────────────────────────────────────────────
  const cityOptions = useMemo(
    () =>
      Object.entries(CITY_DATA)
        .map(([value, data]) => ({ value, label: data.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  // ─── Calculation ──────────────────────────────────────────────────────
  const results = useMemo(() => {
    const salary = Number(salaryInput.replace(/[^0-9.]/g, ''));
    if (isNaN(salary) || salary <= 0) return null;

    const from = CITY_DATA[fromCity];
    const to = CITY_DATA[toCity];
    if (!from || !to) return null;

    const equivalentSalary = salary * (to.overall / from.overall);
    const salaryDifference = equivalentSalary - salary;
    const salaryDifferencePercent = ((equivalentSalary - salary) / salary) * 100;

    // Category comparison (index values)
    const categoryComparison = CATEGORIES.map((cat) => {
      const fromIndex = from[cat.key as keyof typeof from] as number;
      const toIndex = to[cat.key as keyof typeof to] as number;
      const diffPercent = ((toIndex - fromIndex) / fromIndex) * 100;
      return {
        label: cat.label,
        key: cat.key,
        fromIndex,
        toIndex,
        diffPercent,
      };
    });

    // Add overall row
    const overallDiffPercent = ((to.overall - from.overall) / from.overall) * 100;
    categoryComparison.push({
      label: 'Overall',
      key: 'overall' as keyof typeof BASE_MONTHLY,
      fromIndex: from.overall,
      toIndex: to.overall,
      diffPercent: overallDiffPercent,
    });

    // Monthly cost comparison
    const monthlyBreakdown = CATEGORIES.map((cat) => {
      const base = BASE_MONTHLY[cat.key].amount;
      const fromMonthly = base * ((from[cat.key as keyof typeof from] as number) / 100);
      const toMonthly = base * ((to[cat.key as keyof typeof to] as number) / 100);
      return {
        label: cat.label,
        fromMonthly,
        toMonthly,
        difference: toMonthly - fromMonthly,
      };
    });

    const fromMonthlyTotal = monthlyBreakdown.reduce((sum, row) => sum + row.fromMonthly, 0);
    const toMonthlyTotal = monthlyBreakdown.reduce((sum, row) => sum + row.toMonthly, 0);
    const monthlyDifference = toMonthlyTotal - fromMonthlyTotal;

    return {
      salary,
      equivalentSalary,
      salaryDifference,
      salaryDifferencePercent,
      fromCity: from,
      toCity: to,
      categoryComparison,
      monthlyBreakdown,
      fromMonthlyTotal,
      toMonthlyTotal,
      monthlyDifference,
    };
  }, [salaryInput, fromCity, toCity]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Compare Cities
          </h2>

          <div className="space-y-4">
            <SelectField
              id="from-city"
              label="Current City"
              value={fromCity}
              onChange={setFromCity}
              options={cityOptions}
              helpText="Where you live now"
            />

            <SelectField
              id="to-city"
              label="Target City"
              value={toCity}
              onChange={setToCity}
              options={cityOptions}
              helpText="Where you're considering moving"
            />

            <InputField
              id="current-salary"
              label="Current Salary"
              value={salaryInput}
              onChange={setSalaryInput}
              prefix="$"
              placeholder="85,000"
              helpText="Your annual salary in your current city"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {results ? (
          <CostOfLivingResults results={results} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your salary and select two cities to compare cost of living
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Panel ──────────────────────────────────────────────────────

interface CostResults {
  salary: number;
  equivalentSalary: number;
  salaryDifference: number;
  salaryDifferencePercent: number;
  fromCity: typeof CITY_DATA[string];
  toCity: typeof CITY_DATA[string];
  categoryComparison: {
    label: string;
    key: string;
    fromIndex: number;
    toIndex: number;
    diffPercent: number;
  }[];
  monthlyBreakdown: {
    label: string;
    fromMonthly: number;
    toMonthly: number;
    difference: number;
  }[];
  fromMonthlyTotal: number;
  toMonthlyTotal: number;
  monthlyDifference: number;
}

function CostOfLivingResults({ results }: { results: CostResults }) {
  const {
    salary,
    equivalentSalary,
    salaryDifference,
    salaryDifferencePercent,
    fromCity,
    toCity,
    categoryComparison,
    monthlyBreakdown,
    fromMonthlyTotal,
    toMonthlyTotal,
    monthlyDifference,
  } = results;

  const isMoreExpensive = salaryDifference > 0;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white shadow-lg">
        <p className="text-center text-sm font-medium text-navy-200">
          To match {formatCurrencyRound(salary)} in {fromCity.name}
        </p>
        <p className="tabular-nums mt-1 text-center text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(equivalentSalary)}
        </p>
        <p className="mt-1 text-center text-sm font-medium text-navy-200">
          needed in {toCity.name}
        </p>
        <p className={`tabular-nums mt-3 text-center text-lg font-semibold ${isMoreExpensive ? 'text-patriot-400' : 'text-success-400'}`}>
          {isMoreExpensive
            ? `+${formatCurrencyRound(salaryDifference)} more`
            : salaryDifference === 0
              ? 'Same cost of living'
              : `${formatCurrencyRound(Math.abs(salaryDifference))} less`}
          <span className="tabular-nums ml-2 text-sm font-normal text-navy-300">
            ({salaryDifferencePercent > 0 ? '+' : ''}{formatPercent(salaryDifferencePercent, 1)})
          </span>
        </p>
      </div>

      {/* Category comparison table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Cost Index Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            National average = 100
          </p>
        </div>
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Category
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                {fromCity.name}
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                {toCity.name}
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Difference
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {categoryComparison.map((row) => (
              <tr
                key={row.key}
                className={row.key === 'overall' ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}
              >
                <td className={`px-4 py-2.5 text-slate-700 dark:text-slate-300 ${row.key === 'overall' ? 'font-semibold' : ''}`}>
                  {row.label}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                  {formatNumber(row.fromIndex)}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                  {formatNumber(row.toIndex)}
                </td>
                <td className={`px-4 py-2.5 text-right font-medium ${
                  row.diffPercent > 0
                    ? 'text-patriot-600 dark:text-patriot-400'
                    : row.diffPercent < 0
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {row.diffPercent > 0 ? '+' : ''}{formatPercent(row.diffPercent, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Salary equivalency */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Salary Equivalency
          </h3>
        </div>
        <table className="tabular-nums w-full text-sm">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                Current salary in {fromCity.name}
              </td>
              <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                {formatCurrencyRound(salary)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                Equivalent salary in {toCity.name}
              </td>
              <td className="px-4 py-2.5 text-right font-medium text-slate-900 dark:text-slate-100">
                {formatCurrencyRound(equivalentSalary)}
              </td>
            </tr>
            <tr className={isMoreExpensive ? 'bg-patriot-50/50 dark:bg-patriot-900/10' : 'bg-success-50/50 dark:bg-success-900/10'}>
              <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                Difference
              </td>
              <td className={`px-4 py-2.5 text-right font-semibold ${
                isMoreExpensive
                  ? 'text-patriot-600 dark:text-patriot-400'
                  : salaryDifference === 0
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-success-600 dark:text-success-400'
              }`}>
                {salaryDifference > 0 ? '+' : ''}{formatCurrencyRound(salaryDifference)}{' '}
                <span className="text-xs font-normal">
                  ({salaryDifferencePercent > 0 ? '+' : ''}{formatPercent(salaryDifferencePercent, 1)})
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Monthly cost comparison */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Estimated Monthly Costs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Based on typical spending scaled by each city's index
          </p>
        </div>
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Category
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                {fromCity.name}
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                {toCity.name}
              </th>
              <th className="hidden px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400 sm:table-cell">
                Difference
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {monthlyBreakdown.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                  {row.label}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                  {formatCurrencyRound(row.fromMonthly)}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                  {formatCurrencyRound(row.toMonthly)}
                </td>
                <td className={`hidden px-4 py-2.5 text-right font-medium sm:table-cell ${
                  row.difference > 0
                    ? 'text-patriot-600 dark:text-patriot-400'
                    : row.difference < 0
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {row.difference > 0 ? '+' : ''}{formatCurrencyRound(row.difference)}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                Monthly Total
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrencyRound(fromMonthlyTotal)}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrencyRound(toMonthlyTotal)}
              </td>
              <td className={`hidden px-4 py-2.5 text-right font-semibold sm:table-cell ${
                monthlyDifference > 0
                  ? 'text-patriot-600 dark:text-patriot-400'
                  : monthlyDifference < 0
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-slate-500 dark:text-slate-400'
              }`}>
                {monthlyDifference > 0 ? '+' : ''}{formatCurrencyRound(monthlyDifference)}/mo
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
          Cost of living indices are approximate and can vary significantly within metro areas
          depending on neighborhood, lifestyle, and personal spending habits. Also consider state
          income tax differences between cities &mdash; states like Texas, Florida, and Washington
          have no state income tax, which can substantially affect your take-home pay compared to
          high-tax states like California or New York.
        </p>
      </div>
    </div>
  );
}
