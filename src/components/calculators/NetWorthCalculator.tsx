import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';

// ─── Types ─────────────────────────────────────────────────────────────

interface NetWorthResult {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  investableNetWorth: number;
  debtToAssetRatio: number;
  assetBreakdown: { label: string; amount: number; pct: number }[];
  liabilityBreakdown: { label: string; amount: number; pct: number }[];
}

// ─── Collapsible Section ───────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-navy-600 dark:text-slate-300 dark:hover:text-navy-400"
      >
        {title}
        <svg
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <div className="space-y-4 pb-2 pt-1">{children}</div>}
    </div>
  );
}

// ─── Parse helper ──────────────────────────────────────────────────────

function p(v: string): number {
  return Number(v.replace(/[^0-9.-]/g, '')) || 0;
}

// ─── Component ─────────────────────────────────────────────────────────

export default function NetWorthCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [checking, setChecking] = useState('5000');
  const [savings, setSavings] = useState('15000');
  const [retirement, setRetirement] = useState('50000');
  const [brokerage, setBrokerage] = useState('10000');
  const [home, setHome] = useState('350000');
  const [car, setCar] = useState('25000');
  const [otherAssets, setOtherAssets] = useState('0');
  const [mortgage, setMortgage] = useState('280000');
  const [studentLoans, setStudentLoans] = useState('25000');
  const [autoLoan, setAutoLoan] = useState('15000');
  const [creditCard, setCreditCard] = useState('3000');
  const [otherDebt, setOtherDebt] = useState('0');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checking')) setChecking(params.get('checking')!);
    if (params.get('savings')) setSavings(params.get('savings')!);
    if (params.get('ret')) setRetirement(params.get('ret')!);
    if (params.get('brok')) setBrokerage(params.get('brok')!);
    if (params.get('home')) setHome(params.get('home')!);
    if (params.get('car')) setCar(params.get('car')!);
    if (params.get('other')) setOtherAssets(params.get('other')!);
    if (params.get('mort')) setMortgage(params.get('mort')!);
    if (params.get('student')) setStudentLoans(params.get('student')!);
    if (params.get('auto')) setAutoLoan(params.get('auto')!);
    if (params.get('cc')) setCreditCard(params.get('cc')!);
    if (params.get('otherd')) setOtherDebt(params.get('otherd')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (checking !== '5000') params.set('checking', checking);
    if (savings !== '15000') params.set('savings', savings);
    if (retirement !== '50000') params.set('ret', retirement);
    if (brokerage !== '10000') params.set('brok', brokerage);
    if (home !== '350000') params.set('home', home);
    if (car !== '25000') params.set('car', car);
    if (otherAssets !== '0') params.set('other', otherAssets);
    if (mortgage !== '280000') params.set('mort', mortgage);
    if (studentLoans !== '25000') params.set('student', studentLoans);
    if (autoLoan !== '15000') params.set('auto', autoLoan);
    if (creditCard !== '3000') params.set('cc', creditCard);
    if (otherDebt !== '0') params.set('otherd', otherDebt);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [checking, savings, retirement, brokerage, home, car, otherAssets, mortgage, studentLoans, autoLoan, creditCard, otherDebt]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<NetWorthResult>(() => {
    const checkingVal = p(checking);
    const savingsVal = p(savings);
    const retirementVal = p(retirement);
    const brokerageVal = p(brokerage);
    const homeVal = p(home);
    const carVal = p(car);
    const otherAssetsVal = p(otherAssets);

    const mortgageVal = p(mortgage);
    const studentVal = p(studentLoans);
    const autoVal = p(autoLoan);
    const ccVal = p(creditCard);
    const otherDebtVal = p(otherDebt);

    const cashSavings = checkingVal + savingsVal;
    const investments = retirementVal + brokerageVal;
    const property = homeVal;
    const vehicles = carVal;

    const totalAssets = cashSavings + investments + property + vehicles + otherAssetsVal;
    const totalLiabilities = mortgageVal + studentVal + autoVal + ccVal + otherDebtVal;
    const netWorth = totalAssets - totalLiabilities;
    const investableNetWorth = netWorth - homeVal + mortgageVal - carVal + autoVal;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

    const assetBreakdown = [
      { label: 'Cash & Savings', amount: cashSavings, pct: totalAssets > 0 ? (cashSavings / totalAssets) * 100 : 0 },
      { label: 'Investments', amount: investments, pct: totalAssets > 0 ? (investments / totalAssets) * 100 : 0 },
      { label: 'Property', amount: property, pct: totalAssets > 0 ? (property / totalAssets) * 100 : 0 },
      { label: 'Vehicles', amount: vehicles, pct: totalAssets > 0 ? (vehicles / totalAssets) * 100 : 0 },
      { label: 'Other Assets', amount: otherAssetsVal, pct: totalAssets > 0 ? (otherAssetsVal / totalAssets) * 100 : 0 },
    ].filter((row) => row.amount > 0);

    const liabilityBreakdown = [
      { label: 'Mortgage', amount: mortgageVal, pct: totalLiabilities > 0 ? (mortgageVal / totalLiabilities) * 100 : 0 },
      { label: 'Student Loans', amount: studentVal, pct: totalLiabilities > 0 ? (studentVal / totalLiabilities) * 100 : 0 },
      { label: 'Auto Loans', amount: autoVal, pct: totalLiabilities > 0 ? (autoVal / totalLiabilities) * 100 : 0 },
      { label: 'Credit Card Debt', amount: ccVal, pct: totalLiabilities > 0 ? (ccVal / totalLiabilities) * 100 : 0 },
      { label: 'Other Debt', amount: otherDebtVal, pct: totalLiabilities > 0 ? (otherDebtVal / totalLiabilities) * 100 : 0 },
    ].filter((row) => row.amount > 0);

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      investableNetWorth,
      debtToAssetRatio,
      assetBreakdown,
      liabilityBreakdown,
    };
  }, [checking, savings, retirement, brokerage, home, car, otherAssets, mortgage, studentLoans, autoLoan, creditCard, otherDebt]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Assets & Liabilities
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            <CollapsibleSection title="Cash & Savings" defaultOpen={true}>
              <InputField
                id="nw-checking"
                label="Checking Accounts"
                value={checking}
                onChange={setChecking}
                prefix="$"
                placeholder="5,000"
              />
              <InputField
                id="nw-savings"
                label="Savings Accounts"
                value={savings}
                onChange={setSavings}
                prefix="$"
                placeholder="15,000"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Investments" defaultOpen={true}>
              <InputField
                id="nw-retirement"
                label="401(k) / IRA"
                value={retirement}
                onChange={setRetirement}
                prefix="$"
                placeholder="50,000"
              />
              <InputField
                id="nw-brokerage"
                label="Brokerage Accounts"
                value={brokerage}
                onChange={setBrokerage}
                prefix="$"
                placeholder="10,000"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Property" defaultOpen={true}>
              <InputField
                id="nw-home"
                label="Home Value"
                value={home}
                onChange={setHome}
                prefix="$"
                placeholder="350,000"
              />
              <InputField
                id="nw-car"
                label="Vehicle Value"
                value={car}
                onChange={setCar}
                prefix="$"
                placeholder="25,000"
              />
              <InputField
                id="nw-other-assets"
                label="Other Assets"
                value={otherAssets}
                onChange={setOtherAssets}
                prefix="$"
                placeholder="0"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Liabilities" defaultOpen={true}>
              <InputField
                id="nw-mortgage"
                label="Mortgage Balance"
                value={mortgage}
                onChange={setMortgage}
                prefix="$"
                placeholder="280,000"
              />
              <InputField
                id="nw-student"
                label="Student Loans"
                value={studentLoans}
                onChange={setStudentLoans}
                prefix="$"
                placeholder="25,000"
              />
              <InputField
                id="nw-auto"
                label="Auto Loans"
                value={autoLoan}
                onChange={setAutoLoan}
                prefix="$"
                placeholder="15,000"
              />
              <InputField
                id="nw-cc"
                label="Credit Card Debt"
                value={creditCard}
                onChange={setCreditCard}
                prefix="$"
                placeholder="3,000"
              />
              <InputField
                id="nw-other-debt"
                label="Other Debt"
                value={otherDebt}
                onChange={setOtherDebt}
                prefix="$"
                placeholder="0"
              />
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        <ResultSection result={result} />
      </div>
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────

function ResultSection({ result }: { result: NetWorthResult }) {
  const {
    totalAssets,
    totalLiabilities,
    netWorth,
    investableNetWorth,
    debtToAssetRatio,
    assetBreakdown,
    liabilityBreakdown,
  } = result;

  const isPositive = netWorth >= 0;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div
        className={`rounded-2xl p-6 text-center text-white shadow-lg ${
          isPositive
            ? 'bg-gradient-to-br from-success-700 to-success-800'
            : 'bg-gradient-to-br from-red-700 to-red-800'
        }`}
      >
        <p className="text-sm font-medium text-white/80">Your Net Worth</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(netWorth)}
        </p>
        <p className="mt-2 text-sm text-white/70">
          {formatCurrencyRound(totalAssets)} in assets &middot; {formatCurrencyRound(totalLiabilities)} in liabilities
        </p>
      </div>

      {/* Breakdown bar: Assets vs Liabilities */}
      <AssetsLiabilitiesBar totalAssets={totalAssets} totalLiabilities={totalLiabilities} />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Assets
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-success-600 dark:text-success-500">
            {formatCurrencyRound(totalAssets)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Liabilities
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrencyRound(totalLiabilities)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Debt-to-Asset
          </p>
          <p className="tabular-nums mt-1 text-lg font-bold text-navy-600 dark:text-navy-400">
            {formatPercent(debtToAssetRatio, 1)}
          </p>
        </div>
      </div>

      {/* Asset breakdown table */}
      {assetBreakdown.length > 0 && (
        <BreakdownTable
          title="Asset Breakdown"
          rows={assetBreakdown}
          totalLabel="Total Assets"
          total={totalAssets}
          colorClass="text-success-600 dark:text-success-500"
        />
      )}

      {/* Liability breakdown table */}
      {liabilityBreakdown.length > 0 && (
        <BreakdownTable
          title="Liability Breakdown"
          rows={liabilityBreakdown}
          totalLabel="Total Liabilities"
          total={totalLiabilities}
          colorClass="text-red-600 dark:text-red-400"
        />
      )}

      {/* Investable net worth highlight */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Investable Net Worth
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Excludes home equity and vehicle value
            </p>
          </div>
          <p
            className={`tabular-nums text-xl font-bold ${
              investableNetWorth >= 0
                ? 'text-navy-600 dark:text-navy-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrencyRound(investableNetWorth)}
          </p>
        </div>
      </div>

      {/* Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Net worth is a snapshot in time. Track it monthly or quarterly to see progress. Focus on increasing the gap between assets and liabilities.
        </p>
      </div>
    </div>
  );
}

// ─── Assets vs Liabilities Bar ────────────────────────────────────────

function AssetsLiabilitiesBar({
  totalAssets,
  totalLiabilities,
}: {
  totalAssets: number;
  totalLiabilities: number;
}) {
  const total = totalAssets + totalLiabilities;
  if (total <= 0) return null;

  const assetPct = (totalAssets / total) * 100;
  const liabilityPct = (totalLiabilities / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        <div
          className="bg-success-500 transition-all duration-300"
          style={{ width: `${assetPct}%` }}
          title={`Assets: ${formatCurrencyRound(totalAssets)}`}
        />
        <div
          className="bg-red-500 transition-all duration-300"
          style={{ width: `${liabilityPct}%` }}
          title={`Liabilities: ${formatCurrencyRound(totalLiabilities)}`}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Assets: {formatCurrencyRound(totalAssets)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Liabilities: {formatCurrencyRound(totalLiabilities)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Breakdown Table ──────────────────────────────────────────────────

function BreakdownTable({
  title,
  rows,
  totalLabel,
  total,
  colorClass,
}: {
  title: string;
  rows: { label: string; amount: number; pct: number }[];
  totalLabel: string;
  total: number;
  colorClass: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      </div>
      <table className="tabular-nums w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
            <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
              Category
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
              Amount
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
              % of Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                {row.label}
              </td>
              <td className="px-4 py-2.5 text-right text-slate-900 dark:text-white">
                {formatCurrencyRound(row.amount)}
              </td>
              <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">
                {formatPercent(row.pct, 1)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
            <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
              {totalLabel}
            </td>
            <td className={`px-4 py-2.5 text-right font-bold ${colorClass}`}>
              {formatCurrencyRound(total)}
            </td>
            <td className="px-4 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400">
              100%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
