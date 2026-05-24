import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateCapitalGainsTax, type CapitalGainsTaxResult } from '../../lib/tax-engine';
import { getStateTaxConfig } from '../../data/income-tax-2026/index';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import { formatCurrency, formatPercent } from '../../lib/format-us';
import { getStatesArray } from '../../data/state-meta';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

interface CapitalGainsTaxCalculatorProps {
  defaultState?: string;
  defaultGains?: number;
  defaultFilingStatus?: FilingStatus;
}

export default function CapitalGainsTaxCalculator({
  defaultState = '',
  defaultGains,
  defaultFilingStatus = 'single',
}: CapitalGainsTaxCalculatorProps) {
  // ─── State ─────────────────────────────────────────────────────────
  const [gainsInput, setGainsInput] = useState(defaultGains?.toString() ?? '50000');
  const [gainType, setGainType] = useState<'long' | 'short'>('long');
  const [ordinaryIncomeInput, setOrdinaryIncomeInput] = useState('75000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(defaultFilingStatus);
  const [stateCode, setStateCode] = useState(defaultState);

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gains')) setGainsInput(params.get('gains')!);
    if (params.get('type')) setGainType(params.get('type') as 'long' | 'short');
    if (params.get('income')) setOrdinaryIncomeInput(params.get('income')!);
    if (params.get('state')) setStateCode(params.get('state')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  // Update URL when inputs change
  const defaultGainsStr = defaultGains?.toString() ?? '50000';
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (gainsInput && gainsInput !== defaultGainsStr) params.set('gains', gainsInput);
    if (gainType !== 'long') params.set('type', gainType);
    if (ordinaryIncomeInput && ordinaryIncomeInput !== '75000') params.set('income', ordinaryIncomeInput);
    if (stateCode && stateCode !== defaultState) params.set('state', stateCode);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [gainsInput, defaultGainsStr, gainType, ordinaryIncomeInput, stateCode, defaultState, filingStatus]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<CapitalGainsTaxResult | null>(() => {
    const gains = Number(gainsInput.replace(/[^0-9.]/g, ''));
    if (isNaN(gains) || gains <= 0) return null;

    const ordinaryIncome = Number(ordinaryIncomeInput.replace(/[^0-9.]/g, '')) || 0;
    const stateConfig = stateCode ? getStateTaxConfig(stateCode) : null;

    return calculateCapitalGainsTax(
      gains,
      gainType === 'long',
      ordinaryIncome,
      filingStatus,
      stateCode,
      stateConfig
    );
  }, [gainsInput, gainType, ordinaryIncomeInput, filingStatus, stateCode]);

  // ─── Derived values ────────────────────────────────────────────────
  const gains = Number(gainsInput.replace(/[^0-9.]/g, '')) || 0;
  const afterTaxGain = result ? gains - result.totalTax : 0;

  // ─── Options ───────────────────────────────────────────────────────
  const states = useMemo(() => getStatesArray(), []);
  const stateOptions = [
    { value: '', label: 'Select a state...' },
    ...states.map((s) => ({ value: s.code, label: s.name })),
  ];

  const filingOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
    value,
    label,
  }));

  const gainTypeOptions = [
    { value: 'long', label: 'Long-Term (held > 1 year)' },
    { value: 'short', label: 'Short-Term (held ≤ 1 year)' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Capital Gains Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="capital-gains"
              label="Capital Gains"
              value={gainsInput}
              onChange={setGainsInput}
              prefix="$"
              placeholder="50,000"
              helpText="Total capital gains from investments"
            />

            <SelectField
              id="gain-type"
              label="Gain Type"
              value={gainType}
              onChange={(v) => setGainType(v as 'long' | 'short')}
              options={gainTypeOptions}
            />

            <InputField
              id="ordinary-income"
              label="Other Ordinary Income"
              value={ordinaryIncomeInput}
              onChange={setOrdinaryIncomeInput}
              prefix="$"
              placeholder="75,000"
              helpText="Your W-2 or other income besides the capital gain"
            />

            <SelectField
              id="filing-status"
              label="Filing Status"
              value={filingStatus}
              onChange={(v) => setFilingStatus(v as FilingStatus)}
              options={filingOptions}
            />

            <SelectField
              id="state"
              label="State"
              value={stateCode}
              onChange={setStateCode}
              options={stateOptions}
            />
          </div>
        </div>
      </div>

      {/* Results panel */}
      <div className="lg:col-span-3">
        {result ? (
          <div className="space-y-6">
            {/* Big hero: Total Tax */}
            <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
              <p className="text-sm font-medium text-navy-200">Total Tax on Gains</p>
              <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {formatCurrency(result.totalTax)}
              </p>
              <p className="tabular-nums mt-2 text-sm text-navy-300">
                {formatPercent(result.effectiveRate * 100, 1)} effective rate &middot; {formatCurrency(afterTaxGain)} after tax
              </p>
            </div>

            {/* Breakdown bar */}
            <BreakdownBar result={result} gains={gains} />

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
                  <Row label="Capital Gain Amount" value={gains} bold />
                  <Row label="Federal Capital Gains Tax" value={-result.federalTax} color="red" />
                  <Row label="Net Investment Income Tax (NIIT, 3.8%)" value={-result.niit} color="red" show={result.niit > 0} />
                  <Row label="State Tax on Gains" value={-result.stateTax} color="red" show={result.stateTax > 0} />
                  <Row label="Total Tax" value={-result.totalTax} color="red" bold />
                  <Row label="After-Tax Gain" value={afterTaxGain} bold highlight />
                  <Row label="Effective Rate" value={result.effectiveRate} isPercent />
                </tbody>
              </table>
            </div>

            {/* Informational note */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {gainType === 'long' ? 'Long-Term Capital Gains Rates' : 'Short-Term Capital Gains Rates'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {gainType === 'long'
                  ? 'Long-term capital gains (assets held over 1 year) are taxed at preferential rates of 0%, 15%, or 20% depending on your total taxable income. An additional 3.8% Net Investment Income Tax (NIIT) may apply if your income exceeds the threshold.'
                  : 'Short-term capital gains (assets held 1 year or less) are taxed at your ordinary income tax rates (10% to 37%). There is no preferential rate for short-term gains. The 3.8% NIIT may also apply on top of ordinary rates.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your capital gains to see your tax estimate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Breakdown Bar ─────────────────────────────────────────────────────

function BreakdownBar({ result, gains }: { result: CapitalGainsTaxResult; gains: number }) {
  if (gains <= 0) return null;

  const afterTax = gains - result.totalTax;

  const segments = [
    { label: 'Federal CG Tax', value: result.federalTax, color: 'bg-patriot-500' },
    { label: 'NIIT', value: result.niit, color: 'bg-orange-400' },
    { label: 'State Tax', value: result.stateTax, color: 'bg-amber-500' },
    { label: 'After Tax', value: afterTax, color: 'bg-success-500' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / gains) * 100}%` }}
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

// ─── Table Row ─────────────────────────────────────────────────────────

function Row({
  label,
  value,
  bold = false,
  highlight = false,
  color,
  show = true,
  isPercent = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  color?: 'red';
  show?: boolean;
  isPercent?: boolean;
}) {
  if (!show) return null;

  const textColor =
    highlight ? 'text-success-600 dark:text-success-500' :
    color === 'red' ? 'text-patriot-600 dark:text-patriot-400' :
    'text-slate-900 dark:text-slate-100';

  return (
    <tr className={highlight ? 'bg-success-50/50 dark:bg-success-900/10' : ''}>
      <td className={`px-4 py-2.5 ${bold ? 'font-semibold' : ''} text-slate-700 dark:text-slate-300`}>
        {label}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {isPercent ? formatPercent(value * 100, 1) : formatCurrency(value)}
      </td>
    </tr>
  );
}
