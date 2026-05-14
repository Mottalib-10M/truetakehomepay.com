import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateLotteryTax, type LotteryTaxResult } from '../../lib/tax-engine';
import { getStateTaxConfig } from '../../data/income-tax-2026/index';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import { formatCurrency, formatPercent } from '../../lib/format-us';
import { getStatesArray } from '../../data/state-meta';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// States that do not tax lottery winnings (no income tax or specific lottery exemption)
const NO_LOTTERY_TAX_STATES = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY', 'CA'];

const NO_LOTTERY_TAX_LABELS: Record<string, string> = {
  AK: 'Alaska',
  FL: 'Florida',
  NV: 'Nevada',
  NH: 'New Hampshire',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  WA: 'Washington',
  WY: 'Wyoming',
  CA: 'California',
};

interface LotteryTaxCalculatorProps {
  defaultState?: string;
  defaultWinnings?: number;
  defaultFilingStatus?: FilingStatus;
}

export default function LotteryTaxCalculator({
  defaultState = '',
  defaultWinnings,
  defaultFilingStatus = 'single',
}: LotteryTaxCalculatorProps) {
  // ─── State ─────────────────────────────────────────────────────────
  const [winningsInput, setWinningsInput] = useState(defaultWinnings?.toString() ?? '1000000');
  const [otherIncomeInput, setOtherIncomeInput] = useState('60000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(defaultFilingStatus);
  const [stateCode, setStateCode] = useState(defaultState);

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('winnings')) setWinningsInput(params.get('winnings')!);
    if (params.get('income')) setOtherIncomeInput(params.get('income')!);
    if (params.get('state')) setStateCode(params.get('state')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (winningsInput && winningsInput !== '1000000') params.set('winnings', winningsInput);
    if (otherIncomeInput && otherIncomeInput !== '60000') params.set('income', otherIncomeInput);
    if (stateCode) params.set('state', stateCode);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [winningsInput, otherIncomeInput, stateCode, filingStatus]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<LotteryTaxResult | null>(() => {
    const winnings = Number(winningsInput.replace(/[^0-9.]/g, ''));
    if (isNaN(winnings) || winnings <= 0) return null;

    const otherIncome = Number(otherIncomeInput.replace(/[^0-9.]/g, '')) || 0;
    const stateConfig = stateCode ? getStateTaxConfig(stateCode) : null;

    return calculateLotteryTax(winnings, filingStatus, stateCode, stateConfig, otherIncome);
  }, [winningsInput, otherIncomeInput, filingStatus, stateCode]);

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

  const winnings = Number(winningsInput.replace(/[^0-9.]/g, '')) || 0;

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Lottery Winnings Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="lottery-winnings"
              label="Lottery Winnings"
              value={winningsInput}
              onChange={setWinningsInput}
              prefix="$"
              placeholder="1,000,000"
              helpText="The advertised jackpot or prize amount (lump sum)"
            />

            <InputField
              id="other-income"
              label="Other Annual Income"
              value={otherIncomeInput}
              onChange={setOtherIncomeInput}
              prefix="$"
              placeholder="60,000"
              helpText="Your regular W-2/1099 income"
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
          <LotteryResultPanel result={result} winnings={winnings} stateCode={stateCode} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your lottery winnings to see your after-tax prize
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lottery Result Panel ─────────────────────────────────────────────

function LotteryResultPanel({
  result,
  winnings,
  stateCode,
}: {
  result: LotteryTaxResult;
  winnings: number;
  stateCode: string;
}) {
  const {
    federalWithholding,
    federalTaxOwed,
    additionalFederalDue,
    stateTax,
    totalTax,
    netWinnings,
    effectiveRate,
  } = result;

  // Annuity comparison: 60% of jackpot paid over 30 years
  const annuityTotal = winnings * 0.6;
  const annuityPerYear = annuityTotal / 30;

  const isNoTaxState = NO_LOTTERY_TAX_STATES.includes(stateCode);

  return (
    <div className="space-y-6">
      {/* Big hero number */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Net Winnings (What You Keep)</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(netWinnings)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          Total tax: {formatCurrency(totalTax)} &middot; Effective rate: {formatPercent(effectiveRate * 100, 1)}
        </p>
      </div>

      {/* Breakdown bar */}
      <LotteryBreakdownBar result={result} winnings={winnings} />

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
            <LotteryRow label="Lottery Winnings" value={winnings} bold />
            <LotteryRow
              label="Federal Withholding (24%)"
              value={federalWithholding}
              color="red"
              sublabel="Automatically withheld by the lottery"
            />
            <LotteryRow
              label="Additional Federal Tax Due"
              value={additionalFederalDue}
              color="red"
              show={additionalFederalDue > 0}
              sublabel="Owed at tax time above 24% withholding"
            />
            <LotteryRow
              label="Total Federal Tax"
              value={federalTaxOwed}
              bold
              color="red"
              highlight="red"
            />
            <LotteryRow
              label="State Tax"
              value={stateTax}
              color="red"
              show={stateTax > 0}
              sublabel={stateCode ? `${stateCode} state income tax on winnings` : undefined}
            />
            {stateCode && stateTax === 0 && (
              <tr>
                <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                  State Tax
                  <span className="block text-xs font-normal text-slate-400 dark:text-slate-500">
                    {isNoTaxState ? 'No state tax on lottery winnings' : 'No state income tax'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-success-600 dark:text-success-500">
                  $0.00
                </td>
              </tr>
            )}
            <LotteryRow label="Total Tax" value={totalTax} bold highlight="red" />
            <LotteryRow label="Net Winnings" value={netWinnings} bold highlight="green" />
          </tbody>
        </table>
      </div>

      {/* Lump sum vs annuity comparison */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Lump Sum vs. Annuity Comparison
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Annuity assumes 60% of jackpot paid over 30 years
          </p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
          <div className="p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Lump Sum</p>
            <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(winnings, 0)}
            </p>
            <p className="tabular-nums mt-1 text-xs text-slate-500 dark:text-slate-400">
              After tax: {formatCurrency(netWinnings, 0)}
            </p>
            <p className="tabular-nums text-xs text-patriot-600 dark:text-patriot-400">
              Tax: {formatCurrency(totalTax, 0)} ({formatPercent(effectiveRate * 100, 1)})
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Annuity (30 yr)</p>
            <p className="tabular-nums mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {formatCurrency(annuityTotal, 0)}
            </p>
            <p className="tabular-nums mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatCurrency(annuityPerYear, 0)} per year before tax
            </p>
            <p className="tabular-nums text-xs text-navy-600 dark:text-navy-400">
              Lower annual bracket, spread over 30 years
            </p>
          </div>
        </div>
      </div>

      {/* No-tax state note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          States with no tax on lottery winnings:
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
          {Object.entries(NO_LOTTERY_TAX_LABELS)
            .map(([abbr, name]) => `${name} (${abbr})`)
            .join(', ')}
          . California exempts state lottery winnings but taxes multi-state lottery prizes (Mega Millions, Powerball) at standard rates.
        </p>
      </div>
    </div>
  );
}

// ─── Lottery Breakdown Bar ───────────────────────────────────────────

function LotteryBreakdownBar({
  result,
  winnings,
}: {
  result: LotteryTaxResult;
  winnings: number;
}) {
  const { federalTaxOwed, stateTax, netWinnings } = result;

  if (winnings <= 0) return null;

  const segments = [
    { label: 'Federal Tax', value: federalTaxOwed, color: 'bg-patriot-500' },
    { label: 'State Tax', value: stateTax, color: 'bg-amber-500' },
    { label: 'What You Keep', value: netWinnings, color: 'bg-success-500' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / winnings) * 100}%` }}
            title={`${seg.label}: ${formatCurrency(seg.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {seg.label}: {formatCurrency(seg.value)} ({formatPercent((seg.value / winnings) * 100, 1)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lottery Table Row ───────────────────────────────────────────────

function LotteryRow({
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
