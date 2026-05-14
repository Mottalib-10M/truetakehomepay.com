import { useState, useMemo, useCallback, useEffect } from 'react';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import { formatCurrency, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Tax Constants ──────────────────────────────────────────────────────
const SS_RATE = 0.062;
const SS_WAGE_BASE = 176100;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  mfs: 125000,
  hoh: 200000,
};

// ─── Result Interface ───────────────────────────────────────────────────
interface PayrollTaxResult {
  wages: number;
  employeeSS: number;
  employeeMedicare: number;
  additionalMedicare: number;
  totalEmployeeFICA: number;
  employerSS: number;
  employerMedicare: number;
  totalEmployerFICA: number;
  combinedFICA: number;
  ssWageBaseRemaining: number;
  effectiveFICARate: number;
  additionalMedicareThreshold: number;
}

export default function PayrollTaxCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [wagesInput, setWagesInput] = useState('80000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('wages')) setWagesInput(params.get('wages')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (wagesInput && wagesInput !== '80000') params.set('wages', wagesInput);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [wagesInput, filingStatus]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<PayrollTaxResult | null>(() => {
    const wages = Number(wagesInput.replace(/[^0-9.]/g, ''));
    if (isNaN(wages) || wages <= 0) return null;

    const threshold = ADDITIONAL_MEDICARE_THRESHOLDS[filingStatus];

    // Social Security: 6.2% on wages up to wage base
    const ssTaxableWages = Math.min(wages, SS_WAGE_BASE);
    const employeeSS = ssTaxableWages * SS_RATE;
    const employerSS = ssTaxableWages * SS_RATE;

    // Medicare: 1.45% on all wages
    const employeeMedicare = wages * MEDICARE_RATE;
    const employerMedicare = wages * MEDICARE_RATE;

    // Additional Medicare: 0.9% on wages above threshold (employee only)
    const additionalMedicare = wages > threshold
      ? (wages - threshold) * ADDITIONAL_MEDICARE_RATE
      : 0;

    const totalEmployeeFICA = employeeSS + employeeMedicare + additionalMedicare;
    const totalEmployerFICA = employerSS + employerMedicare;
    const combinedFICA = totalEmployeeFICA + totalEmployerFICA;

    const ssWageBaseRemaining = Math.max(0, SS_WAGE_BASE - wages);
    const effectiveFICARate = wages > 0 ? totalEmployeeFICA / wages : 0;

    return {
      wages,
      employeeSS,
      employeeMedicare,
      additionalMedicare,
      totalEmployeeFICA,
      employerSS,
      employerMedicare,
      totalEmployerFICA,
      combinedFICA,
      ssWageBaseRemaining,
      effectiveFICARate,
      additionalMedicareThreshold: threshold,
    };
  }, [wagesInput, filingStatus]);

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
            Payroll Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="annual-wages"
              label="Annual Gross Wages"
              value={wagesInput}
              onChange={setWagesInput}
              prefix="$"
              placeholder="80,000"
              helpText="Your total annual gross wages before any deductions"
            />

            <SelectField
              id="filing-status"
              label="Filing Status"
              value={filingStatus}
              onChange={(v) => setFilingStatus(v as FilingStatus)}
              options={filingOptions}
              helpText="Affects the Additional Medicare Tax threshold"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <PayrollResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your annual gross wages to see your FICA tax breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ───────────────────────────────────────────────────────

