import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';

// ─── Constants (simplified federal single) ──────────────────────────────
const FEDERAL_BRACKETS = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION = 15700;
const SS_RATE = 0.062;
const SS_WAGE_BASE = 176100;
const MEDICARE_RATE = 0.0145;

// ─── Tax helpers ────────────────────────────────────────────────────────
function calcFederalTax(grossAnnual: number): number {
  const taxable = Math.max(0, grossAnnual - STANDARD_DEDUCTION);
  let tax = 0;
  for (const bracket of FEDERAL_BRACKETS) {
    if (taxable <= bracket.min) break;
    const amountInBracket = Math.min(taxable, bracket.max) - bracket.min;
    tax += amountInBracket * bracket.rate;
  }
  return tax;
}

function calcSocialSecurity(grossAnnual: number): number {
  return Math.min(grossAnnual, SS_WAGE_BASE) * SS_RATE;
}

function calcMedicare(grossAnnual: number): number {
  return grossAnnual * MEDICARE_RATE;
}

// ─── Component ──────────────────────────────────────────────────────────
export default function HourlyPaycheckCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [rate, setRate] = useState('20');
  const [hours, setHours] = useState('40');
  const [weeks, setWeeks] = useState('52');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('rate')) setRate(params.get('rate')!);
    if (params.get('hours')) setHours(params.get('hours')!);
    if (params.get('weeks')) setWeeks(params.get('weeks')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (rate && rate !== '20') params.set('rate', rate);
    if (hours && hours !== '40') params.set('hours', hours);
    if (weeks && weeks !== '52') params.set('weeks', weeks);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [rate, hours, weeks]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo(() => {
    const hourlyRate = Number(rate.replace(/[^0-9.]/g, ''));
    const hoursPerWeek = Number(hours.replace(/[^0-9.]/g, ''));
    const weeksPerYear = Number(weeks.replace(/[^0-9.]/g, ''));

    if (isNaN(hourlyRate) || hourlyRate <= 0) return null;
    if (isNaN(hoursPerWeek) || hoursPerWeek <= 0) return null;
    if (isNaN(weeksPerYear) || weeksPerYear <= 0) return null;

    const grossAnnual = hourlyRate * hoursPerWeek * weeksPerYear;
    const federalTax = calcFederalTax(grossAnnual);
    const socialSecurity = calcSocialSecurity(grossAnnual);
    const medicare = calcMedicare(grossAnnual);
    const totalTax = federalTax + socialSecurity + medicare;
    const netAnnual = grossAnnual - totalTax;
    const totalHoursWorked = hoursPerWeek * weeksPerYear;

    return {
      hourlyRate,
      hoursPerWeek,
      weeksPerYear,
      grossAnnual,
      federalTax,
      socialSecurity,
      medicare,
      totalTax,
      netAnnual,
      netMonthly: netAnnual / 12,
      netBiweekly: netAnnual / 26,
      netWeekly: netAnnual / 52,
      grossMonthly: grossAnnual / 12,
      grossBiweekly: grossAnnual / 26,
      grossSemiMonthly: grossAnnual / 24,
      grossWeekly: grossAnnual / 52,
      netSemiMonthly: netAnnual / 24,
      effectiveRate: grossAnnual > 0 ? (totalTax / grossAnnual) * 100 : 0,
      netHourlyRate: totalHoursWorked > 0 ? netAnnual / totalHoursWorked : 0,
    };
  }, [rate, hours, weeks]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Hourly Pay Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="hourly-rate"
              label="Hourly Rate"
              value={rate}
              onChange={setRate}
              prefix="$"
              placeholder="20"
              helpText="Your gross hourly pay before taxes"
            />

            <InputField
              id="hours-per-week"
              label="Hours per Week"
              value={hours}
              onChange={setHours}
              suffix="hrs"
              placeholder="40"
              helpText="Regular hours worked per week"
            />

            <InputField
              id="weeks-per-year"
              label="Weeks per Year"
              value={weeks}
              onChange={setWeeks}
              suffix="wks"
              placeholder="52"
              helpText="Weeks worked per year (52 = no unpaid time off)"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <ResultsPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your hourly rate to see your salary and take-home pay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Results Panel ──────────────────────────────────────────────────────

interface ResultData {
  hourlyRate: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  grossAnnual: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  netBiweekly: number;
  netWeekly: number;
  grossMonthly: number;
  grossBiweekly: number;
  grossSemiMonthly: number;
  grossWeekly: number;
  netSemiMonthly: number;
  effectiveRate: number;
  netHourlyRate: number;
}

function ResultsPanel({ result }: { result: ResultData }) {
  const {
    hourlyRate,
    grossAnnual,
    federalTax,
    socialSecurity,
    medicare,
    totalTax,
    netAnnual,
    netMonthly,
    netBiweekly,
    netWeekly,
    grossMonthly,
    grossBiweekly,
    grossSemiMonthly,
    grossWeekly,
    netSemiMonthly,
    effectiveRate,
    netHourlyRate,
  } = result;

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Annual Salary Equivalent</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrencyRound(grossAnnual)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Net Annual Take-Home: {formatCurrency(netAnnual)}
        </p>
      </div>

      {/* Net hourly highlight */}
      <div className="rounded-xl border border-success-200 bg-success-50/50 p-4 text-center dark:border-success-800 dark:bg-success-900/10">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Your Hourly Rate After Taxes
        </p>
        <p className="tabular-nums mt-1 text-2xl font-bold text-success-600 dark:text-success-500">
          {formatCurrency(netHourlyRate)}
          <span className="text-base font-medium text-slate-500 dark:text-slate-400"> /hr</span>
        </p>
        <p className="tabular-nums mt-1 text-xs text-slate-500 dark:text-slate-400">
          vs. {formatCurrency(hourlyRate)}/hr gross ({formatPercent(effectiveRate, 1)} effective tax rate)
        </p>
      </div>

      {/* Salary equivalency table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Period
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Gross
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Net
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <EquivRow label="Hourly" gross={hourlyRate} net={netHourlyRate} />
            <EquivRow label="Weekly" gross={grossWeekly} net={netWeekly} />
            <EquivRow label="Bi-weekly" gross={grossBiweekly} net={netBiweekly} />
            <EquivRow label="Semi-monthly" gross={grossSemiMonthly} net={netSemiMonthly} />
            <EquivRow label="Monthly" gross={grossMonthly} net={netMonthly} />
            <EquivRow label="Annual" gross={grossAnnual} net={netAnnual} bold />
          </tbody>
        </table>
      </div>

      {/* Tax breakdown table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="tabular-nums w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">
                Tax Breakdown
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <TaxRow
              label="Federal Income Tax"
              value={federalTax}
              color="red"
              sublabel="Simplified single filer estimate"
            />
            <TaxRow
              label="Social Security Tax"
              value={socialSecurity}
              color="red"
              sublabel={`6.2% on first ${formatCurrencyRound(176100)}`}
            />
            <TaxRow
              label="Medicare Tax"
              value={medicare}
              color="red"
              sublabel="1.45% on all earnings"
            />
            <TaxRow label="Total Tax" value={totalTax} bold highlight="red" />
            <TaxRow label="Net Annual Pay" value={netAnnual} bold highlight="green" />
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                Effective Tax Rate
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-navy-600 dark:text-navy-400">
                {formatPercent(effectiveRate, 2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Equivalency Row ────────────────────────────────────────────────────

function EquivRow({
  label,
  gross,
  net,
  bold = false,
}: {
  label: string;
  gross: number;
  net: number;
  bold?: boolean;
}) {
  return (
    <tr className={bold ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
      <td
        className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}
      >
        {label}
      </td>
      <td
        className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} text-slate-900 dark:text-slate-100`}
      >
        {formatCurrency(gross)}
      </td>
      <td
        className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} text-success-600 dark:text-success-500`}
      >
        {formatCurrency(net)}
      </td>
    </tr>
  );
}

// ─── Tax Row ────────────────────────────────────────────────────────────

function TaxRow({
  label,
  value,
  sublabel,
  bold = false,
  highlight,
  color,
}: {
  label: string;
  value: number;
  sublabel?: string;
  bold?: boolean;
  highlight?: 'red' | 'green';
  color?: 'red' | 'blue';
}) {
  const textColor =
    highlight === 'green'
      ? 'text-success-600 dark:text-success-500'
      : highlight === 'red'
        ? 'text-patriot-600 dark:text-patriot-400'
        : color === 'red'
          ? 'text-patriot-600 dark:text-patriot-400'
          : color === 'blue'
            ? 'text-navy-600 dark:text-navy-400'
            : 'text-slate-900 dark:text-slate-100';

  const bgColor =
    highlight === 'green'
      ? 'bg-success-50/50 dark:bg-success-900/10'
      : highlight === 'red'
        ? 'bg-patriot-50/50 dark:bg-patriot-900/10'
        : '';

  return (
    <tr className={bgColor}>
      <td
        className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}
      >
        {label}
        {sublabel && (
          <span className="block text-xs font-normal text-slate-400 dark:text-slate-500">
            {sublabel}
          </span>
        )}
      </td>
      <td
        className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}
      >
        {formatCurrency(value)}
      </td>
    </tr>
  );
}
