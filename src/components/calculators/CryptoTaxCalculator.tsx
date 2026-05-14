import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatPercent } from '../../lib/format-us';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Constants ────────────────────────────────────────────────────────

const STD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15700,
  mfj: 31400,
  mfs: 15700,
  hoh: 23500,
};

const FEDERAL_BRACKETS: Record<FilingStatus, { min: number; max: number; rate: number }[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 752800, rate: 0.35 },
    { min: 752800, max: Infinity, rate: 0.37 },
  ],
  mfs: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 376400, rate: 0.35 },
    { min: 376400, max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

const LTCG_BRACKETS: Record<FilingStatus, { max: number; rate: number }[]> = {
  single: [
    { max: 48475, rate: 0 },
    { max: 533400, rate: 0.15 },
    { max: Infinity, rate: 0.20 },
  ],
  mfj: [
    { max: 96950, rate: 0 },
    { max: 600050, rate: 0.15 },
    { max: Infinity, rate: 0.20 },
  ],
  mfs: [
    { max: 48475, rate: 0 },
    { max: 300025, rate: 0.15 },
    { max: Infinity, rate: 0.20 },
  ],
  hoh: [
    { max: 64850, rate: 0 },
    { max: 566700, rate: 0.15 },
    { max: Infinity, rate: 0.20 },
  ],
};

const NIIT_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  mfs: 125000,
  hoh: 200000,
};

// ─── Tax helpers ──────────────────────────────────────────────────────

function calcOrdinaryTaxOnRange(
  start: number,
  amount: number,
  filing: FilingStatus
): number {
  const brackets = FEDERAL_BRACKETS[filing];
  let remaining = amount;
  let tax = 0;
  let cursor = start;

  for (const bracket of brackets) {
    if (cursor >= bracket.max || remaining <= 0) continue;
    const bracketStart = Math.max(cursor, bracket.min);
    const bracketSpace = bracket.max - bracketStart;
    const taxable = Math.min(remaining, bracketSpace);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    cursor += taxable;
  }

  return tax;
}

function getMarginalRate(taxableIncome: number, filing: FilingStatus): number {
  const brackets = FEDERAL_BRACKETS[filing];
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) return bracket.rate;
  }
  return 0.37;
}

function calcLongTermCGTax(
  gain: number,
  ordinaryTaxableIncome: number,
  filing: FilingStatus
): number {
  const brackets = LTCG_BRACKETS[filing];
  let remaining = gain;
  let tax = 0;
  let cursor = ordinaryTaxableIncome;

  for (const bracket of brackets) {
    if (cursor >= bracket.max || remaining <= 0) continue;
    const space = bracket.max - cursor;
    const taxable = Math.min(remaining, space);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    cursor += taxable;
  }

  return tax;
}

function getLTCGRate(
  ordinaryTaxableIncome: number,
  filing: FilingStatus
): number {
  const brackets = LTCG_BRACKETS[filing];
  for (const bracket of brackets) {
    if (ordinaryTaxableIncome < bracket.max) return bracket.rate;
  }
  return 0.20;
}

function calcNIIT(
  gain: number,
  totalIncome: number,
  filing: FilingStatus
): number {
  const threshold = NIIT_THRESHOLD[filing];
  if (totalIncome <= threshold) return 0;
  const excess = totalIncome - threshold;
  const niitBase = Math.min(gain, excess);
  return niitBase * 0.038;
}

// ─── Result type ──────────────────────────────────────────────────────

interface CryptoTaxResult {
  costBasis: number;
  saleProceeds: number;
  gain: number;
  isLoss: boolean;
  isLongTerm: boolean;
  taxRate: number;
  federalTax: number;
  niit: number;
  totalTax: number;
  netAfterTax: number;
  effectiveRate: number;
  altTax: number;
  altNiit: number;
  altTotal: number;
  altRate: number;
}

// ─── Component ────────────────────────────────────────────────────────

