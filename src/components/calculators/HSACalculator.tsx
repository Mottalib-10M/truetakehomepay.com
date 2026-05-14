import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatCurrencyRound, formatPercent } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── 2026 HSA Constants ────────────────────────────────────────────────
const HSA_LIMIT_SELF = 4300;
const HSA_LIMIT_FAMILY = 8550;
const HSA_CATCHUP = 1000; // age 55+
const FICA_RATE = 0.0765;

export default function HSACalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [incomeInput, setIncomeInput] = useState('80000');
  const [hsaInput, setHsaInput] = useState('4300');
  const [coverage, setCoverage] = useState('self');
  const [age55, setAge55] = useState('no');
  const [fedRate, setFedRate] = useState('22');
  const [stateRateInput, setStateRateInput] = useState('5');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('income')) setIncomeInput(params.get('income')!);
    if (params.get('hsa')) setHsaInput(params.get('hsa')!);
    if (params.get('coverage')) setCoverage(params.get('coverage')!);
    if (params.get('age55')) setAge55(params.get('age55')!);
    if (params.get('fedrate')) setFedRate(params.get('fedrate')!);
    if (params.get('staterate')) setStateRateInput(params.get('staterate')!);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (incomeInput && incomeInput !== '80000') params.set('income', incomeInput);
    if (hsaInput && hsaInput !== '4300') params.set('hsa', hsaInput);
    if (coverage !== 'self') params.set('coverage', coverage);
    if (age55 !== 'no') params.set('age55', age55);
    if (fedRate !== '22') params.set('fedrate', fedRate);
    if (stateRateInput && stateRateInput !== '5') params.set('staterate', stateRateInput);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [incomeInput, hsaInput, coverage, age55, fedRate, stateRateInput]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo(() => {
    const contribution = Number(hsaInput.replace(/[^0-9.]/g, ''));
    if (isNaN(contribution) || contribution <= 0) return null;

    const fedRateDecimal = Number(fedRate) / 100;
    const stateRateDecimal = Number(stateRateInput.replace(/[^0-9.]/g, '')) / 100;

    const baseLimit = coverage === 'family' ? HSA_LIMIT_FAMILY : HSA_LIMIT_SELF;
    const catchUp = age55 === 'yes' ? HSA_CATCHUP : 0;
    const limit = baseLimit + catchUp;

    // Cap contribution at the limit for calculation purposes
    const effectiveContribution = Math.min(contribution, limit);

    const federalSavings = effectiveContribution * fedRateDecimal;
    const stateSavings = effectiveContribution * stateRateDecimal;
    const ficaSavings = effectiveContribution * FICA_RATE;
    const totalSavings = federalSavings + stateSavings + ficaSavings;
    const monthlySavings = totalSavings / 12;
    const effectiveDiscount = effectiveContribution > 0 ? (totalSavings / effectiveContribution) * 100 : 0;

    return {
      contribution: effectiveContribution,
      limit,
      federalSavings,
      stateSavings,
      ficaSavings,
      totalSavings,
      monthlySavings,
      effectiveDiscount,
      overLimit: contribution > limit,
    };
  }, [hsaInput, fedRate, stateRateInput, coverage, age55]);

  // ─── Options ───────────────────────────────────────────────────────
  const coverageOptions = [
    { value: 'self', label: 'Self-Only' },
    { value: 'family', label: 'Family' },
  ];

  const age55Options = [
    { value: 'no', label: 'No' },
    { value: 'yes', label: 'Yes' },
  ];

  const fedRateOptions = [
    { value: '10', label: '10%' },
    { value: '12', label: '12%' },
    { value: '22', label: '22%' },
    { value: '24', label: '24%' },
    { value: '32', label: '32%' },
    { value: '35', label: '35%' },
    { value: '37', label: '37%' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            HSA Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="annual-income"
              label="Annual Income"
              value={incomeInput}
              onChange={setIncomeInput}
              prefix="$"
              placeholder="80,000"
              helpText="Your gross annual salary or wages"
            />

            <InputField
              id="hsa-contribution"
              label="HSA Contribution"
              value={hsaInput}
              onChange={setHsaInput}
              prefix="$"
              placeholder="4,300"
              helpText="Your annual HSA contribution (pre-tax via payroll)"
            />

            <SelectField
              id="coverage-type"
              label="Coverage Type"
              value={coverage}
              onChange={setCoverage}
              options={coverageOptions}
            />

            <SelectField
              id="age-55-plus"
              label="Age 55 or Older?"
              value={age55}
              onChange={setAge55}
              options={age55Options}
              helpText="Adds $1,000 catch-up contribution limit"
            />

            <SelectField
              id="federal-rate"
              label="Federal Marginal Tax Rate"
              value={fedRate}
              onChange={setFedRate}
              options={fedRateOptions}
              helpText="Your highest federal income tax bracket"
            />

            <InputField
              id="state-rate"
              label="Estimated State Tax Rate"
              value={stateRateInput}
              onChange={setStateRateInput}
              suffix="%"
              placeholder="5"
              helpText="Your state income tax rate (0% if no state tax)"
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <HSAResultPanel result={result} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your HSA contribution to see your tax savings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Types ──────────────────────────────────────────────────────

interface HSAResult {
  contribution: number;
  limit: number;
  federalSavings: number;
  stateSavings: number;
  ficaSavings: number;
  totalSavings: number;
  monthlySavings: number;
  effectiveDiscount: number;
  overLimit: boolean;
}

// ─── Result Panel ──────────────────────────────────────────────────────

function HSAResultPanel({ result }: { result: HSAResult }) {
  return (
    <div className="space-y-6">
      {/* Big hero: Total Tax Savings */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Total Annual Tax Savings from HSA</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(result.totalSavings)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrencyRound(result.monthlySavings)}/mo savings &middot; {formatPercent(result.effectiveDiscount, 1)} effective discount
        </p>
      </div>

      {/* Over-limit warning */}
      {result.overLimit && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-900/20">
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Contribution exceeds limit: </span>
            Your contribution was capped to the {formatCurrencyRound(result.limit)} limit for this calculation.
            Excess contributions may incur a 6% excise tax.
          </p>
        </div>
      )}

      {/* Breakdown bar */}
      <SavingsBreakdownBar result={result} />

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
            <HSARow label="HSA Contribution" value={result.contribution} bold />
            <HSARow label="Contribution Limit (2026)" value={result.limit} note />
            <HSARow label="Federal Tax Savings" value={result.federalSavings} highlight />
            <HSARow label="State Tax Savings" value={result.stateSavings} highlight show={result.stateSavings > 0} />
            <HSARow label="FICA Tax Savings (7.65%)" value={result.ficaSavings} highlight />
            <HSARow label="Total Tax Savings" value={result.totalSavings} bold highlight />
            <HSARow label="Effective Discount" value={result.effectiveDiscount} isPercent />
            <HSARow label="Monthly Tax Savings" value={result.monthlySavings} />
          </tbody>
        </table>
      </div>

      {/* Triple tax advantage note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          HSA Triple Tax Advantage
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Unlike a 401(k), HSA contributions made through payroll also reduce your FICA taxes
          (Social Security + Medicare). The HSA offers a unique triple tax advantage:
          (1) contributions are tax-deductible, reducing federal, state, and FICA taxes;
          (2) investment growth inside the account is tax-free;
          (3) withdrawals for qualified medical expenses are completely tax-free.
          No other savings vehicle in the U.S. tax code offers all three benefits.
        </p>
      </div>
    </div>
  );
}

// ─── Savings Breakdown Bar ──────────────────────────────────────────────

function SavingsBreakdownBar({ result }: { result: HSAResult }) {
  const total = result.totalSavings;
  if (total <= 0) return null;

  const segments = [
    { label: 'Federal', value: result.federalSavings, color: 'bg-patriot-500' },
    { label: 'State', value: result.stateSavings, color: 'bg-amber-500' },
    { label: 'FICA', value: result.ficaSavings, color: 'bg-purple-400' },
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
              {seg.label}: {formatCurrency(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ──────────────────────────────────────────────────────────

function HSARow({
  label,
  value,
  bold = false,
  highlight = false,
  show = true,
  note = false,
  isPercent = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  show?: boolean;
  note?: boolean;
  isPercent?: boolean;
}) {
  if (!show) return null;

  const textColor = highlight
    ? 'text-success-600 dark:text-success-500'
    : note
      ? 'text-slate-500 dark:text-slate-400'
      : 'text-slate-900 dark:text-slate-100';

  return (
    <tr className={highlight && bold ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {isPercent ? formatPercent(value, 1) : formatCurrency(value)}
      </td>
    </tr>
  );
}
