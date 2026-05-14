import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculate401k, type Retirement401kResult } from '../../lib/finance-engine';
import { formatCurrency, formatCurrencyRound, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';

export default function RetirementCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [currentBalance, setCurrentBalance] = useState('25000');
  const [annualSalary, setAnnualSalary] = useState('75000');
  const [contributionRate, setContributionRate] = useState('10');
  const [employerMatchRate, setEmployerMatchRate] = useState('50');
  const [employerMatchLimit, setEmployerMatchLimit] = useState('6');
  const [years, setYears] = useState('30');
  const [annualReturn, setAnnualReturn] = useState('7');
  const [salaryGrowth, setSalaryGrowth] = useState('3');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('balance')) setCurrentBalance(params.get('balance')!);
    if (params.get('salary')) setAnnualSalary(params.get('salary')!);
    if (params.get('rate')) setContributionRate(params.get('rate')!);
    if (params.get('match')) setEmployerMatchRate(params.get('match')!);
    if (params.get('matchlimit')) setEmployerMatchLimit(params.get('matchlimit')!);
    if (params.get('years')) setYears(params.get('years')!);
    if (params.get('return')) setAnnualReturn(params.get('return')!);
    if (params.get('growth')) setSalaryGrowth(params.get('growth')!);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (currentBalance && currentBalance !== '25000') params.set('balance', currentBalance);
    if (annualSalary && annualSalary !== '75000') params.set('salary', annualSalary);
    if (contributionRate !== '10') params.set('rate', contributionRate);
    if (employerMatchRate !== '50') params.set('match', employerMatchRate);
    if (employerMatchLimit !== '6') params.set('matchlimit', employerMatchLimit);
    if (years !== '30') params.set('years', years);
    if (annualReturn !== '7') params.set('return', annualReturn);
    if (salaryGrowth !== '3') params.set('growth', salaryGrowth);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [currentBalance, annualSalary, contributionRate, employerMatchRate, employerMatchLimit, years, annualReturn, salaryGrowth]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<Retirement401kResult | null>(() => {
    const balance = Number(currentBalance.replace(/[^0-9.]/g, ''));
    const salary = Number(annualSalary.replace(/[^0-9.]/g, ''));
    const contribRate = Number(contributionRate) / 100;
    const matchRate = Number(employerMatchRate) / 100;
    const matchLimit = Number(employerMatchLimit) / 100;
    const numYears = Math.round(Number(years));
    const returnRate = Number(annualReturn) / 100;
    const growthRate = Number(salaryGrowth) / 100;

    if (isNaN(salary) || salary <= 0) return null;
    if (isNaN(numYears) || numYears <= 0) return null;
    if (isNaN(contribRate) || contribRate < 0) return null;

    return calculate401k(
      isNaN(balance) ? 0 : balance,
      salary,
      contribRate,
      isNaN(matchRate) ? 0 : matchRate,
      isNaN(matchLimit) ? 0 : matchLimit,
      numYears,
      isNaN(returnRate) ? 0.07 : returnRate,
      isNaN(growthRate) ? 0.03 : growthRate
    );
  }, [currentBalance, annualSalary, contributionRate, employerMatchRate, employerMatchLimit, years, annualReturn, salaryGrowth]);

  // ─── Table row truncation ──────────────────────────────────────────
  const visibleRows = useMemo(() => {
    if (!result) return [];
    const breakdown = result.yearlyBreakdown;
    if (breakdown.length <= 15) return breakdown;
    return [
      ...breakdown.slice(0, 5),
      null, // ellipsis marker
      ...breakdown.slice(-5),
    ];
  }, [result]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your 401(k) Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="current-balance"
              label="Current 401(k) Balance"
              value={currentBalance}
              onChange={setCurrentBalance}
              prefix="$"
              placeholder="25,000"
              helpText="Your current 401(k) account balance"
            />

            <InputField
              id="annual-salary"
              label="Annual Salary"
              value={annualSalary}
              onChange={setAnnualSalary}
              prefix="$"
              placeholder="75,000"
              helpText="Your gross annual salary before taxes"
            />

            <InputField
              id="contribution-rate"
              label="Your Contribution Rate"
              value={contributionRate}
              onChange={setContributionRate}
              suffix="%"
              placeholder="10"
              helpText="Percentage of salary you contribute each year"
            />

            <InputField
              id="employer-match-rate"
              label="Employer Match Rate"
              value={employerMatchRate}
              onChange={setEmployerMatchRate}
              suffix="%"
              placeholder="50"
              helpText="Percentage your employer matches"
            />

            <InputField
              id="employer-match-limit"
              label="Employer Match Limit"
              value={employerMatchLimit}
              onChange={setEmployerMatchLimit}
              suffix="%"
              placeholder="6"
              helpText="Max % of salary your employer will match"
            />

            <InputField
              id="years-until-retirement"
              label="Years Until Retirement"
              value={years}
              onChange={setYears}
              type="number"
              min={1}
              max={50}
              placeholder="30"
            />

            <InputField
              id="annual-return"
              label="Expected Annual Return"
              value={annualReturn}
              onChange={setAnnualReturn}
              suffix="%"
              placeholder="7"
              helpText="Average yearly investment return before inflation"
            />

            <InputField
              id="salary-growth"
              label="Annual Salary Growth"
              value={salaryGrowth}
              onChange={setSalaryGrowth}
              suffix="%"
              placeholder="3"
              helpText="Expected yearly raise or salary increase"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <div className="space-y-6">
            {/* Big hero number */}
            <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
              <p className="text-sm font-medium text-navy-200">Projected Balance at Retirement</p>
              <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {formatCurrencyRound(result.projectedBalance)}
              </p>
              <p className="tabular-nums mt-2 text-sm text-navy-300">
                After {years} years of contributions and growth
              </p>
            </div>

            {/* Three summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your Contributions</p>
                <p className="tabular-nums mt-1 text-lg font-bold text-sky-600 dark:text-sky-400">
                  {formatCurrencyRound(result.totalContributions)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Employer Contributions</p>
                <p className="tabular-nums mt-1 text-lg font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrencyRound(result.employerContributions)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Investment Growth</p>
                <p className="tabular-nums mt-1 text-lg font-bold text-success-600 dark:text-success-500">
                  {formatCurrencyRound(result.investmentGrowth)}
                </p>
              </div>
            </div>

            {/* Breakdown bar */}
            <ContributionBreakdownBar result={result} initialBalance={Number(currentBalance.replace(/[^0-9.]/g, '')) || 0} />

            {/* Year-by-year growth table */}
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
                      Your Contributions
                    </th>
                    <th className="hidden px-4 py-3 text-right font-medium text-slate-600 md:table-cell dark:text-slate-400">
                      Employer Contributions
                    </th>
                    <th className="hidden px-4 py-3 text-right font-medium text-slate-600 lg:table-cell dark:text-slate-400">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visibleRows.map((row, idx) =>
                    row === null ? (
                      <tr key="ellipsis">
                        <td colSpan={5} className="px-4 py-2.5 text-center text-slate-400 dark:text-slate-500">
                          &middot;&middot;&middot;
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={row.year}
                        className={
                          idx === visibleRows.length - 1
                            ? 'bg-success-50/50 dark:bg-success-900/10'
                            : ''
                        }
                      >
                        <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                          {row.year}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            idx === visibleRows.length - 1
                              ? 'text-success-600 dark:text-success-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {formatCurrencyRound(row.balance)}
                        </td>
                        <td className="hidden px-4 py-2.5 text-right font-medium text-sky-600 sm:table-cell dark:text-sky-400">
                          {formatCurrencyRound(row.yourContrib)}
                        </td>
                        <td className="hidden px-4 py-2.5 text-right font-medium text-purple-600 md:table-cell dark:text-purple-400">
                          {formatCurrencyRound(row.employerContrib)}
                        </td>
                        <td className="hidden px-4 py-2.5 text-right font-medium text-success-600 lg:table-cell dark:text-success-500">
                          {formatCurrencyRound(row.growth)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your salary to see your 401(k) projection
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contribution Breakdown Bar ─────────────────────────────────────────

function ContributionBreakdownBar({
  result,
  initialBalance,
}: {
  result: Retirement401kResult;
  initialBalance: number;
}) {
  const total = result.projectedBalance;
  if (total <= 0) return null;

  const segments = [
    { label: 'Initial Balance', value: initialBalance, color: 'bg-slate-400' },
    { label: 'Your Contributions', value: result.totalContributions, color: 'bg-sky-400' },
    { label: 'Employer Contributions', value: result.employerContributions, color: 'bg-purple-400' },
    { label: 'Investment Growth', value: result.investmentGrowth, color: 'bg-success-500' },
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
              {seg.label}: {formatCurrencyRound(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
