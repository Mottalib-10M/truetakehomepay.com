import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Tax Constants (2025 single filer, simplified) ─────────────────────────
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

// ─── Helper: progressive federal tax ───────────────────────────────────────
function calcFederalTax(grossAnnual: number): number {
  const taxable = Math.max(0, grossAnnual - STANDARD_DEDUCTION);
  let tax = 0;
  for (const bracket of FEDERAL_BRACKETS) {
    if (taxable <= bracket.min) break;
    const portion = Math.min(taxable, bracket.max) - bracket.min;
    tax += portion * bracket.rate;
  }
  return tax;
}

// ─── Helper: FICA taxes ────────────────────────────────────────────────────
function calcFica(grossAnnual: number): { ss: number; medicare: number; total: number } {
  const ss = Math.min(grossAnnual, SS_WAGE_BASE) * SS_RATE;
  const medicare = grossAnnual * MEDICARE_RATE;
  return { ss, medicare, total: ss + medicare };
}

// ─── OT Multiplier options ─────────────────────────────────────────────────
const OT_MULTIPLIER_OPTIONS = [
  { value: '1.5', label: '1.5x (Time and a Half)' },
  { value: '2', label: '2x (Double Time)' },
];

// ─── Result type ───────────────────────────────────────────────────────────
interface OvertimeResult {
  regularWeekly: number;
  otWeekly: number;
  totalWeeklyGross: number;
  annualRegular: number;
  annualOt: number;
  annualGrossWithOt: number;
  annualGrossWithoutOt: number;
  federalTaxWithOt: number;
  ficaWithOt: number;
  totalTaxWithOt: number;
  netAnnualWithOt: number;
  netWeeklyWithOt: number;
  federalTaxWithoutOt: number;
  ficaWithoutOt: number;
  totalTaxWithoutOt: number;
  netAnnualWithoutOt: number;
  netWeeklyWithoutOt: number;
  extraNetWeekly: number;
  extraNetAnnual: number;
  otEffectiveTaxRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════
export default function OvertimePayCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [rate, setRate] = useState('25');
  const [hours, setHours] = useState('40');
  const [otHours, setOtHours] = useState('10');
  const [multiplier, setMultiplier] = useState('1.5');
  const [weeks, setWeeks] = useState('52');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('rate')) setRate(params.get('rate')!);
    if (params.get('hours')) setHours(params.get('hours')!);
    if (params.get('ot')) setOtHours(params.get('ot')!);
    if (params.get('mult')) setMultiplier(params.get('mult')!);
    if (params.get('weeks')) setWeeks(params.get('weeks')!);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (rate && rate !== '25') params.set('rate', rate);
    if (hours && hours !== '40') params.set('hours', hours);
    if (otHours && otHours !== '10') params.set('ot', otHours);
    if (multiplier && multiplier !== '1.5') params.set('mult', multiplier);
    if (weeks && weeks !== '52') params.set('weeks', weeks);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [rate, hours, otHours, multiplier, weeks]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<OvertimeResult | null>(() => {
    const r = Number(rate.replace(/[^0-9.]/g, ''));
    const h = Number(hours.replace(/[^0-9.]/g, ''));
    const ot = Number(otHours.replace(/[^0-9.]/g, ''));
    const mult = Number(multiplier);
    const w = Number(weeks.replace(/[^0-9.]/g, ''));

    if (isNaN(r) || r <= 0 || isNaN(h) || h <= 0 || isNaN(w) || w <= 0) return null;
    if (isNaN(ot) || ot < 0) return null;

    const regularWeekly = r * h;
    const otWeekly = r * mult * ot;
    const totalWeeklyGross = regularWeekly + otWeekly;

    const annualRegular = regularWeekly * w;
    const annualOt = otWeekly * w;
    const annualGrossWithOt = annualRegular + annualOt;
    const annualGrossWithoutOt = annualRegular;

    // Taxes WITH overtime
    const federalTaxWithOt = calcFederalTax(annualGrossWithOt);
    const ficaObjWithOt = calcFica(annualGrossWithOt);
    const ficaWithOt = ficaObjWithOt.total;
    const totalTaxWithOt = federalTaxWithOt + ficaWithOt;
    const netAnnualWithOt = annualGrossWithOt - totalTaxWithOt;
    const netWeeklyWithOt = netAnnualWithOt / w;

    // Taxes WITHOUT overtime
    const federalTaxWithoutOt = calcFederalTax(annualGrossWithoutOt);
    const ficaObjWithoutOt = calcFica(annualGrossWithoutOt);
    const ficaWithoutOt = ficaObjWithoutOt.total;
    const totalTaxWithoutOt = federalTaxWithoutOt + ficaWithoutOt;
    const netAnnualWithoutOt = annualGrossWithoutOt - totalTaxWithoutOt;
    const netWeeklyWithoutOt = netAnnualWithoutOt / w;

    // Extra net from OT
    const extraNetAnnual = netAnnualWithOt - netAnnualWithoutOt;
    const extraNetWeekly = extraNetAnnual / w;

    // OT effective tax rate: marginal tax on OT portion
    const taxOnOt = totalTaxWithOt - totalTaxWithoutOt;
    const otEffectiveTaxRate = annualOt > 0 ? (taxOnOt / annualOt) * 100 : 0;

    return {
      regularWeekly,
      otWeekly,
      totalWeeklyGross,
      annualRegular,
      annualOt,
      annualGrossWithOt,
      annualGrossWithoutOt,
      federalTaxWithOt,
      ficaWithOt,
      totalTaxWithOt,
      netAnnualWithOt,
      netWeeklyWithOt,
      federalTaxWithoutOt,
      ficaWithoutOt,
      totalTaxWithoutOt,
      netAnnualWithoutOt,
      netWeeklyWithoutOt,
      extraNetWeekly,
      extraNetAnnual,
      otEffectiveTaxRate,
    };
  }, [rate, hours, otHours, multiplier, weeks]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Overtime Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="hourly-rate"
              label="Hourly Rate"
              value={rate}
              onChange={setRate}
              prefix="$"
              placeholder="25"
            />

            <InputField
              id="regular-hours"
              label="Regular Hours per Week"
              value={hours}
              onChange={setHours}
              placeholder="40"
              helpText="Standard hours before overtime kicks in"
            />

            <InputField
              id="ot-hours"
              label="Overtime Hours per Week"
              value={otHours}
              onChange={setOtHours}
              placeholder="10"
              helpText="Hours beyond your regular schedule"
            />

            <SelectField
              id="ot-multiplier"
              label="Overtime Multiplier"
              value={multiplier}
              onChange={setMultiplier}
              options={OT_MULTIPLIER_OPTIONS}
              helpText="FLSA requires at least 1.5x for non-exempt workers"
            />

            <InputField
              id="weeks-per-year"
              label="Weeks per Year"
              value={weeks}
              onChange={setWeeks}
              placeholder="52"
              helpText="Weeks you work per year (52 = no unpaid time off)"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <OvertimeResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your hourly rate and hours to see your overtime take-home pay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ───────────────────────────────────────────────────────────

function OvertimeResultPanel({ result }: { result: OvertimeResult }) {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white shadow-lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-center">
            <p className="text-sm font-medium text-navy-200">Weekly Take-Home (with OT)</p>
            <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight">
              {formatCurrency(result.netWeeklyWithOt)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-navy-200">Weekly Take-Home (without OT)</p>
            <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight">
              {formatCurrency(result.netWeeklyWithoutOt)}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-center">
          <p className="text-sm font-medium text-navy-200">Extra Take-Home from OT</p>
          <p className="tabular-nums mt-0.5 text-2xl font-bold text-success-400">
            +{formatCurrency(result.extraNetWeekly)}/wk
          </p>
          <p className="tabular-nums mt-0.5 text-sm text-navy-300">
            +{formatCurrencyRound(result.extraNetAnnual)}/yr &middot;
            OT taxed at {formatPercent(result.otEffectiveTaxRate, 1)} effective rate
          </p>
        </div>
      </div>

      {/* Breakdown bar */}
      <OvertimeBreakdownBar result={result} />

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
            <ResultRow label="Regular Weekly Gross" amount={result.regularWeekly} />
            <ResultRow label="OT Weekly Gross" amount={result.otWeekly} />
            <ResultRow label="Total Weekly Gross" amount={result.totalWeeklyGross} bold />

            {/* Spacer row */}
            <tr>
              <td
                colSpan={2}
                className="bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
              >
                Annual Breakdown
              </td>
            </tr>

            <ResultRow label="Annual Gross (without OT)" amount={result.annualGrossWithoutOt} />
            <ResultRow label="Annual Gross (with OT)" amount={result.annualGrossWithOt} bold />
            <ResultRow label="Annual OT Earnings" amount={result.annualOt} />
            <ResultRow
              label="Estimated Federal Tax"
              amount={-result.federalTaxWithOt}
              color="red"
              note="simplified single filer"
            />
            <ResultRow
              label="FICA Tax (SS + Medicare)"
              amount={-result.ficaWithOt}
              color="red"
            />
            <ResultRow
              label="Estimated Net Annual"
              amount={result.netAnnualWithOt}
              bold
            />
            <ResultRow label="Net Weekly" amount={result.netWeeklyWithOt} bold />

            {/* Spacer row */}
            <tr>
              <td
                colSpan={2}
                className="bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
              >
                Overtime Impact
              </td>
            </tr>

            <ResultRow
              label="Extra Net from OT (weekly)"
              amount={result.extraNetWeekly}
              highlight
              bold
            />
            <ResultRow
              label="Extra Net from OT (annual)"
              amount={result.extraNetAnnual}
              highlight
              bold
            />
            <tr className="bg-success-50/50 dark:bg-success-900/10">
              <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                OT Effective Tax Rate
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-success-600 dark:text-success-500">
                {formatPercent(result.otEffectiveTaxRate, 1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">How OT tax works: </span>
          Overtime is taxed as ordinary income &mdash; there is no special &ldquo;overtime tax rate.&rdquo;
          However, the extra earnings may push you into a higher marginal bracket, so the effective
          tax rate on your OT dollars can be higher than on your base pay. This calculator uses
          simplified federal tax brackets for a single filer with the standard deduction. Your actual
          withholding may differ based on your W-4, filing status, state taxes, and other deductions.
        </p>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ──────────────────────────────────────────────────────────

function OvertimeBreakdownBar({ result }: { result: OvertimeResult }) {
  const total = result.annualGrossWithOt;
  if (total <= 0) return null;

  const segments = [
    { label: 'Regular Pay', value: result.annualRegular, color: 'bg-navy-500' },
    { label: 'OT Pay', value: result.annualOt, color: 'bg-amber-500' },
    { label: 'Taxes', value: result.totalTaxWithOt, color: 'bg-patriot-500' },
  ].filter((s) => s.value > 0);

  // We show as proportion of gross (taxes overlap with pay, so use gross for sizing)
  const barTotal = result.annualGrossWithOt;

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / barTotal) * 100}%` }}
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

// ─── Table Row ──────────────────────────────────────────────────────────────

function ResultRow({
  label,
  amount,
  bold = false,
  highlight = false,
  color,
  note,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  highlight?: boolean;
  color?: 'red';
  note?: string;
}) {
  const textColor = highlight
    ? 'text-success-600 dark:text-success-500'
    : color === 'red'
      ? 'text-patriot-600 dark:text-patriot-400'
      : 'text-slate-900 dark:text-slate-100';

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td
        className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}
      >
        {label}
        {note && (
          <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
            ({note})
          </span>
        )}
      </td>
      <td
        className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}
      >
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}
