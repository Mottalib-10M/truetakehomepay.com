import { useState, useMemo, useCallback, useEffect } from 'react';
import { formatCurrency, formatPercent } from '../../lib/format-us';
import { FILING_STATUSES, type FilingStatus } from '../../lib/format-us';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// ─── Props ───────────────────────────────────────────────────────────

interface CryptoInvestmentSimulatorProps {
  cryptoName: string;
  cryptoSymbol: string;
  defaultBuyPrice: number;
}

// ─── Constants ────────────────────────────────────────────────────────

const STD_DEDUCTION: Record<FilingStatus, number> = {
  single: 15700, mfj: 31400, mfs: 15700, hoh: 23500,
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
  single: 200000, mfj: 250000, mfs: 125000, hoh: 200000,
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

// ─── Scenario tax calculator ─────────────────────────────────────────

function calcScenarioTax(
  gain: number,
  isLongTerm: boolean,
  income: number,
  filing: FilingStatus
): { federalTax: number; niit: number; totalTax: number } {
  if (gain <= 0) return { federalTax: 0, niit: 0, totalTax: 0 };

  const deduction = STD_DEDUCTION[filing];
  const ordinaryTaxableIncome = Math.max(0, income - deduction);
  const totalIncome = income + gain;

  const federalTax = isLongTerm
    ? calcLongTermCGTax(gain, ordinaryTaxableIncome, filing)
    : calcOrdinaryTaxOnRange(ordinaryTaxableIncome, gain, filing);

  const niit = calcNIIT(gain, totalIncome, filing);
  return { federalTax, niit, totalTax: federalTax + niit };
}

// ─── Result type ─────────────────────────────────────────────────────

interface SimulatorResult {
  totalInvestment: number;
  proceeds: number;
  gain: number;
  isLoss: boolean;
  isLongTerm: boolean;
  taxRate: number;
  federalTax: number;
  niit: number;
  totalTax: number;
  netProfit: number;
  effectiveRate: number;
  altTax: number;
  altNiit: number;
  altTotal: number;
  altRate: number;
  breakEvenPrice: number;
  priceTargets: {
    label: string;
    sellPrice: number;
    gain: number;
    tax: number;
    netProfit: number;
  }[];
}

// ─── Component ────────────────────────────────────────────────────────

export default function CryptoInvestmentSimulator({
  cryptoName,
  cryptoSymbol,
  defaultBuyPrice,
}: CryptoInvestmentSimulatorProps) {
  // ─── State ──────────────────────────────────────────────────────────
  const [buyPrice, setBuyPrice] = useState(defaultBuyPrice.toString());
  const [sellPrice, setSellPrice] = useState((defaultBuyPrice * 1.5).toString());
  const [quantity, setQuantity] = useState('10');
  const [holdPeriod, setHoldPeriod] = useState<'short' | 'long'>('long');
  const [incomeInput, setIncomeInput] = useState('75000');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

  // ─── URL State Sync ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('buy')) setBuyPrice(params.get('buy')!);
    if (params.get('sell')) setSellPrice(params.get('sell')!);
    if (params.get('qty')) setQuantity(params.get('qty')!);
    if (params.get('hold')) setHoldPeriod(params.get('hold') as 'short' | 'long');
    if (params.get('income')) setIncomeInput(params.get('income')!);
    if (params.get('filing')) setFilingStatus(params.get('filing') as FilingStatus);
  }, []);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (buyPrice && buyPrice !== defaultBuyPrice.toString()) params.set('buy', buyPrice);
    if (sellPrice && sellPrice !== (defaultBuyPrice * 1.5).toString()) params.set('sell', sellPrice);
    if (quantity && quantity !== '10') params.set('qty', quantity);
    if (holdPeriod !== 'long') params.set('hold', holdPeriod);
    if (incomeInput && incomeInput !== '75000') params.set('income', incomeInput);
    if (filingStatus !== 'single') params.set('filing', filingStatus);

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [buyPrice, sellPrice, quantity, holdPeriod, incomeInput, filingStatus, defaultBuyPrice]);

  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // ─── Options ────────────────────────────────────────────────────────
  const holdOptions = [
    { value: 'short', label: 'Less than 1 year (short-term)' },
    { value: 'long', label: 'More than 1 year (long-term)' },
  ];

  const filingOptions = Object.entries(FILING_STATUSES).map(([value, label]) => ({
    value,
    label,
  }));

  // ─── Calculation ────────────────────────────────────────────────────
  const result = useMemo<SimulatorResult | null>(() => {
    const buy = Number(buyPrice.replace(/[^0-9.]/g, ''));
    const sell = Number(sellPrice.replace(/[^0-9.]/g, ''));
    const qty = Number(quantity.replace(/[^0-9.]/g, ''));
    const income = Number(incomeInput.replace(/[^0-9.]/g, '')) || 0;

    if (isNaN(buy) || isNaN(sell) || isNaN(qty) || qty <= 0) return null;

    const totalInvestment = buy * qty;
    const proceeds = sell * qty;
    const gain = proceeds - totalInvestment;
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
    const netProfit = gain - totalTax;
    const effectiveRate = gain > 0 ? totalTax / gain : 0;

    // Alternative scenario (short vs long term comparison)
    let altTax = 0;
    let altNiit = 0;
    if (!isLoss) {
      if (isLongTerm) {
        altTax = calcOrdinaryTaxOnRange(ordinaryTaxableIncome, gain, filingStatus);
      } else {
        altTax = calcLongTermCGTax(gain, ordinaryTaxableIncome, filingStatus);
      }
      altNiit = calcNIIT(gain, totalIncome, filingStatus);
    }
    const altTotal = altTax + altNiit;
    const altRate = gain > 0 ? altTotal / gain : 0;

    // Break-even sell price after tax
    const breakEvenPrice = qty > 0 ? buy + (totalTax / qty) : buy;

    // Price target scenarios
    const targetMultipliers = [
      { label: '+25%', mult: 1.25 },
      { label: '+50%', mult: 1.50 },
      { label: '+100%', mult: 2.00 },
      { label: '-25%', mult: 0.75 },
    ];

    const priceTargets = targetMultipliers.map(({ label, mult }) => {
      const targetSellPrice = buy * mult;
      const targetProceeds = targetSellPrice * qty;
      const targetGain = targetProceeds - totalInvestment;
      const { totalTax: targetTax } = calcScenarioTax(targetGain, isLongTerm, income, filingStatus);
      const targetNetProfit = targetGain - targetTax;
      return {
        label,
        sellPrice: targetSellPrice,
        gain: targetGain,
        tax: targetTax,
        netProfit: targetNetProfit,
      };
    });

    return {
      totalInvestment,
      proceeds,
      gain,
      isLoss,
      isLongTerm,
      taxRate,
      federalTax,
      niit,
      totalTax,
      netProfit,
      effectiveRate,
      altTax,
      altNiit,
      altTotal,
      altRate,
      breakEvenPrice,
      priceTargets,
    };
  }, [buyPrice, sellPrice, quantity, holdPeriod, incomeInput, filingStatus]);

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Input panel */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {cryptoName} Investment Details
          </h2>

          <div className="space-y-4">
            <InputField
              id="buy-price"
              label={`Buy Price per ${cryptoSymbol}`}
              value={buyPrice}
              onChange={setBuyPrice}
              prefix="$"
              placeholder={defaultBuyPrice.toLocaleString("en-US")}
              helpText={`Price per ${cryptoSymbol} at time of purchase`}
            />

            <InputField
              id="sell-price"
              label={`Sell Price per ${cryptoSymbol}`}
              value={sellPrice}
              onChange={setSellPrice}
              prefix="$"
              placeholder={(defaultBuyPrice * 1.5).toLocaleString("en-US")}
              helpText={`Target or actual sell price per ${cryptoSymbol}`}
            />

            <InputField
              id="quantity"
              label="Quantity"
              value={quantity}
              onChange={setQuantity}
              suffix={cryptoSymbol}
              placeholder="10"
              helpText={`Number of ${cryptoSymbol} units`}
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
              label="Annual Income"
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
                  <p className="text-sm font-medium text-navy-200">Total Investment</p>
                  <p className="tabular-nums mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {formatCurrency(result.totalInvestment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-200">Proceeds</p>
                  <p className="tabular-nums mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {formatCurrency(result.proceeds)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-200">
                    Net {result.isLoss ? 'Loss' : 'Gain'}
                  </p>
                  <p
                    className={`tabular-nums mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${result.isLoss ? 'text-red-400' : 'text-success-400'}`}
                  >
                    {formatCurrency(result.netProfit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tax breakdown table */}
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
                  <Row label="Total Investment" value={result.totalInvestment} />
                  <Row label="Sale Proceeds" value={result.proceeds} />
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
                  <Row label="Capital Gains Rate" isPercent value={result.taxRate} />
                  <Row
                    label="Federal Tax"
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
                    label="Total Tax"
                    value={-result.totalTax}
                    color="red"
                    bold
                  />
                  <Row label="Net Profit After Tax" value={result.netProfit} bold highlight />
                  <Row
                    label="Effective Tax Rate"
                    isPercent
                    value={result.effectiveRate}
                    show={result.gain > 0}
                  />
                </tbody>
              </table>
            </div>

            {/* Price target scenarios */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Price Target Scenarios
                </p>
              </div>
              <table className="tabular-nums w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600 dark:text-slate-400">
                      Scenario
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                      Sell Price
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                      Gain
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                      Tax
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                      Net Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.priceTargets.map((target) => (
                    <tr key={target.label}>
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                        {target.label}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-slate-100">
                        {formatCurrency(target.sellPrice)}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right ${
                          target.gain < 0
                            ? 'text-patriot-600 dark:text-patriot-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {formatCurrency(target.gain)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-patriot-600 dark:text-patriot-400">
                        {target.tax > 0 ? formatCurrency(-target.tax) : formatCurrency(0)}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold ${
                          target.netProfit >= 0
                            ? 'text-success-600 dark:text-success-500'
                            : 'text-patriot-600 dark:text-patriot-400'
                        }`}
                      >
                        {formatCurrency(target.netProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Short vs Long Term Comparison */}
            {!result.isLoss && result.gain > 0 && (
              <ComparisonBox result={result} />
            )}

            {/* Break-even info box */}
            {result.gain > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Break-Even Sell Price After Tax
                </p>
                <p className="tabular-nums mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(result.breakEvenPrice)}
                  <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                    per {cryptoSymbol}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  You need to sell above this price to break even after paying federal taxes on your
                  gains.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Enter your {cryptoName} investment details to see your simulation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Comparison Box ───────────────────────────────────────────────────

function ComparisonBox({ result }: { result: SimulatorResult }) {
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
