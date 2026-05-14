import { useState, useMemo, useCallback, useEffect } from 'react';
import { calculateBonusTax, type BonusTaxResult } from '../../lib/tax-engine';
import { getStateTaxConfig } from '../../data/income-tax-2026/index';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import { formatCurrency, formatPercent } from '../../lib/format-us';
import { getStatesArray } from '../../data/state-meta';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

interface BonusTaxCalculatorProps {
  defaultState?: string;
  defaultBonus?: number;
  defaultFilingStatus?: FilingStatus;
}

export default function BonusTaxCalculator({
  defaultState = '',
  defaultBonus,
  defaultFilingStatus = 'single',
}: BonusTaxCalculatorProps) {
  // ─── State ─────────────────────────────────────────────────────────
  const [bonusInput, setBonusInput] = useState(defaultBonus?.toString() ?? '5000');
  const [ytdGrossInput, setYtdGrossInput] = useState('50000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>(defaultFilingStatus);
  const [stateCode, setStateCode] = useState(defaultState);

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('bonus')) setBonusInput(params.get('bonus')!);
    if (params.get('ytd')) setYtdGrossInput(params.get('ytd')!);
    if (params.get('state')) setStateCode(params.get('state')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  // Update URL when inputs change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (bonusInput && bonusInput !== '5000') params.set('bonus', bonusInput);
    if (ytdGrossInput && ytdGrossInput !== '50000') params.set('ytd', ytdGrossInput);
    if (stateCode) params.set('state', stateCode);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [bonusInput, ytdGrossInput, stateCode, filingStatus]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<BonusTaxResult | null>(() => {
    const bonus = Number(bonusInput.replace(/[^0-9.]/g, ''));
    if (isNaN(bonus) || bonus <= 0) return null;

    const ytdGross = Number(ytdGrossInput.replace(/[^0-9.]/g, ''));
    const stateConfig = stateCode ? getStateTaxConfig(stateCode) : null;

    return calculateBonusTax(bonus, ytdGross || 0, stateCode, filingStatus, stateConfig);
  }, [bonusInput, ytdGrossInput, stateCode, filingStatus]);

  // ─── Derived values ────────────────────────────────────────────────
  const bonusAmount = Number(bonusInput.replace(/[^0-9.]/g, '')) || 0;
  const effectiveRate = bonusAmount > 0 && result ? (result.totalTax / bonusAmount) * 100 : 0;

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

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Your Bonus Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="bonus-amount"
              label="Bonus Amount"
              value={bonusInput}
              onChange={setBonusInput}
              prefix="$"
              placeholder="5,000"
            />

            <InputField
              id="ytd-gross"
              label="Year-to-Date Gross Income"
              value={ytdGrossInput}
              onChange={setYtdGrossInput}
              prefix="$"
              placeholder="50,000"
              helpText="Your total gross pay so far this year before the bonus"
            />

            <SelectField
              id="state"
              label="State"
              value={stateCode}
              onChange={setStateCode}
              options={stateOptions}
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
          <BonusResultPanel
            result={result}
            bonusAmount={bonusAmount}
            effectiveRate={effectiveRate}
          />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your bonus amount to see your take-home
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Panel ───────────────────────────────────────────────────────

function BonusResultPanel({
  result,
  bonusAmount,
  effectiveRate,
}: {
  result: BonusTaxResult;
  bonusAmount: number;
  effectiveRate: number;
}) {
  return (
    <div className="space-y-6">
      {/* Big hero: Net Bonus */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-center text-white shadow-lg">
        <p className="text-sm font-medium text-navy-200">Your Take-Home Bonus</p>
        <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(result.netBonus)}
        </p>
        <p className="tabular-nums mt-2 text-sm text-navy-300">
          {formatCurrency(result.totalTax)} total tax withheld &middot; {formatPercent(effectiveRate, 1)} effective rate
        </p>
      </div>

      {/* Breakdown bar */}
      <BonusBreakdownBar result={result} bonusAmount={bonusAmount} />

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
            <BonusRow label="Bonus Amount" amount={bonusAmount} bold />
            <BonusRow
              label="Federal Withholding (22% flat)"
              amount={-result.federalWithholding}
              color="red"
              note={bonusAmount > 1000000 ? '37% on amount over $1M' : undefined}
            />
            <BonusRow
              label="Social Security (6.2%)"
              amount={-result.socialSecurity}
              color="red"
            />
            <BonusRow
              label="Medicare (1.45%)"
              amount={-result.medicare}
              color="red"
            />
            <BonusRow
              label="State Tax"
              amount={-result.stateTax}
              color="red"
              show={result.stateTax > 0}
            />
            <BonusRow
              label="Total Tax Withheld"
              amount={-result.totalTax}
              bold
              color="red"
            />
            <BonusRow
              label="Net Bonus (Take-Home)"
              amount={result.netBonus}
              bold
              highlight
            />
          </tbody>
        </table>
      </div>

      {/* IRS supplemental rate note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">How bonus tax works: </span>
          The IRS treats bonuses as &ldquo;supplemental wages&rdquo; and requires employers to withhold
          federal tax at a flat 22% rate (or 37% for the portion exceeding $1 million). This is
          separate from your regular income tax bracket. Social Security tax (6.2%) applies until
          your year-to-date wages reach the $176,100 wage base, and Medicare (1.45%) applies with
          no cap. Your actual tax liability may differ at filing time — the 22% is a withholding
          rate, not your final tax rate.
        </p>
      </div>
    </div>
  );
}

// ─── Breakdown Bar ────────────────────────────────────────────────────────

function BonusBreakdownBar({
  result,
  bonusAmount,
}: {
  result: BonusTaxResult;
  bonusAmount: number;
}) {
  if (bonusAmount <= 0) return null;

  const segments = [
    { label: 'Federal', value: result.federalWithholding, color: 'bg-patriot-500' },
    { label: 'State', value: result.stateTax, color: 'bg-amber-500' },
    { label: 'Social Security', value: result.socialSecurity, color: 'bg-orange-400' },
    { label: 'Medicare', value: result.medicare, color: 'bg-purple-400' },
    { label: 'Take-Home', value: result.netBonus, color: 'bg-success-500' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-6 overflow-hidden rounded-full">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${(seg.value / bonusAmount) * 100}%` }}
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

function BonusRow({
  label,
  amount,
  bold = false,
  highlight = false,
  color,
  show = true,
  note,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  highlight?: boolean;
  color?: 'red';
  show?: boolean;
  note?: string;
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
        {note && (
          <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
            ({note})
          </span>
        )}
      </td>
      <td className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}>
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}
