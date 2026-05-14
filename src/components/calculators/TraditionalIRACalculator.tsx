import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants (2026) ───────────────────────────────────────────────────
const IRA_LIMIT = 7000;
const IRA_CATCHUP = 1000; // age 50+

// ─── Types ──────────────────────────────────────────────────────────────

interface YearRow {
  year: number;
  contribution: number;
  balance: number;
  taxDeduction: number;
}

interface TraditionalIRAResult {
  projectedBalance: number;
  afterTaxValue: number;
  totalContributions: number;
  investmentGrowth: number;
  annualTaxDeduction: number;
  totalTaxDeductions: number;
  taxOwedAtWithdrawal: number;
  taxSavedNow: number;
  yearByYear: YearRow[];
  contributionPct: number;
  growthPct: number;
  maxContribution: number;
}

// ─── Component ──────────────────────────────────────────────────────────

export default function TraditionalIRACalculator() {
  // ─── State ────────────────────────────────────────────────────────────
  const [balanceInput, setBalanceInput] = useState('20000');
  const [contribInput, setContribInput] = useState('7000');
  const [returnInput, setReturnInput] = useState('7');
  const [yearsInput, setYearsInput] = useState('25');
  const [taxNowInput, setTaxNowInput] = useState('22');
  const [taxRetInput, setTaxRetInput] = useState('15');
  const [age50Input, setAge50Input] = useState('no');

  // ─── URL State Sync ──────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('balance')) setBalanceInput(params.get('balance')!);
    if (params.get('contrib')) setContribInput(params.get('contrib')!);
    if (params.get('return')) setReturnInput(params.get('return')!);
    if (params.get('years')) setYearsInput(params.get('years')!);
    if (params.get('taxnow')) setTaxNowInput(params.get('taxnow')!);
    if (params.get('taxret')) setTaxRetInput(params.get('taxret')!);
    if (params.get('age50')) setAge50Input(params.get('age50')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (balanceInput && balanceInput !== '20000') params.set('balance', balanceInput);
    if (contribInput && contribInput !== '7000') params.set('contrib', contribInput);
    if (returnInput && returnInput !== '7') params.set('return', returnInput);
    if (yearsInput && yearsInput !== '25') params.set('years', yearsInput);
    if (taxNowInput && taxNowInput !== '22') params.set('taxnow', taxNowInput);
    if (taxRetInput && taxRetInput !== '15') params.set('taxret', taxRetInput);
    if (age50Input && age50Input !== 'no') params.set('age50', age50Input);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [balanceInput, contribInput, returnInput, yearsInput, taxNowInput, taxRetInput, age50Input]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ─────────────────────────────────────────────────────
  const result = useMemo<TraditionalIRAResult | null>(() => {
    const balance = Number(balanceInput.replace(/[^0-9.]/g, ''));
    const contrib = Number(contribInput.replace(/[^0-9.]/g, ''));
    const annualReturn = Number(returnInput.replace(/[^0-9.]/g, '')) / 100;
    const years = Math.round(Number(yearsInput.replace(/[^0-9.]/g, '')));
    const taxNow = Number(taxNowInput.replace(/[^0-9.]/g, '')) / 100;
    const taxRet = Number(taxRetInput.replace(/[^0-9.]/g, '')) / 100;
    const isAge50 = age50Input === 'yes';

    if (isNaN(balance) || isNaN(contrib) || isNaN(annualReturn) || isNaN(years)) return null;
    if (isNaN(taxNow) || isNaN(taxRet)) return null;
    if (years <= 0 || years > 60) return null;
    if (balance < 0 || contrib < 0 || annualReturn < 0) return null;

    const maxContribution = isAge50 ? IRA_LIMIT + IRA_CATCHUP : IRA_LIMIT;
    const effectiveContrib = Math.min(contrib, maxContribution);
    const annualDeduction = effectiveContrib * taxNow;

    let currentBalance = balance;
    const yearByYear: YearRow[] = [];

    for (let y = 1; y <= years; y++) {
      currentBalance += effectiveContrib;
      const growth = currentBalance * annualReturn;
      currentBalance += growth;

      yearByYear.push({
        year: y,
        contribution: effectiveContrib,
        balance: currentBalance,
        taxDeduction: annualDeduction,
      });
    }

    const projectedBalance = currentBalance;
    const totalContributions = balance + effectiveContrib * years;
    const investmentGrowth = projectedBalance - totalContributions;
    const taxOwedAtWithdrawal = projectedBalance * taxRet;
    const afterTaxValue = projectedBalance - taxOwedAtWithdrawal;
    const totalTaxDeductions = annualDeduction * years;
    const taxSavedNow = totalTaxDeductions;

    const total = totalContributions + investmentGrowth;
    const contributionPct = total > 0 ? (totalContributions / total) * 100 : 0;
    const growthPct = total > 0 ? (investmentGrowth / total) * 100 : 0;

    return {
      projectedBalance,
      afterTaxValue,
      totalContributions,
      investmentGrowth,
      annualTaxDeduction: annualDeduction,
      totalTaxDeductions,
      taxOwedAtWithdrawal,
      taxSavedNow,
      yearByYear,
      contributionPct,
      growthPct,
      maxContribution,
    };
  }, [balanceInput, contribInput, returnInput, yearsInput, taxNowInput, taxRetInput, age50Input]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Traditional IRA Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="ira-balance"
              label="Current Balance"
              value={balanceInput}
              onChange={setBalanceInput}
              prefix="$"
              placeholder="20,000"
              helpText="Current Traditional IRA balance"
            />

            <InputField
              id="ira-contrib"
              label="Annual Contribution"
              value={contribInput}
              onChange={setContribInput}
              prefix="$"
              placeholder="7,000"
              helpText={`2026 limit: $${formatNumber(IRA_LIMIT)} ($${formatNumber(IRA_LIMIT + IRA_CATCHUP)} if 50+)`}
            />

            <InputField
              id="ira-return"
              label="Expected Annual Return"
              value={returnInput}
              onChange={setReturnInput}
              suffix="%"
              placeholder="7"
              helpText="Average stock market return is ~7-10%"
            />

            <InputField
              id="ira-years"
              label="Years Until Retirement"
              value={yearsInput}
              onChange={setYearsInput}
              placeholder="25"
              helpText="Number of years you'll contribute"
            />

            <InputField
              id="ira-taxnow"
              label="Current Marginal Tax Rate"
              value={taxNowInput}
              onChange={setTaxNowInput}
              suffix="%"
              placeholder="22"
              helpText="Your current federal income tax bracket"
            />

            <InputField
              id="ira-taxret"
              label="Expected Retirement Tax Rate"
              value={taxRetInput}
              onChange={setTaxRetInput}
              suffix="%"
              placeholder="15"
              helpText="Expected tax rate when you withdraw funds"
            />

            <SelectField
              id="ira-age50"
              label="Age 50 or Older?"
              value={age50Input}
              onChange={setAge50Input}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
              helpText="Catch-up contributions add $1,000/year"
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
              Enter your IRA details to see projected growth
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────────

function ResultSection({ result }: { result: TraditionalIRAResult }) {
  const {
    projectedBalance,
    afterTaxValue,
    totalContributions,
    investmentGrowth,
    annualTaxDeduction,
    totalTaxDeductions,
    taxOwedAtWithdrawal,
    taxSavedNow,
    yearByYear,
    contributionPct,
    growthPct,
    maxContribution,
  } = result;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Projected Balance at Retirement</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(projectedBalance)}
        </p>
        <div className="mx-auto mt-3 h-px w-24 bg-navy-600" />
        <p className="mt-3 text-sm font-medium text-navy-200">After-Tax Value</p>
        <p className="tabular-nums mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-emerald-300">
          {formatCurrencyRound(afterTaxValue)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Estimated taxes at withdrawal: {formatCurrencyRound(taxOwedAtWithdrawal)}
        </p>
      </div>

      {/* Breakdown bar */}
      <BreakdownBar
        contributions={totalContributions}
        growth={investmentGrowth}
        contributionPct={contributionPct}
        growthPct={growthPct}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Contributions
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-navy-600 dark:text-navy-400">
            {formatCurrencyRound(totalContributions)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Investment Growth
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-success-600 dark:text-success-500">
            {formatCurrencyRound(investmentGrowth)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Annual Tax Deduction
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-sky-600 dark:text-sky-400">
            {formatCurrencyRound(annualTaxDeduction)}
          </p>
        </div>
      </div>

      {/* Traditional vs Roth comparison */}
      <ComparisonBox
        taxSavedNow={taxSavedNow}
        taxOwedLater={taxOwedAtWithdrawal}
        totalTaxDeductions={totalTaxDeductions}
      />

      {/* Year-by-year table */}
      <YearByYearTable yearByYear={yearByYear} />

      {/* Notes */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Important Notes</p>
        <ul className="mt-1.5 space-y-1 text-xs text-amber-700 dark:text-amber-400">
          <li>Required Minimum Distributions (RMDs) start at age 73 under the SECURE 2.0 Act.</li>
          <li>Deductibility may be limited if you or your spouse are covered by an employer retirement plan.</li>
          <li>Early withdrawals before age 59&#189; may incur a 10% penalty plus income tax.</li>
          <li>2026 contribution limit: ${formatNumber(maxContribution)}/year.</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ─────────────────────────────────────────────────────────

function BreakdownBar({
  contributions,
  growth,
  contributionPct,
  growthPct,
}: {
  contributions: number;
  growth: number;
  contributionPct: number;
  growthPct: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        <div
          className="bg-navy-500 transition-all duration-300"
          style={{ width: `${contributionPct}%` }}
          title={`Contributions: ${formatCurrencyRound(contributions)}`}
        />
        <div
          className="bg-success-500 transition-all duration-300"
          style={{ width: `${growthPct}%` }}
          title={`Growth: ${formatCurrencyRound(growth)}`}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-navy-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Contributions: {formatCurrencyRound(contributions)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Growth: {formatCurrencyRound(growth)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Traditional vs Roth Comparison ────────────────────────────────────────

function ComparisonBox({
  taxSavedNow,
  taxOwedLater,
  totalTaxDeductions,
}: {
  taxSavedNow: number;
  taxOwedLater: number;
  totalTaxDeductions: number;
}) {
  const netBenefit = taxSavedNow - taxOwedLater;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Traditional vs Roth IRA Comparison
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Traditional: contribute pre-tax dollars, taxed on withdrawal. Roth: contribute after-tax dollars, tax-free withdrawals.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-sky-50 p-3 dark:bg-sky-900/20">
          <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Tax Saved Now</p>
          <p className="tabular-nums mt-1 text-xl font-bold text-sky-600 dark:text-sky-400">
            {formatCurrencyRound(taxSavedNow)}
          </p>
          <p className="mt-0.5 text-xs text-sky-600/70 dark:text-sky-400/70">
            Total deductions over contribution period
          </p>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300">Tax Owed Later</p>
          <p className="tabular-nums mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrencyRound(taxOwedLater)}
          </p>
          <p className="mt-0.5 text-xs text-rose-600/70 dark:text-rose-400/70">
            Estimated taxes on full withdrawal
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {netBenefit >= 0 ? 'Traditional IRA Advantage' : 'Roth IRA Advantage'}
          </span>
          <span
            className={`tabular-nums text-sm font-bold ${
              netBenefit >= 0
                ? 'text-success-600 dark:text-success-500'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrencyRound(Math.abs(netBenefit))}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {netBenefit >= 0
            ? 'Lower retirement tax rate makes Traditional IRA more tax-efficient in this scenario.'
            : 'Higher retirement tax rate makes Roth IRA more tax-efficient in this scenario.'}
        </p>
      </div>
    </div>
  );
}

// ─── Year-by-Year Table ────────────────────────────────────────────────────

function YearByYearTable({ yearByYear }: { yearByYear: YearRow[] }) {
  // Show first 5 years, then every 5th year, plus the last year
  const filteredRows = yearByYear.filter((row, _idx) => {
    if (row.year <= 5) return true;
    if (row.year % 5 === 0) return true;
    if (row.year === yearByYear.length) return true;
    return false;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Year-by-Year Growth
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
              <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
                Year
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                Contribution
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                Balance
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                Tax Deduction
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRows.map((row) => (
              <tr key={row.year}>
                <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                  {row.year}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                  {formatCurrencyRound(row.contribution)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-navy-600 dark:text-navy-400">
                  {formatCurrencyRound(row.balance)}
                </td>
                <td className="px-4 py-2.5 text-right text-sky-600 dark:text-sky-400">
                  {formatCurrencyRound(row.taxDeduction)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
