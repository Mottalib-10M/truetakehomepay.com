import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants ────────────────────────────────────────────────────────
const ADDITIONAL_MEDICARE_RATE = 0.009;
const NIIT_RATE = 0.038;
const MEDICARE_RATE = 0.0145;

const THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  mfs: 125000,
  hoh: 200000,
};

// ─── Result type ──────────────────────────────────────────────────────
interface MedicareSurtaxResult {
  wages: number;
  netInvestmentIncome: number;
  threshold: number;
  regularMedicare: number;
  wagesAboveThreshold: number;
  additionalMedicare: number;
  magi: number;
  magiAboveThreshold: number;
  niitBase: number;
  niit: number;
  totalMedicareSurtax: number;
  totalMedicareAll: number;
  effectiveMedicareRate: number;
}

export default function MedicareSurtaxCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [wagesInput, setWagesInput] = useState('250000');
  const [investmentInput, setInvestmentInput] = useState('50000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('wages')) setWagesInput(params.get('wages')!);
    if (params.get('investment')) setInvestmentInput(params.get('investment')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (wagesInput && wagesInput !== '250000') params.set('wages', wagesInput);
    if (investmentInput && investmentInput !== '50000') params.set('investment', investmentInput);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [wagesInput, investmentInput, filingStatus]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<MedicareSurtaxResult | null>(() => {
    const wages = Number(wagesInput.replace(/[^0-9.]/g, ''));
    const netInvestmentIncome = Number(investmentInput.replace(/[^0-9.]/g, '')) || 0;

    if (isNaN(wages) || wages <= 0) return null;

    const threshold = THRESHOLDS[filingStatus];

    // Regular Medicare tax (1.45% on all wages)
    const regularMedicare = wages * MEDICARE_RATE;

    // Additional Medicare Tax (0.9% on wages above threshold)
    const wagesAboveThreshold = Math.max(0, wages - threshold);
    const additionalMedicare = wagesAboveThreshold * ADDITIONAL_MEDICARE_RATE;

    // NIIT: 3.8% on lesser of net investment income or MAGI above threshold
    const magi = wages + netInvestmentIncome;
    const magiAboveThreshold = Math.max(0, magi - threshold);
    const niitBase = Math.min(netInvestmentIncome, magiAboveThreshold);
    const niit = niitBase * NIIT_RATE;

    // Total surtax (Additional Medicare + NIIT)
    const totalMedicareSurtax = additionalMedicare + niit;

    // Total Medicare-related taxes
    const totalMedicareAll = regularMedicare + additionalMedicare + niit;

    // Effective rate on all income
    const totalIncome = wages + netInvestmentIncome;
    const effectiveMedicareRate = totalIncome > 0 ? totalMedicareAll / totalIncome : 0;

    return {
      wages,
      netInvestmentIncome,
      threshold,
      regularMedicare,
      wagesAboveThreshold,
      additionalMedicare,
      magi,
      magiAboveThreshold,
      niitBase,
      niit,
      totalMedicareSurtax,
      totalMedicareAll,
      effectiveMedicareRate,
    };
  }, [wagesInput, investmentInput, filingStatus]);

  // ─── Options ───────────────────────────────────────────────────────
  const filingOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Income Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="wages"
              label="Wages / Self-Employment Income"
              value={wagesInput}
              onChange={setWagesInput}
              prefix="$"
              placeholder="250,000"
              helpText="W-2 wages, salary, or net self-employment income"
            />

            <InputField
              id="investment"
              label="Net Investment Income"
              value={investmentInput}
              onChange={setInvestmentInput}
              prefix="$"
              placeholder="50,000"
              helpText="Interest, dividends, capital gains, rental income, royalties"
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
        {result ? (
          <ResultPanel result={result} filingStatus={filingStatus} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your income to see your Medicare surtax estimate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ─────────────────────────────────────────────────────

function ResultPanel({
  result,
  filingStatus,
}: {
  result: MedicareSurtaxResult;
  filingStatus: FilingStatus;
}) {
  return (
    <div className="space-y-6">
      {/* Big hero: Total Medicare Surtax */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Total Medicare Surtax</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(result.totalMedicareSurtax)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Additional Medicare: {formatCurrency(result.additionalMedicare)} &middot; NIIT: {formatCurrency(result.niit)}
        </p>
      </div>

      {/* Breakdown bar */}
      <BreakdownBar result={result} />

      {/* Threshold info card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Medicare Surtax Threshold ({FILING_STATUSES[filingStatus]})
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The 0.9% Additional Medicare Tax applies to wages exceeding{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrencyRound(result.threshold)}</span>.
          The 3.8% NIIT applies to the lesser of your net investment income or the amount your MAGI ({formatCurrencyRound(result.magi)}) exceeds the threshold.
          {result.magiAboveThreshold > 0
            ? ` Your MAGI is ${formatCurrencyRound(result.magiAboveThreshold)} above the threshold.`
            : ' Your MAGI is below the threshold, so no NIIT applies.'}
        </p>
      </div>

      {/* Detailed breakdown table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Item
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <Row
              label="Regular Medicare Tax (1.45%)"
              sublabel="Applied to all wages"
              value={result.regularMedicare}
              color="red"
            />
            <Row
              label="Wages Above Surtax Threshold"
              sublabel={`Wages exceeding ${formatCurrencyRound(result.threshold)}`}
              value={result.wagesAboveThreshold}
            />
            <Row
              label="Additional Medicare Tax (0.9%)"
              sublabel="On wages above threshold"
              value={result.additionalMedicare}
              color="red"
            />
            <Row
              label="Net Investment Income"
              value={result.netInvestmentIncome}
            />
            <Row
              label="NIIT (3.8%)"
              sublabel={`On lesser of investment income or MAGI above threshold (${formatCurrencyRound(result.niitBase)})`}
              value={result.niit}
              color="red"
            />
            <Row
              label="Total Medicare + Surtax"
              value={result.totalMedicareAll}
              bold
              highlight="red"
            />
            <Row
              label="Effective Medicare Rate"
              value={result.effectiveMedicareRate}
              isPercent
              bold
            />
          </tbody>
        </table>
      </div>

      {/* Employer note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Employer Match Note
        </p>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          Your employer matches the standard 1.45% Medicare tax but does <strong>not</strong> match
          the 0.9% Additional Medicare Tax. The Additional Medicare Tax is your responsibility only.
          The 3.8% NIIT is also paid solely by the taxpayer.
        </p>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ────────────────────────────────────────────────────

function BreakdownBar({ result }: { result: MedicareSurtaxResult }) {
  const total = result.totalMedicareAll;
  if (total <= 0) return null;

  const segments = [
    { label: 'Regular Medicare', value: result.regularMedicare, color: 'bg-patriot-500' },
    { label: 'Additional Medicare', value: result.additionalMedicare, color: 'bg-amber-500' },
    { label: 'NIIT', value: result.niit, color: 'bg-orange-400' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / total) * 100}%` }}
            title={`${seg.label}: ${formatCurrency(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrency(seg.value)} ({formatPercent((seg.value / total) * 100, 1)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────

function Row({
  label,
  value,
  sublabel,
  bold = false,
  highlight,
  color,
  show = true,
  isPercent = false,
}: {
  label: string;
  value: number;
  sublabel?: string;
  bold?: boolean;
  highlight?: 'red' | 'green';
  color?: 'red' | 'blue';
  show?: boolean;
  isPercent?: boolean;
}) {
  if (!show) return null;

  const textColor =
    highlight === 'green' ? 'text-success-600 dark:text-success-500' :
    highlight === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    color === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    color === 'blue' ? 'text-navy-600 dark:text-navy-400' :
    'text-slate-900 dark:text-slate-100';

  const bgColor =
    highlight === 'green' ? 'bg-success-50/50 dark:bg-success-900/10' :
    highlight === 'red' ? 'bg-patriot-50/50 dark:bg-patriot-900/10' :
    '';

  return (
    <tr className={bgColor}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
        {sublabel && (
          <span className="block text-xs font-normal text-slate-400 dark:text-slate-500">
            {sublabel}
          </span>
        )}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {isPercent ? formatPercent(value * 100, 2) : formatCurrency(value)}
      </td>
    </tr>
  );
}
