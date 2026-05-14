import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent, formatNumber } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants ────────────────────────────────────────────────────────
const SS_RATE = 0.062;
const SS_WAGE_BASE = 176100;
const MEDICARE_RATE = 0.0145;

type PayFreq = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

const FREQ_PERIODS: Record<PayFreq, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

const FREQ_OPTIONS: { value: string; label: string }[] = [
  { value: 'weekly', label: 'Weekly (52 paychecks)' },
  { value: 'biweekly', label: 'Bi-weekly (26 paychecks)' },
  { value: 'semimonthly', label: 'Semi-monthly (24 paychecks)' },
  { value: 'monthly', label: 'Monthly (12 paychecks)' },
];

// ─── Result Interface ─────────────────────────────────────────────────
interface SSResult {
  annualWages: number;
  taxableWages: number;
  ssTaxEmployee: number;
  ssTaxEmployer: number;
  medicareTaxEmployee: number;
  wagesAboveCap: number;
  ssTaxSavings: number;
  effectiveRate: number;
  periodsPerYear: number;
  perPaycheckWages: number;
  paycheckSSStops: number;
  hitsCap: boolean;
  perPaycheckSSBeforeCap: number;
  perPaycheckSSAfterCap: number;
  progressPercent: number;
}

// ─── Main Component ───────────────────────────────────────────────────
export default function SocialSecurityTaxCalculator() {
  // ─── State ──────────────────────────────────────────────────────────
  const [wagesInput, setWagesInput] = useState('100000');
  const [freq, setFreq] = useState<PayFreq>('biweekly');

  // ─── URL State Sync ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('wages')) setWagesInput(params.get('wages')!);
    if (params.get('freq')) setFreq(params.get('freq') as PayFreq);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (wagesInput && wagesInput !== '100000') params.set('wages', wagesInput);
    if (freq !== 'biweekly') params.set('freq', freq);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [wagesInput, freq]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ────────────────────────────────────────────────────
  const result = useMemo((): SSResult | null => {
    const annualWages = Number(wagesInput.replace(/[^0-9.]/g, ''));
    if (isNaN(annualWages) || annualWages <= 0) return null;

    const taxableWages = Math.min(annualWages, SS_WAGE_BASE);
    const ssTaxEmployee = taxableWages * SS_RATE;
    const ssTaxEmployer = taxableWages * SS_RATE;
    const medicareTaxEmployee = annualWages * MEDICARE_RATE;
    const wagesAboveCap = Math.max(0, annualWages - SS_WAGE_BASE);
    const ssTaxSavings = wagesAboveCap * SS_RATE;
    const effectiveRate = annualWages > 0 ? ssTaxEmployee / annualWages : 0;

    const periodsPerYear = FREQ_PERIODS[freq];
    const perPaycheckWages = annualWages / periodsPerYear;
    const hitsCap = annualWages > SS_WAGE_BASE;

    // Determine which paycheck number SS tax stops
    let paycheckSSStops = periodsPerYear; // default: never stops (all paychecks taxed)
    if (hitsCap && perPaycheckWages > 0) {
      paycheckSSStops = Math.ceil(SS_WAGE_BASE / perPaycheckWages);
    }

    const perPaycheckSSBeforeCap = perPaycheckWages * SS_RATE;
    const perPaycheckSSAfterCap = 0;

    const progressPercent = Math.min(100, (annualWages / SS_WAGE_BASE) * 100);

    return {
      annualWages,
      taxableWages,
      ssTaxEmployee,
      ssTaxEmployer,
      medicareTaxEmployee,
      wagesAboveCap,
      ssTaxSavings,
      effectiveRate,
      periodsPerYear,
      perPaycheckWages,
      paycheckSSStops,
      hitsCap,
      perPaycheckSSBeforeCap,
      perPaycheckSSAfterCap,
      progressPercent,
    };
  }, [wagesInput, freq]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Wage Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="ss-wages"
              label="Annual Wages"
              value={wagesInput}
              onChange={setWagesInput}
              prefix="$"
              placeholder="100,000"
              helpText="Gross annual wages from your employer (W-2 income)"
            />

            <SelectField
              id="pay-freq"
              label="Pay Frequency"
              value={freq}
              onChange={(v) => setFreq(v as PayFreq)}
              options={FREQ_OPTIONS}
              helpText="How often you receive a paycheck"
            />
          </div>

          {/* Quick reference */}
          <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              2026 FICA Quick Reference
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <p>SS Rate: {formatPercent(SS_RATE * 100, 1)} employee / {formatPercent(SS_RATE * 100, 1)} employer</p>
              <p>SS Wage Base: {formatCurrencyRound(SS_WAGE_BASE)}</p>
              <p>Medicare Rate: {formatPercent(MEDICARE_RATE * 100, 2)} on all wages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <SSResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your annual wages to see your Social Security tax breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SS Result Panel ──────────────────────────────────────────────────

function SSResultPanel({ result }: { result: SSResult }) {
  const {
    annualWages,
    taxableWages,
    ssTaxEmployee,
    ssTaxEmployer,
    medicareTaxEmployee,
    wagesAboveCap,
    ssTaxSavings,
    effectiveRate,
    periodsPerYear,
    paycheckSSStops,
    hitsCap,
    perPaycheckSSBeforeCap,
    progressPercent,
  } = result;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Total Social Security Tax (Employee)</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(ssTaxEmployee)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Effective SS Rate: {formatPercent(effectiveRate * 100, 2)} of total wages
        </p>
      </div>

      {/* SS tax stops indicator */}
      <div className={`rounded-xl border p-4 ${
        hitsCap
          ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            hitsCap
              ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-400'
              : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {hitsCap ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <div>
            <p className={`text-sm font-semibold ${
              hitsCap
                ? 'text-success-800 dark:text-success-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {hitsCap
                ? `SS Tax Stops After Paycheck #${paycheckSSStops} of ${periodsPerYear}`
                : `SS Tax Applies to All ${periodsPerYear} Paychecks`
              }
            </p>
            <p className={`text-xs ${
              hitsCap
                ? 'text-success-600 dark:text-success-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {hitsCap
                ? `You hit the ${formatCurrencyRound(SS_WAGE_BASE)} wage base mid-year and save ${formatCurrency(ssTaxSavings)} in SS tax`
                : `Your wages of ${formatCurrencyRound(annualWages)} are below the ${formatCurrencyRound(SS_WAGE_BASE)} wage base`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar: wages vs cap */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-400">Wages vs. SS Wage Base</span>
          <span className="tabular-nums font-semibold text-slate-900 dark:text-slate-100">
            {formatCurrencyRound(annualWages)} / {formatCurrencyRound(SS_WAGE_BASE)}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent >= 100
                ? 'bg-gradient-to-r from-patriot-500 to-success-500'
                : 'bg-gradient-to-r from-patriot-400 to-patriot-600'
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>$0</span>
          <span>{formatCurrencyRound(SS_WAGE_BASE)} cap</span>
        </div>
      </div>

      {/* Breakdown bar */}
      <SSBreakdownBar result={result} />

      {/* Detailed table */}
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
            <SSRow label="Annual Wages" value={annualWages} bold />
            <SSRow
              label="SS Taxable Wages"
              value={taxableWages}
              sublabel={`Min of wages and ${formatCurrencyRound(SS_WAGE_BASE)} cap`}
            />
            <SSRow
              label={`SS Tax — Employee (${formatPercent(SS_RATE * 100, 1)})`}
              value={ssTaxEmployee}
              color="red"
              sublabel="Withheld from your paycheck"
            />
            <SSRow
              label={`SS Tax — Employer Match (${formatPercent(SS_RATE * 100, 1)})`}
              value={ssTaxEmployer}
              color="red"
              sublabel="Paid by your employer (not deducted from pay)"
            />
            <SSRow
              label={`Medicare Tax — Employee (${formatPercent(MEDICARE_RATE * 100, 2)})`}
              value={medicareTaxEmployee}
              color="red"
              sublabel="Applied to all wages (no cap)"
            />
            <SSRow
              label="Wages Above SS Cap"
              value={wagesAboveCap}
              show={hitsCap}
              color="blue"
              sublabel="Not subject to Social Security tax"
            />
            <SSRow
              label="SS Tax Savings (from cap)"
              value={ssTaxSavings}
              show={hitsCap}
              highlight="green"
              bold
              sublabel={`${formatCurrencyRound(wagesAboveCap)} above cap x ${formatPercent(SS_RATE * 100, 1)}`}
            />
            <SSRow
              label="Per-Paycheck SS Tax (before cap)"
              value={perPaycheckSSBeforeCap}
              sublabel={`${formatCurrencyRound(annualWages / periodsPerYear)} per paycheck x ${formatPercent(SS_RATE * 100, 1)}`}
            />
            <SSRow
              label="Per-Paycheck SS Tax (after cap)"
              value={0}
              show={hitsCap}
              highlight="green"
              sublabel={`$0 SS tax on paychecks #${paycheckSSStops + 1}–${periodsPerYear}`}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SS Breakdown Bar ─────────────────────────────────────────────────

function SSBreakdownBar({ result }: { result: SSResult }) {
  const { ssTaxEmployee, ssTaxEmployer, medicareTaxEmployee } = result;
  const total = ssTaxEmployee + ssTaxEmployer + medicareTaxEmployee;

  if (total <= 0) return null;

  const segments = [
    { label: 'SS (Employee)', value: ssTaxEmployee, color: 'bg-patriot-500' },
    { label: 'SS (Employer)', value: ssTaxEmployer, color: 'bg-patriot-300' },
    { label: 'Medicare (Employee)', value: medicareTaxEmployee, color: 'bg-amber-500' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        Total FICA Breakdown: {formatCurrency(total)}
      </p>
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

// ─── SS Table Row ─────────────────────────────────────────────────────

function SSRow({
  label,
  value,
  sublabel,
  bold = false,
  highlight,
  color,
  show = true,
}: {
  label: string;
  value: number;
  sublabel?: string;
  bold?: boolean;
  highlight?: 'red' | 'green';
  color?: 'red' | 'blue';
  show?: boolean;
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
        {formatCurrency(value)}
      </td>
    </tr>
  );
}