export default function CryptoTaxCalculator() {
  // ─── State ─────────────────────────────────────────────────────────
  const [costInput, setCostInput] = useState('10000');
  const [saleInput, setSaleInput] = useState('25000');
  const [holdPeriod, setHoldPeriod] = useState<'short' | 'long'>('short');
  const [incomeInput, setIncomeInput] = useState('75000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

  // ─── URL State Sync ────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cost')) setCostInput(params.get('cost')!);
    if (params.get('sale')) setSaleInput(params.get('sale')!);
    if (params.get('hold')) setHoldPeriod(params.get('hold') as 'short' | 'long');
    if (params.get('income')) setIncomeInput(params.get('income')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (costInput && costInput !== '10000') params.set('cost', costInput);
    if (saleInput && saleInput !== '25000') params.set('sale', saleInput);
    if (holdPeriod !== 'short') params.set('hold', holdPeriod);
    if (incomeInput && incomeInput !== '75000') params.set('income', incomeInput);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [costInput, saleInput, holdPeriod, incomeInput, filingStatus]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Options ───────────────────────────────────────────────────────
  const holdOptions = [
    { value: 'short', label: 'Less than 1 year (short-term)' },
    { value: 'long', label: 'More than 1 year (long-term)' },
  ];

  const filingOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
    value,
    label,
  }));

  // ─── Calculation ───────────────────────────────────────────────────
  const result = useMemo<CryptoTaxResult | null>(() => {
    const cost = Number(costInput.replace(/[^0-9.]/g, ''));
    const sale = Number(saleInput.replace(/[^0-9.]/g, ''));
    const income = Number(incomeInput.replace(/[^0-9.]/g, '')) || 0;

    if (isNaN(cost) || isNaN(sale)) return null;

    const gain = sale - cost;
    const isLoss = gain < 0;
    const isLongTerm = holdPeriod === 'long';
    const deduction = STD_DEDUCTION[filingStatus];
    const ordinaryTaxableIncome = Math.max(0, income - deduction);
    const totalIncome = income + Math.max(0, gain);

    let federalTax = 0;
    let taxRate = 0;

    if (isLoss) {
      federalTax = 0;
      taxRate = 0;
    } else if (isLongTerm) {
      federalTax = calcLongTermCGTax(gain, ordinaryTaxableIncome, filingStatus);
      taxRate = getLTCGRate(ordinaryTaxableIncome, filingStatus);
    } else {
      federalTax = calcOrdinaryTaxOnRange(ordinaryTaxableIncome, gain, filingStatus);
      taxRate = getMarginalRate(ordinaryTaxableIncome + gain, filingStatus);
    }

    const niit = isLoss ? 0 : calcNIIT(gain, totalIncome, filingStatus);

    const totalTax = federalTax + niit;
    const netAfterTax = sale - totalTax;
    const effectiveRate = gain > 0 ? totalTax / gain : 0;

    // Calculate the alternative scenario (if held the other way)
    let altTax = 0;
    let altNiit = 0;
    if (!isLoss) {
      if (isLongTerm) {
        // Alt = short-term
        altTax = calcOrdinaryTaxOnRange(ordinaryTaxableIncome, gain, filingStatus);
      } else {
        // Alt = long-term
        altTax = calcLongTermCGTax(gain, ordinaryTaxableIncome, filingStatus);
      }
      altNiit = calcNIIT(gain, totalIncome, filingStatus);
    }
    const altTotal = altTax + altNiit;
    const altRate = gain > 0 ? altTotal / gain : 0;

    return {
      costBasis: cost,
      saleProceeds: sale,
      gain,
      isLoss,
      isLongTerm,
      taxRate,
      federalTax,
      niit,
      totalTax,
      netAfterTax,
      effectiveRate,
      altTax,
      altNiit,
      altTotal,
      altRate,
    };
  }, [costInput, saleInput, holdPeriod, incomeInput, filingStatus]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Crypto Transaction Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="cost-basis"
              label="Purchase Price (Cost Basis)"
              value={costInput}
              onChange={setCostInput}
              prefix="$"
              placeholder="10,000"
              helpText="Original purchase price of your crypto"
            />

            <InputField
              id="sale-price"
              label="Sale Price (Proceeds)"
              value={saleInput}
              onChange={setSaleInput}
              prefix="$"
              placeholder="25,000"
              helpText="Amount received when you sold"
            />

            <SelectField
              id="hold-period"
              label="Holding Period"
              value={holdPeriod}
              onChange={(v) => setHoldPeriod(v as 'short' | 'long')}
              options={holdOptions}
              helpText="Determines short-term vs long-term rates"
            />

            <InputField
              id="annual-income"
              label="Annual Income (Other)"
              value={incomeInput}
              onChange={setIncomeInput}
              prefix="$"
              placeholder="75,000"
              helpText="Your other income (W-2, freelance, etc.)"
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
          <div className="space-y-6">
            {/* Hero card */}
            <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-6 text-white shadow-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-navy-200">
                    {result.isLoss ? 'Capital Loss' : 'Capital Gain'}
                  </p>
                  <p
                    className={`tabular-nums mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${result.isLoss ? 'text-red-400' : ''}`}
                  >
                    {formatCurrency(result.gain)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-200">Tax Owed</p>
                  <p className="tabular-nums mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {formatCurrency(result.totalTax)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-200">Net Proceeds</p>
                  <p className="tabular-nums mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {formatCurrency(result.netAfterTax)}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown bar */}
            {!result.isLoss && result.gain > 0 && (
              <BreakdownBar result={result} />
            )}

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
                  <Row label="Cost Basis" value={result.costBasis} />
                  <Row label="Sale Proceeds" value={result.saleProceeds} />
                  <Row
                    label={result.isLoss ? 'Capital Loss' : 'Capital Gain'}
                    value={result.gain}
                    bold
                    color={result.isLoss ? 'red' : undefined}
                  />
                  <Row
                    label="Holding Period"
                    text={result.isLongTerm ? 'Long-term (> 1 year)' : 'Short-term (< 1 year)'}
                  />
                  <Row label="Tax Rate Applied" isPercent value={result.taxRate} />
                  <Row
                    label="Federal Capital Gains Tax"
                    value={-result.federalTax}
                    color="red"
                    show={result.federalTax > 0}
                  />
                  <Row
                    label="Net Investment Income Tax (NIIT, 3.8%)"
                    value={-result.niit}
                    color="red"
                    show={result.niit > 0}
                  />
                  <Row
                    label="Total Tax on Crypto"
                    value={-result.totalTax}
                    color="red"
                    bold
                  />
                  <Row label="Net After Tax" value={result.netAfterTax} bold highlight />
                  <Row
                    label="Effective Tax Rate on Gain"
                    isPercent
                    value={result.effectiveRate}
                    show={result.gain > 0}
                  />
                </tbody>
              </table>
            </div>

            {/* Comparison box */}
            {!result.isLoss && result.gain > 0 && (
              <ComparisonBox result={result} />
            )}

            {/* Informational note */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                IRS Crypto Tax Rules
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Crypto-to-crypto trades, spending crypto, and receiving crypto as payment are all
                taxable events. Report dispositions on Form 8949 and Schedule D. Starting in 2026,
                exchanges must issue Form 1099-DA. Losses can offset gains and up to $3,000 of
                ordinary income per year.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your crypto transaction details to see your tax estimate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Breakdown Bar ─────────────────────────────────────────────────────

function BreakdownBar({ result }: { result: CryptoTaxResult }) {
  const total = result.saleProceeds;
  if (total <= 0) return null;

  const segments = [
    { label: 'Cost Basis', value: result.costBasis, color: 'bg-slate-400' },
    { label: 'Federal Tax', value: result.federalTax, color: 'bg-patriot-500' },
    { label: 'NIIT', value: result.niit, color: 'bg-orange-400' },
    { label: 'Net Gain', value: result.gain - result.totalTax, color: 'bg-success-500' },
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

// ─── Comparison Box ───────────────────────────────────────────────────

function ComparisonBox({ result }: { result: CryptoTaxResult }) {
  const altLabel = result.isLongTerm ? 'short-term' : 'long-term';
  const currentLabel = result.isLongTerm ? 'long-term' : 'short-term';
  const diff = result.altTotal - result.totalTax;
  const isBetter = diff > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        If held {altLabel} instead
      </p>
      <div className="mt-2 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {altLabel.charAt(0).toUpperCase() + altLabel.slice(1)} tax
          </p>
          <p className="tabular-nums mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
            {formatCurrency(result.altTotal)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentLabel.charAt(0).toUpperCase() + currentLabel.slice(1)} tax
          </p>
          <p className="tabular-nums mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
            {formatCurrency(result.totalTax)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Difference</p>
          <p
            className={`tabular-nums mt-0.5 text-sm font-semibold ${
              isBetter
                ? 'text-success-600 dark:text-success-500'
                : diff < 0
                  ? 'text-patriot-600 dark:text-patriot-400'
                  : 'text-slate-900 dark:text-white'
            }`}
          >
            {isBetter ? `You save ${formatCurrency(diff)}` : diff < 0 ? `Costs ${formatCurrency(Math.abs(diff))} more` : 'No difference'}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {result.isLongTerm
          ? 'Holding for more than 1 year qualifies for lower long-term capital gains rates.'
          : 'Holding for more than 1 year would qualify for lower long-term capital gains rates.'}
      </p>
    </div>
  );
}

// ─── Table Row ─────────────────────────────────────────────────────────

function Row({
  label,
  value = 0,
  bold = false,
  highlight = false,
  color,
  show = true,
  isPercent = false,
  text,
}: {
  label: string;
  value?: number;
  bold?: boolean;
  highlight?: boolean;
  color?: 'red';
  show?: boolean;
  isPercent?: boolean;
  text?: string;
}) {
  if (!show) return null;

  const textColor =
    highlight
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
      </td>
      <td
        className={`px-4 py-2.5 text-right ${bold ? 'font-semibold' : 'font-medium'} ${textColor}`}
      >
        {text ?? (isPercent ? formatPercent(value * 100, 1) : formatCurrency(value))}
      </td>
    </tr>
  );
}