function PayrollResultPanel({ result }: { result: PayrollTaxResult }) {
  const {
    wages,
    employeeSS,
    employeeMedicare,
    additionalMedicare,
    totalEmployeeFICA,
    employerSS,
    employerMedicare,
    totalEmployerFICA,
    combinedFICA,
    ssWageBaseRemaining,
    effectiveFICARate,
  } = result;

  return (
    <div className="space-y-6">
      {/* Big hero number */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Total Employee FICA (Annual)</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(totalEmployeeFICA)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Effective FICA Rate: {formatPercent(effectiveFICARate * 100, 2)}
        </p>
      </div>

      {/* Breakdown bar: SS | Medicare | Additional Medicare */}
      <PayrollBreakdownBar result={result} />

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
            <PayrollRow label="Gross Wages" value={wages} bold />

            {/* Employee portion header */}
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <td colSpan={2} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Employee Portion
              </td>
            </tr>
            <PayrollRow
              label="Social Security Tax"
              value={employeeSS}
              color="red"
              sublabel={`${formatPercent(SS_RATE * 100, 1)} on first ${formatCurrency(SS_WAGE_BASE, 0)}`}
            />
            <PayrollRow
              label="Medicare Tax"
              value={employeeMedicare}
              color="red"
              sublabel={`${formatPercent(MEDICARE_RATE * 100, 2)} on all wages`}
            />
            <PayrollRow
              label="Additional Medicare Tax"
              value={additionalMedicare}
              color="red"
              show={additionalMedicare > 0}
              sublabel={`${formatPercent(ADDITIONAL_MEDICARE_RATE * 100, 1)} on wages above ${formatCurrency(result.additionalMedicareThreshold, 0)}`}
            />
            <PayrollRow
              label="Total Employee FICA"
              value={totalEmployeeFICA}
              bold
              color="red"
              highlight="red"
            />

            {/* Employer portion header */}
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <td colSpan={2} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Employer Portion
              </td>
            </tr>
            <PayrollRow
              label="Social Security Tax (Employer)"
              value={employerSS}
              color="blue"
              sublabel={`${formatPercent(SS_RATE * 100, 1)} on first ${formatCurrency(SS_WAGE_BASE, 0)}`}
            />
            <PayrollRow
              label="Medicare Tax (Employer)"
              value={employerMedicare}
              color="blue"
              sublabel={`${formatPercent(MEDICARE_RATE * 100, 2)} on all wages`}
            />
            <PayrollRow
              label="Total Employer FICA"
              value={totalEmployerFICA}
              bold
              color="blue"
              highlight="blue"
              sublabel="Employer does not pay Additional Medicare Tax"
            />

            {/* Combined */}
            <PayrollRow
              label="Combined FICA"
              value={combinedFICA}
              bold
              highlight="red"
              sublabel="Employee + Employer total"
            />

            {/* SS wage base remaining */}
            <PayrollRow
              label="SS Wage Base Remaining"
              value={ssWageBaseRemaining}
              show={ssWageBaseRemaining > 0}
              highlight="green"
              sublabel={`${formatCurrency(SS_WAGE_BASE, 0)} wage base minus ${formatCurrency(wages, 0)} wages`}
            />

            {/* Effective rate */}
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                Effective FICA Rate
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-navy-600 dark:text-navy-400">
                {formatPercent(effectiveFICARate * 100, 2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ──────────────────────────────────────────────────────

function PayrollBreakdownBar({ result }: { result: PayrollTaxResult }) {
  const { totalEmployeeFICA, employeeSS, employeeMedicare, additionalMedicare } = result;

  if (totalEmployeeFICA <= 0) return null;

  const segments = [
    { label: 'Social Security', value: employeeSS, color: 'bg-patriot-500' },
    { label: 'Medicare', value: employeeMedicare, color: 'bg-amber-500' },
    { label: 'Additional Medicare', value: additionalMedicare, color: 'bg-orange-400' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / totalEmployeeFICA) * 100}%` }}
            title={`${seg.label}: ${formatCurrency(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrency(seg.value)} ({formatPercent((seg.value / totalEmployeeFICA) * 100, 1)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ──────────────────────────────────────────────────────────

function PayrollRow({
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
  highlight?: 'red' | 'green' | 'blue';
  color?: 'red' | 'blue';
  show?: boolean;
}) {
  if (!show) return null;

  const textColor =
    highlight === 'green' ? 'text-success-600 dark:text-success-500' :
    highlight === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    highlight === 'blue' ? 'text-navy-600 dark:text-navy-400' :
    color === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    color === 'blue' ? 'text-navy-600 dark:text-navy-400' :
    'text-slate-900 dark:text-slate-100';

  const bgColor =
    highlight === 'green' ? 'bg-success-50/50 dark:bg-success-900/10' :
    highlight === 'red' ? 'bg-patriot-50/50 dark:bg-patriot-900/10' :
    highlight === 'blue' ? 'bg-navy-50/50 dark:bg-navy-900/10' :
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
