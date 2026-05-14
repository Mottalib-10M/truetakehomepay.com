import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';

// ─── Constants ─────────────────────────────────────────────────────────
const FEDERAL_TIPPED_MIN_WAGE = 2.13;
const _FEDERAL_REGULAR_MIN_WAGE = 7.25; // $7.25/hr — kept for reference
const SS_RATE = 0.062;
const SS_WAGE_BASE = 176100;
const MEDICARE_RATE = 0.0145;
const STANDARD_DEDUCTION = 15700;

/** Simplified 2026 federal tax brackets (single filer) */
const FEDERAL_BRACKETS: { min: number; max: number; rate: number }[] = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

function calcFederalIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (const bracket of FEDERAL_BRACKETS) {
    if (taxableIncome <= bracket.min) break;
    const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

// ─── Result type ───────────────────────────────────────────────────────
interface TipTaxResult {
  baseHourly: number;
  tipsHourly: number;
  baseAnnual: number;
  tipsAnnual: number;
  totalGross: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  ficaTax: number;
  totalTax: number;
  annualNet: number;
  effectiveTaxRateTotal: number;
  effectiveTaxRateTips: number;
  weeklyBase: number;
  weeklyTips: number;
  weeklyGross: number;
  effectiveHourlyRate: number;
  hourlyTakeHome: number;
}

// ─── Component ─────────────────────────────────────────────────────────
export default function TipTaxCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [baseWage, setBaseWage] = useState('5.00');
  const [tipsPerHour, setTipsPerHour] = useState('15');
  const [hoursPerWeek, setHoursPerWeek] = useState('35');
  const [weeksPerYear, setWeeksPerYear] = useState('50');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('base')) setBaseWage(params.get('base')!);
    if (params.get('tips')) setTipsPerHour(params.get('tips')!);
    if (params.get('hours')) setHoursPerWeek(params.get('hours')!);
    if (params.get('weeks')) setWeeksPerYear(params.get('weeks')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (baseWage && baseWage !== '5.00') params.set('base', baseWage);
    if (tipsPerHour && tipsPerHour !== '15') params.set('tips', tipsPerHour);
    if (hoursPerWeek && hoursPerWeek !== '35') params.set('hours', hoursPerWeek);
    if (weeksPerYear && weeksPerYear !== '50') params.set('weeks', weeksPerYear);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [baseWage, tipsPerHour, hoursPerWeek, weeksPerYear]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<TipTaxResult | null>(() => {
    const base = Number(baseWage.replace(/[^0-9.]/g, ''));
    const tips = Number(tipsPerHour.replace(/[^0-9.]/g, ''));
    const hours = Number(hoursPerWeek.replace(/[^0-9.]/g, ''));
    const weeks = Number(weeksPerYear.replace(/[^0-9.]/g, ''));

    if (isNaN(base) || isNaN(tips) || isNaN(hours) || isNaN(weeks)) return null;
    if (hours <= 0 || weeks <= 0) return null;
    if (base <= 0 && tips <= 0) return null;

    const baseAnnual = base * hours * weeks;
    const tipsAnnual = tips * hours * weeks;
    const totalGross = baseAnnual + tipsAnnual;

    // Federal income tax (simplified single filer)
    const taxableIncome = Math.max(0, totalGross - STANDARD_DEDUCTION);
    const federalTax = calcFederalIncomeTax(taxableIncome);

    // FICA taxes (all wages + tips subject)
    const ssWages = Math.min(totalGross, SS_WAGE_BASE);
    const socialSecurity = ssWages * SS_RATE;
    const medicare = totalGross * MEDICARE_RATE;
    const ficaTax = socialSecurity + medicare;

    const totalTax = federalTax + ficaTax;
    const annualNet = totalGross - totalTax;

    const effectiveTaxRateTotal = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;
    const effectiveTaxRateTips = tipsAnnual > 0 ? (totalTax / totalGross) * 100 : 0;

    const weeklyBase = base * hours;
    const weeklyTips = tips * hours;
    const weeklyGross = weeklyBase + weeklyTips;

    const effectiveHourlyRate = base + tips;
    const totalHours = hours * weeks;
    const hourlyTakeHome = totalHours > 0 ? annualNet / totalHours : 0;

    return {
      baseHourly: base,
      tipsHourly: tips,
      baseAnnual,
      tipsAnnual,
      totalGross,
      federalTax,
      socialSecurity,
      medicare,
      ficaTax,
      totalTax,
      annualNet,
      effectiveTaxRateTotal,
      effectiveTaxRateTips,
      weeklyBase,
      weeklyTips,
      weeklyGross,
      effectiveHourlyRate,
      hourlyTakeHome,
    };
  }, [baseWage, tipsPerHour, hoursPerWeek, weeksPerYear]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Tipped Income Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="base-wage"
              label="Base Hourly Wage"
              value={baseWage}
              onChange={setBaseWage}
              prefix="$"
              suffix="/hr"
              placeholder="5.00"
              helpText={`Federal tipped minimum: $${FEDERAL_TIPPED_MIN_WAGE}/hr`}
            />

            <InputField
              id="tips-per-hour"
              label="Average Tips per Hour"
              value={tipsPerHour}
              onChange={setTipsPerHour}
              prefix="$"
              suffix="/hr"
              placeholder="15"
              helpText="Average across all shifts"
            />

            <InputField
              id="hours-per-week"
              label="Hours per Week"
              value={hoursPerWeek}
              onChange={setHoursPerWeek}
              suffix="hrs"
              placeholder="35"
            />

            <InputField
              id="weeks-per-year"
              label="Weeks per Year"
              value={weeksPerYear}
              onChange={setWeeksPerYear}
              suffix="wks"
              placeholder="50"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <TipTaxResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your wage and tips to see your take-home pay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ───────────────────────────────────────────────────────

function TipTaxResultPanel({ result }: { result: TipTaxResult }) {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Annual Take-Home Pay</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(result.annualNet)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrency(result.hourlyTakeHome)}/hr effective take-home &middot;{' '}
          {formatPercent(result.effectiveTaxRateTotal, 1)} effective tax rate
        </p>
      </div>

      {/* Breakdown bar */}
      <TipBreakdownBar result={result} />

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
            {/* Hourly rates */}
            <TipRow label="Base Hourly Wage" value={formatCurrency(result.baseHourly) + '/hr'} />
            <TipRow label="Tips per Hour" value={formatCurrency(result.tipsHourly) + '/hr'} />
            <TipRow label="Effective Hourly Rate" value={formatCurrency(result.effectiveHourlyRate) + '/hr'} bold />

            {/* Weekly */}
            <TipRow label="Weekly Base Pay" value={formatCurrency(result.weeklyBase)} />
            <TipRow label="Weekly Tips" value={formatCurrency(result.weeklyTips)} />
            <TipRow label="Weekly Gross" value={formatCurrency(result.weeklyGross)} bold />

            {/* Annual */}
            <TipRow label="Annual Base Pay" value={formatCurrencyRound(result.baseAnnual)} />
            <TipRow label="Annual Tips" value={formatCurrencyRound(result.tipsAnnual)} />
            <TipRow label="Annual Gross Income" value={formatCurrencyRound(result.totalGross)} bold />

            {/* Taxes */}
            <TipRow label="Federal Income Tax (est.)" value={formatCurrency(result.federalTax)} color="red" />
            <TipRow
              label="FICA Tax"
              value={formatCurrency(result.ficaTax)}
              color="red"
              note={`SS ${formatCurrency(result.socialSecurity)} + Medicare ${formatCurrency(result.medicare)}`}
            />
            <TipRow label="Total Tax" value={formatCurrency(result.totalTax)} bold color="red" />

            {/* Net */}
            <TipRow label="Annual Net (Take-Home)" value={formatCurrencyRound(result.annualNet)} bold highlight />

            {/* Rates */}
            <TipRow label="Effective Tax Rate (total income)" value={formatPercent(result.effectiveTaxRateTotal, 1)} />
            <TipRow label="Effective Tax Rate (tips only)" value={formatPercent(result.effectiveTaxRateTips, 1)} />
          </tbody>
        </table>
      </div>

      {/* Tip reporting note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Important: </span>
          All tips &mdash; cash and credit card &mdash; must be reported as taxable income. Tips
          totaling more than $20 in a calendar month must be reported to your employer using Form
          4070. Unreported tips may result in IRS penalties, including a 50% Social Security and
          Medicare tax penalty on unreported amounts. This calculator provides a simplified federal
          estimate for a single filer and does not include state taxes.
        </p>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ────────────────────────────────────────────────────────

function TipBreakdownBar({ result }: { result: TipTaxResult }) {
  if (result.totalGross <= 0) return null;

  const segments = [
    { label: 'Base Wages', value: result.baseAnnual, color: 'bg-navy-500' },
    { label: 'Tips', value: result.tipsAnnual, color: 'bg-success-500' },
    { label: 'Taxes', value: result.totalTax, color: 'bg-patriot-500' },
  ].filter((s) => s.value > 0);

  const total = result.totalGross;

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
              {seg.label}: {formatCurrency(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────

function TipRow({
  label,
  value,
  bold = false,
  highlight = false,
  color,
  note,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  color?: 'red';
  note?: string;
}) {
  const textColor =
    highlight
      ? 'text-success-600 dark:text-success-500'
      : color === 'red'
        ? 'text-patriot-600 dark:text-patriot-400'
        : 'text-slate-900 dark:text-slate-100';

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
        {note && (
          <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
            ({note})
          </span>
        )}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {value}
      </td>
    </tr>
  );
}
